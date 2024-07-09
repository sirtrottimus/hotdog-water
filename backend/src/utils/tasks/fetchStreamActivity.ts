import cron from 'node-cron';
import Activity from '../../database/schema/Activity';
import { StreamElementsSettings } from '../../database/schema';
import { logIfDebugging } from '../helpers';
import axios, { isAxiosError } from 'axios';
import { Server as ServerIO, Socket } from 'socket.io';
import { JWTAuthService } from '../../services/JWTAuth';

type SocketConnection = {
  socketId: string;
  userId: string;
  username: string;
};

const activeSockets: SocketConnection[] = [];

// Define constants for configuration options
const ACTIVITY_LIMIT = '100';
const MIN_CHEER = '0';
const MIN_HOST = '0';
const MIN_SUB = '0';
const MIN_TIP = '0';
const ACTIVITY_TYPES = [
  'follow',
  'host',
  'raid',
  'tip',
  'cheer',
  'subscriber',
  'redemption',
  'event',
  'communityGiftPurchase',
  'membership',
  'member',
];
const CRON_SCHEDULE = 2;

// Create a log message for fetching stream activity
const streamActivityLog = '[SCHEDULE/SE]:';

// Function to fetch stream activity
const fetchStreamActivity = async (io: ServerIO) => {
  // Log the activity if debugging is enabled
  logIfDebugging(streamActivityLog);

  try {
    // Retrieve Stream Elements settings from the database
    const streamElementsSettings = await StreamElementsSettings.findOne({});

    if (!streamElementsSettings) {
      // Log an error message if settings are not found
      logIfDebugging(
        `${streamActivityLog} - Stream Elements settings not found.`
      );
      return;
    }

    // Extract channel ID and JWT from the settings
    const {
      streamElementsYTChannelID: YTchannelID,
      streamElementsYTToken: YTToken,
      streamElementsTwitchChannelID: TwitchChannelID,
      streamElementsTwitchToken: TwitchToken,
    } = streamElementsSettings;

    if (!YTchannelID || !YTToken || !TwitchChannelID || !TwitchToken) {
      // Log an error message if channel ID or JWT is missing
      logIfDebugging(
        `${streamActivityLog} ${new Date().toTimeString()} - Stream Elements settings not found. Please set them up for this feature to work.`
      );
      return;
    }

    // Initialize the 'after' date to the current date and time as midnight
    const after = new Date(new Date().setHours(0, 0, 0, 0));

    // Retrieve the fetched activity data
    const YTActivity = await fetchActivity(
      YTchannelID,
      YTToken,
      after,
      'youtube'
    );
    const TwitchActivity = await fetchActivity(
      TwitchChannelID,
      TwitchToken,
      after,
      'twitch'
    );

    if (YTActivity) {
      YTActivity.provider = 'youtube';
    }
    if (TwitchActivity) {
      TwitchActivity.provider = 'twitch';
    }

    if (!YTActivity && !TwitchActivity) {
      return;
    }

    // Combine the fetched activity data
    const activityData = [...YTActivity, ...TwitchActivity];

    for (const activity of activityData) {
      // Check if the activity already exists in the database
      const existingActivity = await Activity.findOne({ SE_ID: activity._id });

      if (!existingActivity) {
        // If the activity doesn't exist, save it to the database
        const newActivity = await Activity.create({
          SE_ID: activity._id,
          type: activity.type,
          createdAt: activity.createdAt,
          data: activity.data,
          provider: activity.provider,
          flagged: activity.flagged ?? false,
          feedSource: 'schedule',
        });

        if (!newActivity) {
          // Log an error message if saving fails
          logIfDebugging(
            `${streamActivityLog} ${new Date().toTimeString()} - Failed to save activity to database.`
          );
          return;
        }

        // send the activity to the frontend via ws
        io.emit('event', newActivity);
        io.to('stream-activity').emit('event', newActivity);
        return newActivity;
      }
    }
  } catch (error) {
    // Log an error if there's an exception
    logIfDebugging(
      `${streamActivityLog} ${new Date().toTimeString()} - Error in fetchStreamActivity: ${error} - `
    );
  }
};

// Function to start fetching stream activity on a schedule
const startFetchStreamActivity = (io: ServerIO) => {
  logIfDebugging(
    `[SCHEDULE/SE]: Scheduling - Fetching stream activity every ${CRON_SCHEDULE} minutes...`
  );

  cron.schedule(`*/${CRON_SCHEDULE} * * * *`, () => {
    fetchStreamActivity(io)
      .then((res) => {
        // Optional: You can add a success log here if needed
        console.log('Stream activity fetched successfully.');
      })
      .catch((error) => {
        // Handle any errors that occur during fetchStreamActivity
        console.error('Error fetching stream activity :', error);
      });
  });
};

export async function fetchActivity(
  channelID: string,
  jwt: string,
  after: Date,
  type: string
) {
  try {
    // Construct the Stream Elements API URL
    const streamElementsApiUrl = `https://api.streamelements.com/kappa/v2/activities/${channelID}`;

    // Fetch stream activity data from the API
    const response = await axios.get(streamElementsApiUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/json; charset=utf-8, application/json',
      },
      params: {
        after: after.toISOString(),
        before: new Date().toISOString(),
        limit: ACTIVITY_LIMIT,
        mincheer: MIN_CHEER,
        minhost: MIN_HOST,
        minsub: MIN_SUB,
        mintip: MIN_TIP,
        origin: 'feed',
        types: ACTIVITY_TYPES,
      },
    });

    if (!response) {
      // Log an error message if fetching fails
      logIfDebugging(
        `${streamActivityLog} ${new Date().toTimeString()} - ${type} Failed to fetch stream activity from Stream Elements API. (198)`
      );
      return;
    }

    return response.data;
  } catch (error) {
    const res = await JWTAuthService.getActive();

    if (!res.success) {
      logIfDebugging(
        `${streamActivityLog} ${new Date().toTimeString()} - Failed to fetch JWT Auth status from database for ${type}`
      );
    }

    const { data: jwtAuth } = res;

    if (!jwtAuth) {
      logIfDebugging(
        `${streamActivityLog} ${new Date().toTimeString()} - Failed to fetch JWT Auth status from database for ${type}`
      );
      return;
    }

    const exists = jwtAuth.some(
      (token) => token.status === 'active' && token.provider === type
    );

    if (exists) {
      logIfDebugging(
        `${streamActivityLog} ${new Date().toTimeString()} - JWT Auth token notification is active for ${type}`
      );
      return;
    }

    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        logIfDebugging(
          `${streamActivityLog} - JWT Auth token is invalid for ${type}`
        );
        const { data } = await JWTAuthService.create({
          body: {
            createdAt: new Date(),
            read: false,
            status: 'active',
            provider: type,
          },
        });
        if (!data) {
          logIfDebugging(
            `${streamActivityLog} ${new Date().toTimeString()} - Failed to create JWT Auth token for ${type}`
          );
        }
      }
      return;
    }
    logIfDebugging(
      `${streamActivityLog} ${new Date().toTimeString()} - Error in fetchStreamActivity: ${error} - ${type}`
    );
  }
}

export default startFetchStreamActivity;
