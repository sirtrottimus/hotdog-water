/**
 * Routes for authentication related requests
 * @module routes/auth
 * @category Routes
 * @subcategory Auth
 * @requires express
 * @requires passport
 *
 * @see {@link module:utils/middleware}
 */

import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { TwitchSettingsService } from '../../services/twitch';
import { TwitchSettingsInt } from '../../utils/helpers';

// Destructure environment variables
const {
  DEV_DISCORD_CLIENT_URL,
  PROD_DISCORD_CLIENT_URL,
  PROD_DISCORD_SERVER_URL,
  DEV_DISCORD_SERVER_URL,
} = process.env;

let clientUrl = '';
let serverUrl = '';
let cookie = {};
// Set client and server url based on environment
if (process.env.NODE_ENV === 'production') {
  if (!PROD_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for production');
  }
  if (!PROD_DISCORD_SERVER_URL) {
    throw new Error('[SERVER]: Missing environment variables for production');
  }

  serverUrl = PROD_DISCORD_SERVER_URL;
  clientUrl = PROD_DISCORD_CLIENT_URL;
  cookie = {
    sameSite: 'strict',
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: false,
    domain: '.hatfilms.co.uk',
  };
} else {
  if (!DEV_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for development');
  }
  if (!DEV_DISCORD_SERVER_URL) {
    throw new Error('[SERVER]: Missing environment variables for development');
  }

  serverUrl = DEV_DISCORD_SERVER_URL;
  clientUrl = DEV_DISCORD_CLIENT_URL;
  cookie = {
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: false,
    domain: 'localhost',
  };
}
// Create router
const router = Router();

// Route for authenticating with Discord
router.get(
  '/discord',
  passport.authenticate('discord', {
    scope: ['identify', 'guilds', 'guilds.members.read'],
  })
);

// Route for handling the callback from Discord
router.get('/discord/callback', (req, res, next) => {
  passport.authenticate('discord', (err, user, info) => {
    if (err) {
      return res.redirect(`${clientUrl}/?error=${encodeURIComponent(err)}`);
    }

    if (!user) {
      const error = info?.message || 'Unknown error';
      return res.redirect(
        `${clientUrl}/?error=${encodeURIComponent(error.toString())}`
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.SESSION_SECRET!
    );

    res.cookie('token', token, cookie);

    // If authentication is successful, continue with the successRedirect
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(`${clientUrl}/dashboard`);
    });
  })(req, res, next);
});

//Route for authenticating with Twitch
router.get('/twitch', async (req, res) => {
  const redirectURI = `${serverUrl}/api/auth/twitch/callback`;
  const twitchSettings = await TwitchSettingsService.get();

  if (!twitchSettings.success) {
    return res.status(500).json(twitchSettings);
  }
  const { twitchClientID } = twitchSettings.data as Partial<TwitchSettingsInt>;

  const authURL = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientID}&redirect_uri=${redirectURI}&response_type=code&scope=channel:read:subscriptions+user:read:email+channel:edit:commercial+channel:manage:moderators`;
  res.redirect(authURL);
});

// Route for handling the callback from Twitch
router.get('/twitch/callback', async (req, res) => {
  const { code } = req.query;
  console.log(req.query);
  const twitchSettings = await TwitchSettingsService.get();
  const redirectURI = `${serverUrl}/api/auth/twitch/callback`;
  if (!twitchSettings.success) {
    return res.status(500).json(twitchSettings);
  }
  const { twitchClientID, twitchClientSecret } =
    twitchSettings.data as Partial<TwitchSettingsInt>;

  const url = `https://id.twitch.tv/oauth2/token?client_id=${twitchClientID}&client_secret=${twitchClientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (data.error) {
    return res.status(500).json(data);
  }

  const response2 = await TwitchSettingsService.update({
    body: {
      twitchAccessToken: data.access_token,
      twitchRefreshToken: data.refresh_token,
      twitchTokenExpires: new Date(Date.now() + data.expires_in * 1000),
    },
  });

  console.log(response2);

  const token = jwt.sign(
    {
      twitch: data,
    },
    process.env.SESSION_SECRET!
  );

  res.cookie('token', token, cookie);
  res.redirect(`${clientUrl}/dashboard`);
});

export default router;
