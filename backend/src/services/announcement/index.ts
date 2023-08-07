// Services for handling discord settings
import { Options, createTwitterClient } from '../helpers';
import {
  Announcement as AnnouncementsSchema,
  DiscordSettings,
  TwitterSettings as TwitterSettingsSchema,
} from '../../database/schema';
import { AnnouncementType } from '../../database/schema/Announcement';
import axios from 'axios';

export class AnnouncementsService {
  static async post(options: Options) {
    const { userId, body: announcement } = options;

    let condition;
    if (announcement.announcementType === 'public') {
      condition = { isAnnouncementWebhook: true };
    }
    if (announcement.announcementType === 'membersOnly') {
      condition = { isMemberOnlyWebhook: true };
    }

    if (announcement.postTo.includes('discord')) {
      try {
        const discordSettings = await DiscordSettings.findOne(condition);

        if (!discordSettings) {
          return {
            success: false,
            data: null,
            error: null,
            msg: 'No Discord Settings Found',
          };
        }
        const params = {
          content: announcement.text,
        };
        try {
          await axios.post(discordSettings.webhookURL, {
            ...params,
            username: discordSettings.botName,
          });
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.code === 'ERR_NETWORK') {
              return Promise.resolve({
                data: {
                  success: false,
                  data: null,
                  error: error,
                },
                success: false,
                error: null,
              });
            }

            return Promise.resolve({
              data: {
                success: false,
                data: null,
                error: error,
              },
              success: false,
              error: null,
            });
          }
        }
      } catch (error) {
        return {
          success: false,
          data: null,
          error: null,
          msg: 'Error Posting to Discord',
        };
      }
    }

    if (announcement.postTo.includes('twitter')) {
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

    const announcements = await AnnouncementsSchema.create<AnnouncementType>({
      ...announcement,
      postedBy: userId,
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
      .populate('postedBy', ['username', 'avatar'])
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
