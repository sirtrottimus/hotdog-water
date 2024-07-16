import { TwitterApi } from 'twitter-api-v2';
import { TwitchSettingsService } from './twitch';
import { TwitchSettingsInt, YoutubeSettingsInt } from '../utils/helpers';
import { YoutubeSettingsService } from './youtube';

export type Options = Record<string, any>;

export type TwitterSettingsInt = {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
};

/**
 * creates a new twitter client with the provided credentials
 * @param consumerKey - Twitter Consumer Key
 * @param consumerSecret - Twitter Consumer Secret
 * @param accessToken - Twitter Access Token
 * @param accessTokenSecret - Twitter Access Token Secret
 * @returns Twitter Client
 */
export function createTwitterClient({
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
}: TwitterSettingsInt) {
  const client = new TwitterApi({
    appKey: consumerKey,
    appSecret: consumerSecret,
    accessToken: accessToken,
    accessSecret: accessTokenSecret,
  });
  return client;
}

export function createTwitterBearerClient(bearerToken: string) {
  const client = new TwitterApi(bearerToken);
  return client;
}

export async function getTwitchSettings() {
  let twitchSettings = await TwitchSettingsService.get();

  const isTokenExpired = () => {
    const currentDate = new Date();
    const expiryDate = twitchSettings.data?.twitchTokenExpires;
    if (!expiryDate) return true;
    return currentDate.getTime() > expiryDate.getTime();
  };

  if (isTokenExpired()) {
    await TwitchSettingsService.getNewAccessToken();
    twitchSettings = await TwitchSettingsService.get();
  }

  const {
    twitchClientID,
    twitchAccessToken,
    twitchClientSecret,
    twitchRefreshToken,
    twitchTokenExpires,
    twitchUsername,
    twitchBroadcasterID,
  } = twitchSettings.data as TwitchSettingsInt;
  return {
    twitchClientID,
    twitchAccessToken,
    twitchClientSecret,
    twitchRefreshToken,
    twitchTokenExpires,
    twitchUsername,
    twitchBroadcasterID,
  };
}

export async function getYouTubeSettings() {
  let youtubeSettings = await YoutubeSettingsService.get();

  const isTokenExpired = () => {
    const currentDate = new Date();
    const expiryDate = youtubeSettings.data?.youtubeTokenExpires;
    if (!expiryDate) return true;
    return currentDate > expiryDate;
  };

  if (isTokenExpired()) {
    await YoutubeSettingsService.getNewAccessToken();
    youtubeSettings = await YoutubeSettingsService.get();
  }
  const {
    youtubeClientID,
    youtubeClientSecret,
    youtubeAccessToken,
    youtubeRefreshToken,
    youtubeTokenExpires,
  } = youtubeSettings.data as YoutubeSettingsInt;
  return {
    youtubeClientID,
    youtubeClientSecret,
    youtubeAccessToken,
    youtubeRefreshToken,
    youtubeTokenExpires,
  };
}
