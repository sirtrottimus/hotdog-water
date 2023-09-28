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

// Destructure environment variables
const { DEV_DISCORD_CLIENT_URL, PROD_DISCORD_CLIENT_URL } = process.env;

let clientUrl = '';
let cookie = {};
// Set client and server url based on environment
if (process.env.NODE_ENV === 'production') {
  if (!PROD_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for production');
  }

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

export default router;
