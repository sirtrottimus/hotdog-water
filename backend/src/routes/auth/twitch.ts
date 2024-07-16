import { Router } from 'express';
import { TwitchSettingsService } from '../../services/twitch';
import { getEnv, TwitchSettingsInt } from '../../utils/helpers';

const { serverUrl, clientUrl } = getEnv();
const router = Router();

//Route for authenticating with Twitch
router.get('/', async (req, res) => {
  const redirectURI = `${serverUrl}/api/auth/twitch/callback`;
  const twitchSettings = await TwitchSettingsService.get();

  if (!twitchSettings.success) {
    return res.status(500).json(twitchSettings);
  }
  const { twitchClientID } = twitchSettings.data as Partial<TwitchSettingsInt>;

  const scopes = [
    'channel:read:subscriptions',
    'user:read:email',
    'channel:edit:commercial',
    'channel:manage:moderators',
    'channel:manage:broadcast',
    'moderation:read',
  ].join('+');
  const authURL = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientID}&redirect_uri=${redirectURI}&response_type=code&scope=${scopes}`;
  res.redirect(authURL);
});

// Route for handling the callback from Twitch
router.get('/callback', async (req, res) => {
  const { code } = req.query;
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

  TwitchSettingsService.update({
    body: {
      twitchAccessToken: data.access_token,
      twitchRefreshToken: data.refresh_token,
      twitchTokenExpires: new Date(Date.now() + data.expires_in * 1000),
    },
  });
  res.redirect(`${clientUrl}/dashboard`);
});
export default router;
