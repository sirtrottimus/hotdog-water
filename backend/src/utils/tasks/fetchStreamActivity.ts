import cron from 'node-cron';
import Activity from '../../database/schema/Activity';
import { StreamElementsSettings } from '../../database/schema';
import { logIfDebugging } from '../helpers';
import axios from 'axios';
import { Server as ServerIO, Socket } from 'socket.io';

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

// Get the current time
const currentTime = new Date().toTimeString();
// Create a log message for fetching stream activity
const streamActivityLog = `[SCHEDULE/SE]: ${currentTime} - Fetching stream activity...`;

// Function to fetch stream activity
const fetchStreamActivity = async (socket: Socket) => {
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
        `${streamActivityLog} - Stream Elements settings not found. Please set them up for this feature to work.`
      );
      return;
    }

    // Initialize the 'after' date
    let after = new Date();
    // Find the last activity in the database and set 'after' accordingly
    const lastActivity = await Activity.findOne({}).sort({ createdAt: -1 });

    if (!lastActivity) {
      // If there's no last activity, set 'after' to one day ago
      after.setDate(after.getDate() - 1);
    } else {
      // If there's a last activity, set 'after' to its createdAt date
      after = lastActivity.createdAt;
    }

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

    YTActivity.provider = 'youtube';
    TwitchActivity.provider = 'twitch';

    if (!YTActivity || !TwitchActivity) {
      // Log an error message if fetching fails
      logIfDebugging(
        `${streamActivityLog} - Failed to fetch stream activity from Stream Elements API.`
      );
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
            `${streamActivityLog} - Failed to save activity to database.`
          );
          return;
        }

        // send the activity to the frontend via ws
        socket.emit('event', activity);
      }
    }
  } catch (error) {
    // Log an error if there's an exception
    logIfDebugging(
      `${streamActivityLog} - Error in fetchStreamActivity: ${error} - `
    );
  }
};

// Function to start fetching stream activity on a schedule
const startFetchStreamActivity = (io: ServerIO) => {
  logIfDebugging(
    '[SCHEDULE/SE]: Scheduling - Fetching stream activity every 10 minutes...'
  );

  //Join the stream-activity room
  io.on('connection', (socket: Socket) => {
    logIfDebugging(
      `[WEBSOCKET/BACKEND]: Backend Client connected with ID ${socket.id}`
    );

    activeSockets.push({
      socketId: socket.id,
      userId: '123',
      username: 'Backend',
    });

    socket.emit('activeSockets', activeSockets);

    cron.schedule('*/10 * * * *', () => {
      fetchStreamActivity(socket)
        .then((response) => {
          // Optional: You can add a success log here if needed
          console.log('Stream activity fetched successfully.');
          console.log(response);
        })
        .catch((error) => {
          // Handle any errors that occur during fetchStreamActivity
          console.error('Error fetching stream activity :', error);
        });
    });
  });

  // Schedule a cron job to run the fetchStreamActivity function every 10 minutes
};

async function fetchActivity(
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
        offset: '0',
        types: ACTIVITY_TYPES,
      },
    });

    if (!response) {
      // Log an error message if fetching fails
      logIfDebugging(
        `${streamActivityLog} - ${type} Failed to fetch stream activity from Stream Elements API.`
      );
      return;
    }

    // Return the fetched activity data
    return response.data;
  } catch (error) {
    // Log an error if there's an exception
    logIfDebugging(
      `${streamActivityLog} - Error in fetchStreamActivity: ${error} - ${type}`
    );
  }
}

export default startFetchStreamActivity;
