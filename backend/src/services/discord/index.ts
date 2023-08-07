// Services for handling discord settings
import { Options } from '../helpers';
import { DiscordSettings as DiscordSettingsSchema } from '../../database/schema';

export class DiscordSettingsService {
  static async get() {
    const discordSettings = await DiscordSettingsSchema.findOne({});

    if (!discordSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: discordSettings, error: null, msg: null };
  }

  static async getAll() {
    const discordSettings = await DiscordSettingsSchema.find({});
    if (!discordSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: discordSettings, error: null, msg: null };
  }

  static async create(options: Options) {
    const { body: discordSettings } = options;

    if (!discordSettings) {
      throw new Error('No Discord Settings Provided');
    }

    const newDiscordSettings = await DiscordSettingsSchema.create(
      discordSettings
    );

    if (!newDiscordSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating Discord Settings',
      };
    }

    return { success: true, data: newDiscordSettings, error: null, msg: null };
  }

  static async update(options: Options) {
    const { body: discordSettings } = options;

    if (!discordSettings) {
      throw new Error('No Discord Settings Provided');
    }

    const updatedDiscordSettings =
      await DiscordSettingsSchema.findByIdAndUpdate(
        {
          _id: discordSettings._id,
        },
        discordSettings,
        { new: true }
      );

    if (!updatedDiscordSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Updating Discord Settings',
      };
    }

    return {
      success: true,
      data: updatedDiscordSettings,
      error: null,
      msg: null,
    };
  }

  static async delete(options: Options) {
    const { id } = options;

    if (!id) {
      throw new Error('No Discord Settings ID Provided');
    }
    const deletedDiscordSettings =
      await DiscordSettingsSchema.findByIdAndDelete({
        _id: id,
      });

    if (!deletedDiscordSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Deleting Discord Settings',
      };
    }

    return {
      success: true,
      data: deletedDiscordSettings,
      error: null,
      msg: null,
    };
  }
}
