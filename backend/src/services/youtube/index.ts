// Services for handling youtube settings
import { Options } from '../helpers';
import { YoutubeSettings as YoutubeSettingsSchema } from '../../database/schema';

export class YoutubeSettingsService {
  static async get() {
    const youtubeSettings = await YoutubeSettingsSchema.findOne({});

    if (!youtubeSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: youtubeSettings, error: null, msg: null };
  }

  static async create(options: Options) {
    const { body: youtubeSettings } = options;

    if (!youtubeSettings) {
      throw new Error('No Youtube Settings Provided');
    }

    const newYoutubeSettings = await YoutubeSettingsSchema.create(
      youtubeSettings
    );

    if (!newYoutubeSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating Youtube Settings',
      };
    }

    return { success: true, data: newYoutubeSettings, error: null, msg: null };
  }

  static async update(options: Options) {
    const { body: youtubeSettings } = options;

    if (!youtubeSettings) {
      throw new Error('No Youtube Settings Provided');
    }

    const updatedYoutubeSettings = await YoutubeSettingsSchema.findOneAndUpdate(
      {},
      youtubeSettings,
      { new: true }
    );

    if (!updatedYoutubeSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Updating Youtube Settings',
      };
    }

    return {
      success: true,
      data: updatedYoutubeSettings,
      error: null,
      msg: null,
    };
  }

  static async testGet() {
    return {
      success: true,
      data: null,
      error: null,
      msg: null,
    };
  }

  static async testPost() {
    return {
      success: true,
      data: null,
      error: null,
      msg: null,
    };
  }
}
