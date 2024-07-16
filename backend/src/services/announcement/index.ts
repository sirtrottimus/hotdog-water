// Services for handling discord settings
import { Options, createTwitterClient } from '../helpers';
import {
  Announcement as AnnouncementsSchema,
  DiscordSettings,
  StreamElementsSettings as StreamElementsSettingsSchema,
  TwitterSettings as TwitterSettingsSchema,
} from '../../database/schema';
import { AnnouncementType } from '../../database/schema/Announcement';
import axios from 'axios';

type Announcement = {
  text: string;
  postTo: string[];
};

type Error = {
  code: string;
};

export class AnnouncementsService {
  static async post(options: Options) {
    const { userId, body: announcement } = options;

    const handleAxiosError = (error: any) => {
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          data: null,
          error: error,
        };
      }

      return {
        success: false,
        data: null,
        error: error,
      };
    };

    async function postToDiscord(announcement: Announcement) {
      const discordSettings = await DiscordSettings.findOne({
        isAnnouncementWebhook: true,
      });

      if (!discordSettings) {
        return {
          success: false,
          data: null,
          error: null,
          msg: 'No Discord Settings Found',
        };
      }

      try {
        const params = {
          content: announcement.text,
          username: discordSettings.botName,
        };
        await axios.post(discordSettings.webhookURL, params);
      } catch (error) {
        return handleAxiosError(error);
      }
    }

    async function postToTwitter(announcement: Announcement) {
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
      await client.v2.tweet(announcement.text);
    }

    async function postToTwitch(announcement: Announcement) {
      const streamElementsSettings = await StreamElementsSettingsSchema.findOne(
        {}
      );

      if (!streamElementsSettings) {
        return {
          success: false,
          data: null,
          error: null,
          msg: 'No StreamElements Settings Found',
        };
      }

      try {
        await axios.post(
          `https://api.streamelements.com/kappa/v2/bot/${streamElementsSettings.streamElementsTwitchChannelID}/say`,
          {
            message: announcement.text,
          },
          {
            headers: {
              Authorization: `Bearer ${streamElementsSettings.streamElementsTwitchToken}`,
              Accept: 'application/json; charset=utf-8, application/json',
            },
          }
        );
      } catch (error) {
        return handleAxiosError(error);
      }
    }

    async function postToYouTube(announcement: Announcement) {
      const streamElementsSettings = await StreamElementsSettingsSchema.findOne(
        {}
      );

      if (!streamElementsSettings) {
        return {
          success: false,
          data: null,
          error: null,
          msg: 'No StreamElements Settings Found',
        };
      }

      try {
        await axios.post(
          `https://api.streamelements.com/kappa/v2/bot/${streamElementsSettings.streamElementsYTChannelID}/say`,
          {
            message: announcement.text,
          },
          {
            headers: {
              Authorization: `Bearer ${streamElementsSettings.streamElementsYTToken}`,
              Accept: 'application/json; charset=utf-8, application/json',
            },
          }
        );
      } catch (error) {
        return handleAxiosError(error);
      }
    }

    if (announcement.postTo.includes('discord')) {
      await postToDiscord(announcement);
    }

    if (announcement.postTo.includes('twitter')) {
      await postToTwitter(announcement);
    }

    if (announcement.postTo.includes('Twitch (StreamElements)')) {
      await postToTwitch(announcement);
    }
    if (announcement.postTo.includes('YouTube (StreamElements)')) {
      await postToYouTube(announcement);
    }

    const announcements = await AnnouncementsSchema.create<AnnouncementType>({
      ...announcement,
      postedBy: userId,
      announcementType: 'public',
    });

    if (!announcements) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating Announcement',
      };
    }

    return { success: true, data: announcements, error: null, msg: null };
  }

  static async getPaginated(options: Options) {
    const {
      offset,
    }: {
      offset: number;
    } = options.query;
    const announcements = await AnnouncementsSchema.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(offset + 5)
      .populate('postedBy', ['username', 'avatar', 'discordId'])
      .exec();

    const count = await AnnouncementsSchema.countDocuments();
    return {
      success: true,
      data: {
        data: announcements,
        hasMore: count - (offset + 5) > 0,
        count,
      },
      error: null,
      msg: null,
    };
  }
}
