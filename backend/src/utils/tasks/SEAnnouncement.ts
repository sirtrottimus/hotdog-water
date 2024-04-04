// a cron job to post to SE every 5 minutes

import axios from 'axios';
import cron from 'node-cron';
import { AnnouncementsService } from '../../services/announcement';
import Activity from '../../database/schema/Activity';
import { logIfDebugging } from '../helpers';

const CRON_SCHEDULE = 5;
const announcement = new AnnouncementsService();

// get a list of unread activities from the database and choose one
const fetchActivity = async () => {
  const activities = await Activity.find({ flagged: false });
  const unreadActivities = activities.filter((activity) => !activity.read);
  const randomActivity =
    unreadActivities[Math.floor(Math.random() * unreadActivities.length)];
  return randomActivity;
};

// post the activity to SE
const postAnnouncement = async () => {
  const random = await fetchActivity();
  const announcementText = `Activity will be read out intermittently during the stream. (Except you ${random.Data.username}, you're banned.)`;
  const postTo = ['Twitch (StreamElements)'];

  try {
    await AnnouncementsService.post({
      userId: 'difwfnewofnweofiewfhn',
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
    await postAnnouncement();
  });

  logIfDebugging(
    `[SCHEDULE/SE]: Scheduled - Posting announcement every ${CRON_SCHEDULE} minutes.`
  );
};

export default startAnnouncement;
