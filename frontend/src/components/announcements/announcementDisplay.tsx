// Individual announcement display component. This component is used to display a single announcement. It is used in the AnnouncementsViewer component.
// Styled using Mantine components.

import {
  Avatar,
  Badge,
  Card,
  Group,
  Text,
  TypographyStylesProvider,
  createStyles,
  rem,
} from '@mantine/core';
import {
  IconBrandDiscordFilled,
  IconBrandTwitch,
  IconBrandTwitterFilled,
} from '@tabler/icons-react';
import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import { AnnouncementInt } from '../../utils/api/AnnouncementService';

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
  },

  body: {
    paddingLeft: rem(54),
    paddingTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
  },

  content: {
    '& > p:last-child': {
      marginBottom: 0,
    },
  },
  card: {
    border: `1px solid ${theme.colorScheme === 'dark' ? '#303030' : '#EAEAEA'}`,
  },
}));

export default function AnnouncementDisplay({
  announcement,
}: {
  announcement: AnnouncementInt;
}) {
  const { classes } = useStyles();
  console.log(announcement);
  return (
    <Card my={15} mx={4} className={classes.card}>
      <Group>
        <Avatar
          src={`https://cdn.discordapp.com/avatars/${announcement.postedBy.discordId}/${announcement.postedBy.avatar}.png`}
          alt={announcement.postedBy.username}
          radius="xl"
          color="violet"
        >
          {announcement.postedBy.username[0].toUpperCase()}
        </Avatar>

        <div>
          <Text fz="sm">
            {announcement.postedBy.username} -
            {announcement.announcementType === 'public'
              ? ' Public '
              : ' Members Only '}
            Announcement
          </Text>
          <Text fz="xs" c="dimmed">
            {dayjs(announcement.createdAt).fromNow()}
          </Text>
        </div>
      </Group>
      <TypographyStylesProvider className={classes.body}>
        <Text lineClamp={3} size={'lg'}>
          {announcement.text}
        </Text>
        <Group mt={20}>
          {announcement.postTo.includes('discord') && (
            <Badge
              size="sm"
              radius={'xs'}
              variant="outline"
              leftSection={<IconBrandDiscordFilled size={10} />}
              sx={{
                borderColor: '#5865F2',
                color: '#5865F2',
              }}
            >
              Posted to Discord
            </Badge>
          )}

          {announcement.postTo.includes('twitter') && (
            <Badge
              size="sm"
              radius={'xs'}
              variant="outline"
              leftSection={<IconBrandTwitterFilled size={10} />}
              sx={{
                borderColor: '#1D9BF0',
                color: '#1D9BF0',
              }}
            >
              Posted to Twitter
            </Badge>
          )}

          {announcement.postTo.includes('Twitch (StreamElements)') && (
            <Badge
              size="sm"
              radius={'xs'}
              variant="outline"
              leftSection={<IconBrandTwitch size={10} />}
              sx={{
                borderColor: '#9146FF',
                color: '#9146FF',
              }}
            >
              Posted to Twitch (StreamElements)
            </Badge>
          )}
        </Group>
      </TypographyStylesProvider>
    </Card>
  );
}
