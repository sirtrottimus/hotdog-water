import { Router } from 'express';
import { YoutubeSettingsService } from '../../services/youtube';
import { getOAuth2Client } from '../../utils/client';
import { getEnv } from '../../utils/helpers';

const router = Router();
const { clientUrl } = getEnv();

// Route to initiate Google OAuth2 process
router.get('/', async (req, res) => {
  const client = await getOAuth2Client();
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.upload',
    ],
    prompt: 'consent',
  });
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  res.redirect(authorizeUrl);
});

// OAuth2 callback route
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  console.log('code:', code);
  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    const client = await getOAuth2Client();
    const { tokens } = await client.getToken(code as string);
    client.setCredentials(tokens);

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiryDate = tokens.expiry_date;

    YoutubeSettingsService.update({
      body: {
        youtubeAccessToken: accessToken,
        youtubeRefreshToken: refreshToken,
        youtubeTokenExpires: expiryDate,
      },
    });
    res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Error retrieving access token');
  }
});

export default router;
