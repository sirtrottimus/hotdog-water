// Services for handling twitch settings
import { Options } from '../helpers';
import { TwitchSettings as TwitchSettingsSchema } from '../../database/schema';

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
}
