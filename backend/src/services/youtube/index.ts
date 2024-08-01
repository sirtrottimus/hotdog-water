// Services for handling youtube settings
import { getYouTubeSettings, Options } from '../helpers';
import { YoutubeSettings as YoutubeSettingsSchema } from '../../database/schema';
import { getOAuth2Client } from '../../utils/client';

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
  static async getNewAccessToken() {
    const youtubeSettings = await YoutubeSettingsService.get();

    if (!youtubeSettings.success) {
      return {
        success: false,
        data: null,
        error: 'No Youtube Settings Found',
        msg: 'Error Getting New Access Token',
      };
    }

    const { youtubeRefreshToken, youtubeAccessToken } = youtubeSettings.data!;

    const client = await getOAuth2Client();

    client.setCredentials({
      refresh_token: youtubeRefreshToken,
      access_token: youtubeAccessToken,
    });

    const newAccessToken = await client.refreshAccessToken();

    await YoutubeSettingsSchema.findOneAndUpdate(
      {},
      {
        youtubeAccessToken: newAccessToken.credentials.access_token,
        youtubeTokenExpires: newAccessToken.credentials.expiry_date,
        youtubeRefreshToken: newAccessToken.credentials.refresh_token,
      }
    );
  }

  static async getChannelDetails() {
    try {
      const youtubeSettings = await getYouTubeSettings();

      const { youtubeAccessToken } = youtubeSettings;

      const url =
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${youtubeAccessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: response.statusText,
          msg: 'Error Getting Channel Details',
        };
      }

      const data = await response.json();
      return { success: true, data, error: null, msg: null };
    } catch (error: any) {
      if (error.message.includes('invalid_grant')) {
        return {
          success: false,
          data: null,
          error: 'Invalid Grant: Access Token Expired or Invalid',
          msg: 'Error Getting Channel Details',
        };
      }
      return {
        success: false,
        data: null,
        error: error,
        msg: 'Error Getting Channel Details',
      };
    }
  }
  static async isChannelLive() {
    try {
      const youtubeSettings = await getYouTubeSettings();
      const { youtubeAccessToken } = youtubeSettings;

      const url =
        'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,contentDetails,status&mine=true';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${youtubeAccessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: response.statusText,
          msg: 'Error Checking Live Status',
        };
      }

      const data = await response.json();
      const isLive = data.items[0].status.streamStatus === 'active';
      return { success: true, data: { isLive }, error: null, msg: null };
    } catch (error: any) {
      if (error.message.includes('invalid_grant')) {
        return {
          success: false,
          data: null,
          error: 'Invalid Grant: Access Token Expired or Invalid',
          msg: 'Error Checking Live Status',
        };
      }
      return {
        success: false,
        data: null,
        error: error.message,
        msg: 'Error Checking Live Status',
      };
    }
  }

  static async updateLiveStream(options: Options) {
    const { title, description } = options;
    const youtubeSettings = await getYouTubeSettings();
    const { youtubeAccessToken } = youtubeSettings;

    const url =
      'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,id&mine=true';

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${youtubeAccessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: res.statusText,
        msg: 'Error Updating Live Stream',
      };
    }

    const resData = await res.json();
    console.log(resData);

    const body = {} as any;

    if (resData.id) {
      body.id = resData.items[0].id;
    }

    if (title) {
      body.snippet = { title };
    }

    if (description) {
      body.snippet = { description };
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${youtubeAccessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: 'Error Updating Live Stream',
      };
    }

    const data = await response.json();
    return { success: true, data, error: null, msg: null };
  }

  static async getMemberships(options: Options) {
    const { body } = options;
    const { memberId } = body;

    const youtubeSettings = await getYouTubeSettings();
    const { youtubeAccessToken } = youtubeSettings;

    const url = `https://www.googleapis.com/youtube/v3/membershipsLevels/list?part=snippet&mine=true&filterByMemberChannelId=${memberId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${youtubeAccessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: response.statusText,
        msg: 'Error Getting Memberships',
      };
    }

    const data = await response.json();
    return { success: true, data, error: null, msg: null };
  }
}
