import { DefaultMantineColor } from '@mantine/core';
import { TwitchSettingsInt } from './api/TwitchService';

/**
 * Escapes regex special characters
 * @param value - string to escape
 * @returns escaped string
 */
function escapeRegex(value: string) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
}

/**
 * Highlights string with provided highlight string or array of strings
 * @param value - string to highlight
 * @param _highlight - string or array of strings to highlight
 * @param highlightColor - color to highlight string with
 * @returns array of chunks with highlighted flag and highlight color
 */
export function highlighter({
  value,
  _highlight,
  highlightColor,
}: {
  value: string;
  _highlight: string | string[];
  highlightColor?: DefaultMantineColor | DefaultMantineColor[];
}): {
  chunk: string;
  highlighted: boolean;
  highlightColor: DefaultMantineColor;
}[] {
  if (_highlight == null) {
    return [{ chunk: value, highlighted: false, highlightColor: '' }];
  }

  const highlight = Array.isArray(_highlight)
    ? _highlight.map(escapeRegex)
    : escapeRegex(_highlight);

  const shouldHighlight = Array.isArray(highlight)
    ? highlight.filter((part) => part.trim().length > 0).length > 0
    : highlight.trim() !== '';

  if (!shouldHighlight) {
    return [{ chunk: value, highlighted: false, highlightColor: '' }];
  }

  const matcher =
    typeof highlight === 'string'
      ? highlight.trim()
      : highlight
          .filter((part) => part.trim().length !== 0)
          .map((part) => part.trim())
          .join('|');

  const re = new RegExp(`(${matcher})`, 'g');
  const chunks = value
    .split(re)
    .map((part) => ({
      chunk: part,
      highlighted: re.test(part),
      highlightColor: highlightColor
        ? highlightColor[_highlight.indexOf(part)]
        : '',
    }))
    .filter(({ chunk }) => chunk);

  return chunks;
}

/**
 * Takes in a number and rounds it to 2 decimal places.
 * @param num - number to be rounded
 * @returns rounded number to 2 decimal places
 *
 * Todo: make this function more generic
 * Todo: add option to round to nearest x
 */
export const roundUp = (num: number, toFixed = 2): number =>
  // To round to nearest x, change to fixed(x)
  +(Math.round((num + Number.EPSILON) * 100) / 100).toFixed(toFixed);

export const roundDown = (num: number, toFixed = 2): number =>
  +(Math.floor((num + Number.EPSILON) * 100) / 100).toFixed(toFixed);

export function capitalizeFirstLetter(input: string) {
  const firstLetter = input.charAt(0).toUpperCase();
  const restOfString = input.slice(1).toLowerCase();
  return firstLetter + restOfString;
}

export function getAPIUrl() {
  let API_URL = '';
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.DEV_API_URL) {
      throw new Error('Missing DEV_API_URL environment variable');
    }
    API_URL = 'http://localhost:6969';
  } else {
    if (!process.env.PROD_API_URL) {
      throw new Error('Missing PROD_API_URL environment variable');
    }
    API_URL = 'https://api.hatfilms.co.uk';
  }
  return API_URL;
}

/**
 * Checks if a Twitch channel is live
 * @param twitchClientID - Twitch Client ID
 * @param twitchClientSecret - Twitch Client Secret
 * @param twitchUsername - Twitch Username
 * @returns Promise with success flag, data and error message (if any)
 *
 * Todo: Look into replacing with websocket connection. See https://dev.twitch.tv/docs/api/webhooks-reference
 */
export async function checkTwitchStatus({
  twitchClientID,
  twitchClientSecret,
  twitchUsername,
}: TwitchSettingsInt) {
  // Set up Twitch API
  const twitchAuthUrl = 'https://id.twitch.tv/oauth2/token';
  const twitchStreamUrl = 'https://api.twitch.tv/helix/streams';

  const authResponse = await fetch(twitchAuthUrl, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: twitchClientID,
      client_secret: twitchClientSecret,
      grant_type: 'client_credentials',
    }),
  });

  type AuthData = {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  type StreamData = {
    data: {
      id: string;
      user_id: string;
      user_name: string;
      game_id: string;
      type: string;
      title: string;
      viewer_count: number;
      started_at: string;
      language: string;
      thumbnail_url: string;
      tag_ids: string[];
    }[];
  };

  const authData = (await authResponse.json()) as AuthData;
  const twitchToken = authData.access_token;

  const streamResponse = await fetch(
    `${twitchStreamUrl}?user_login=${twitchUsername}`,
    {
      headers: {
        'Client-ID': twitchClientID,
        Authorization: `Bearer ${twitchToken}`,
      },
    }
  );

  const streamData = (await streamResponse.json()) as StreamData;
  return {
    isLive: streamData.data[0]?.type === 'live',
    streamData: streamData,
  };
}

export function decodeHtmlEntities(message: string): string {
  return message.replace(/&(#?[\w\d]+);/g, (match, entity) => {
    if (entity.startsWith('#')) {
      const code = entity.substr(1);
      return String.fromCharCode(parseInt(code, 10));
    } else {
      const entities: Record<string, string> = {
        quot: '"',
        lt: '<',
        gt: '>',
        amp: '&',
        // Add more named entities as needed
      };
      return entities[entity] || match;
    }
  });
}
