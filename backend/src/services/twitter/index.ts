// Services for handling twitter settings
import { Options, createTwitterClient } from '../helpers';
import { TwitterSettings as TwitterSettingsSchema } from '../../database/schema';

export class TwitterSettingsService {
  static async get() {
    const twitterSettings = await TwitterSettingsSchema.findOne({});

    if (!twitterSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: twitterSettings, error: null, msg: null };
  }

  static async create(options: Options) {
    const { body: twitterSettings } = options;

    if (!twitterSettings) {
      throw new Error('No Twitter Settings Provided');
    }

    const newTwitterSettings = await TwitterSettingsSchema.create(
      twitterSettings
    );

    if (!newTwitterSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating Twitter Settings',
      };
    }

    return { success: true, data: newTwitterSettings, error: null, msg: null };
  }

  static async update(options: Options) {
    const { body: twitterSettings } = options;

    if (!twitterSettings) {
      throw new Error('No Twitter Settings Provided');
    }

    const updatedTwitterSettings = await TwitterSettingsSchema.findOneAndUpdate(
      {},
      twitterSettings,
      { new: true }
    );

    if (!updatedTwitterSettings) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Updating Twitter Settings',
      };
    }

    return {
      success: true,
      data: updatedTwitterSettings,
      error: null,
      msg: null,
    };
  }

  static async testGet() {
    const twitterSettings = await TwitterSettingsSchema.findOne({});

    if (!twitterSettings?.consumerKey) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Testing Twitter Settings',
      };
    }
    const client = createTwitterClient(twitterSettings);
    const response = await client.v2.me();

    return {
      success: true,
      data: response,
      error: null,
      msg: null,
    };
  }

  static async testPost() {
    const twitterSettings = await TwitterSettingsSchema.findOne({});

    if (!twitterSettings?.consumerKey) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Testing Twitter Settings',
      };
    }
    const client = createTwitterClient(twitterSettings);
    const response = await client.v2.tweet(
      'This is a test tweet from the backend API using the Twitter API v2'
    );

    return {
      success: true,
      data: response,
      error: null,
      msg: null,
    };
  }
}
