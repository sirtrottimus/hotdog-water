import { OAuth2Client } from 'google-auth-library';
import { getEnv } from './helpers';
import { YoutubeSettingsService } from '../services/youtube';

const { serverUrl } = getEnv();

let client: OAuth2Client | null = null;

export const getOAuth2Client = async (): Promise<OAuth2Client> => {
  if (!client) {
    const settings = await YoutubeSettingsService.get();

    if (!settings.success || !settings.data) {
      throw new Error('No Youtube settings found');
    }

    client = new OAuth2Client({
      clientId: settings.data.youtubeClientID,
      clientSecret: settings.data.youtubeClientSecret,
      redirectUri: `${serverUrl}/api/auth/youtube/callback`,
    });
  }
  return client;
};
