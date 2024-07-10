// a cron job to post to SE every 5 minutes
import cron from 'node-cron';
import { AnnouncementsService } from '../../services/announcement';
import Activity from '../../database/schema/Activity';
import { checkTwitchStatus, logIfDebugging } from '../helpers';
import { TwitchSettingsService } from '../../services/twitch';

const CRON_SCHEDULE = 5;

// get a list of unread activities from the database and choose one
const fetchActivity = async (): Promise<any> => {
  const activities = await Activity.find({ flagged: false });
  const unreadActivities = activities.filter(
    (activity) =>
      !activity.read &&
      activity.provider === 'twitch' &&
      activity.type !== 'follow'
  );
  const randomActivity =
    unreadActivities[Math.floor(Math.random() * unreadActivities.length)];
  if (randomActivity.data.username) return randomActivity;
  else return fetchActivity();
};

const funnyQuips = [
  "I can't believe you're still here.",
  'You really wrote that in chat?',
  'You really thought that was funny?',
  "That's just not funny.",
  "You can't joke about that anymore.",
  "I'm not laughing.",
  'Engaging with chat is important, but maybe not like that.',
  "I'm not sure what you're trying to say.",
];

// post the activity to SE
const postAnnouncement = async () => {
  console.log('Posting announcement to SE');
  const random = await fetchActivity();
  if (!random.data.username) {
    random.data.username = 'Chucklehead';
  }
  const announcementText = `Activity will be read out intermittently during the stream. (Except you ${
    random.data.username ?? random.data.displayName
  }, ${funnyQuips[Math.floor(Math.random() * funnyQuips.length)]})`;
  const postTo = ['Twitch (StreamElements)'];

  try {
    await AnnouncementsService.post({
      userId: '64b6b3342319df1cd7f49256',
      body: {
        text: announcementText,
        postTo,
      },
    });
  } catch (error) {
    console.error('Error posting announcement:', error);
  }
};

// schedule the announcement
const startAnnouncement = () => {
  logIfDebugging(
    `[SCHEDULE/SE]: Scheduling - Posting announcement every ${CRON_SCHEDULE} minutes...`
  );

  cron.schedule(`*/${CRON_SCHEDULE} * * * *`, async () => {
    // check if live
    const settings = await TwitchSettingsService.get();
    const { twitchClientID, twitchClientSecret, twitchUsername } =
      settings.data!;
    const res = checkTwitchStatus({
      twitchClientID,
      twitchClientSecret,
      twitchUsername,
    });

    if (!res) {
      console.error('Error checking Twitch status');
      return;
    }

    if (!(await res).isLive) {
      console.log('Not live');
      return;
    }

    postAnnouncement()
      .then(() => {
        logIfDebugging('[SCHEDULE/SE]: Scheduled - Posted announcement to SE.');
      })
      .catch((error) => {
        console.error('Error posting announcement:', error);
      });
  });

  logIfDebugging(
    `[SCHEDULE/SE]: Scheduled - Posting announcement every ${CRON_SCHEDULE} minutes.`
  );
};

export default startAnnouncement;
