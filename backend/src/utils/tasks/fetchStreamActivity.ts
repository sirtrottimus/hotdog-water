import cron from 'node-cron';
import Activity from '../../database/schema/Activity';
import { StreamElementsSettings } from '../../database/schema';
import { logIfDebugging } from '../helpers';
import axios from 'axios';

// Define constants for configuration options
const ACTIVITY_LIMIT = '100';
const MIN_CHEER = '0';
const MIN_HOST = '0';
const MIN_SUB = '0';
const MIN_TIP = '0';
const ACTIVITY_TYPES = [
  'host',
  'raid',
  'tip',
  'cheer',
  'subscriber',
  'redemption',
  'event',
];

// Function to fetch stream activity
const fetchStreamActivity = async () => {
  // Get the current time
  const currentTime = new Date().toLocaleTimeString();
  // Create a log message for fetching stream activity
  const streamActivityLog = `[SCHEDULE/SE]: ${currentTime} - Fetching stream activity...`;

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
    const { streamElementsChannelID: channelID, streamElementsToken: jwt } =
      streamElementsSettings;

    if (!channelID || !jwt) {
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
        `${streamActivityLog} - Failed to fetch stream activity from Stream Elements API.`
      );
      return;
    }

    // Retrieve the fetched activity data
    const activityData = await response.data;

    for (const activity of activityData) {
      // Check if the activity already exists in the database
      const existingActivity = await Activity.findOne({ SE_ID: activity._id });

      if (!existingActivity) {
        // If the activity doesn't exist, save it to the database
        await Activity.create({
          SE_ID: activity._id,
          type: activity.type,
          createdAt: activity.createdAt,
          data: activity.data,
          provider: activity.provider,
          flagged: activity.flagged,
          feedSource: 'schedule',
        });
      }
    }
  } catch (error) {
    // Log an error if there's an exception
    logIfDebugging(
      `${streamActivityLog} - Error in fetchStreamActivity: ${error}`
    );
  }
};

// Function to start fetching stream activity on a schedule
const startFetchStreamActivity = () => {
  // Schedule a cron job to run the fetchStreamActivity function every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    fetchStreamActivity()
      .then(() => {
        // Optional: You can add a success log here if needed
        console.log('Stream activity fetch scheduled successfully.');
      })
      .catch((error) => {
        // Handle any errors that occur during fetchStreamActivity
        console.error('Error scheduling stream activity fetch:', error);
      });
  });
};

export default startFetchStreamActivity;
