// Services for handling twitch settings
import { Options } from '../helpers';
import { TwitchSettings as TwitchSettingsSchema } from '../../database/schema';
import { TwitchSettingsInt } from '../../utils/helpers';
import { urlencoded } from 'express';

export class TwitchSettingsService {
  static async get() {
    const twitchSettings = await TwitchSettingsSchema.findOne({});

    if (!twitchSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: twitchSettings, error: null, msg: null };
  }

  static async create(options: Options) {
    const { body: twitchSettings } = options;

    if (!twitchSettings) {
      throw new Error('No Twitch Settings Provided');
    }

    const newTwitchSettings = await TwitchSettingsSchema.create(twitchSettings);

    if (!newTwitchSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating Twitch Settings',
      };
    }

    return { success: true, data: newTwitchSettings, error: null, msg: null };
  }

  static async update(options: Options) {
    const { body: twitchSettings } = options;

    if (!twitchSettings) {
      throw new Error('No Twitch Settings Provided');
    }

    const updatedTwitchSettings = await TwitchSettingsSchema.findOneAndUpdate(
      {},
      twitchSettings,
      { new: true }
    );

    if (!updatedTwitchSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Updating Twitch Settings',
      };
    }

    return {
      success: true,
      data: updatedTwitchSettings,
      error: null,
      msg: null,
    };
  }

  static async runAd(options: Options) {
    const adURL = 'https://api.twitch.tv/helix/channels/commercial';
    const adDuration = 30;
    // Get Twitch Settings
    let twitchSettings = await TwitchSettingsService.get();

    if (
      new Date(new Date().getDay() + 1) >
      twitchSettings.data?.twitchTokenExpires!
    ) {
      await TwitchSettingsService.getNewAccessToken();
      twitchSettings = await TwitchSettingsService.get();
    }

    const { twitchClientID, twitchAccessToken } =
      twitchSettings.data as Partial<TwitchSettingsInt>;

    const adSettings = {
      broadcaster_id: '21945983',
      length: adDuration,
    };

    const response = await fetch(adURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': twitchClientID!,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
      body: JSON.stringify(adSettings),
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: 'Error Running Ad',
      };
    }

    console.log(response);

    return { success: true, data: null, error: null, msg: null };
  }

  static async searchCategories(options: Options) {
    const { query } = options;

    const searchURL = `https://api.twitch.tv/helix/search/categories?query=${query}`;

    let twitchSettings = await TwitchSettingsService.get();

    if (
      new Date(new Date().getDay() + 1) >
      twitchSettings.data?.twitchTokenExpires!
    ) {
      console.log('Getting New Access Token');
      await TwitchSettingsService.getNewAccessToken();
      twitchSettings = await TwitchSettingsService.get();
    }

    const { twitchClientID, twitchAccessToken } =
      twitchSettings.data as Partial<TwitchSettingsInt>;

    const response = await fetch(searchURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': twitchClientID!,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: 'Error Searching Categories',
      };
    }

    const data = await response.json();

    return { success: true, data, error: null, msg: null };
  }

  static async updateChannel(options: Options) {
    const { gameName, title } = options;

    let gameID = null;
    if (gameName) {
      const response = await TwitchSettingsService.searchCategories({
        query: gameName,
      });
      gameID = response.data.data[0].id;
    }

    const URL = 'https://api.twitch.tv/helix/channels?broadcaster_id=21945983';

    let twitchSettings = await TwitchSettingsService.get();

    if (
      new Date(new Date().getDay() + 1) >
      twitchSettings.data?.twitchTokenExpires!
    ) {
      console.log('Getting New Access Token');
      await TwitchSettingsService.getNewAccessToken();
      twitchSettings = await TwitchSettingsService.get();
    }

    const { twitchClientID, twitchAccessToken } =
      twitchSettings.data as Partial<TwitchSettingsInt>;

    const channelSettings = {} as any;

    // if (gameID) {
    //   channelSettings.game_id = gameID;
    // }
    if (title) {
      channelSettings.title = title;
    }

    console.log(twitchClientID, twitchAccessToken, channelSettings);

    const response = await fetch(URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': twitchClientID!,
        Authorization: `Bearer ${twitchAccessToken}`,
      },
      body: JSON.stringify(channelSettings),
    });

    console.log(response);

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: 'Error Updating Channel',
      };
    }

    return { success: true, data: null, error: null, msg: null };
  }

  static async getNewAccessToken() {
    const twitchSettings = await TwitchSettingsService.get();
    const { twitchClientID, twitchClientSecret, twitchRefreshToken } =
      twitchSettings.data as Partial<TwitchSettingsInt>;

    const URL = `https://id.twitch.tv/oauth2/token?client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=refresh_token&refresh_token=${encodeURIComponent(
      twitchRefreshToken!
    )}`;

    const response = await fetch(URL, {
      method: 'POST',
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: 'Error Getting Access Token',
      };
    }

    const data = await response.json();

    await TwitchSettingsService.update({
      body: {
        twitchAccessToken: data.access_token,
        twitchRefreshToken: data.refresh_token,
        twitchTokenExpires: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    return { success: true, data, error: null, msg: null };
  }
}
