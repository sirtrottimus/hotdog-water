import { Box, Flex, Paper, Text, createStyles } from '@mantine/core';
import React from 'react';
import socket from '../../utils/sockets/backendSocket';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { IconCheck } from '@tabler/icons-react';
import { decodeHtmlEntities } from '../../utils/helpers';

dayjs.extend(calendar);

export interface EventInt {
  eventName: string;
  [key: string]: any;
}

const useStyles = createStyles((theme) => {
  return {
    activityContainer: {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[8]
          : theme.colors.gray[0],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      border: `2px solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }`,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      maxHeight: '50vh',
      scrollbarWidth: 'thin',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    markAsRead: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0 3px 3px 0',
      width: '40px',
      backgroundColor: '#2f9e44',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#2b8a3e',
      },
    },
  };
});

function RenderSubscriberEvent(
  result: any,
  handleMarkAsRead: (id: string) => void
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { tier, displayName, amount } = result.data;
  const tierText =
    tier === 'prime' ? (
      <>
        with{' '}
        <Text span inline c={'#6f48b6'} fw={'bold'}>
          Prime
        </Text>
      </>
    ) : tier === '1000' ? (
      <>
        at{' '}
        <Text span inline c={'#6f48b6'} fw={'bold'}>
          Tier 1
        </Text>
      </>
    ) : tier === '2000' ? (
      <>
        at{' '}
        <Text span inline c={'#6f48b6'} fw={'bold'}>
          Tier 2
        </Text>
      </>
    ) : tier === '3000' ? (
      <>
        at{' '}
        <Text span inline c={'#6f48b6'} fw={'bold'}>
          Tier 3
        </Text>
      </>
    ) : (
      ''
    );

  if (result.data.message?.includes('gifted')) {
    return <></>;
  }

  return (
    <Paper mb={10}>
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid #6f48b6',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>

          <Text>
            <b>{displayName}</b> Subbed for{' '}
            <b>
              {amount} {amount === 1 ? 'month' : 'months'}
            </b>{' '}
            {tierText}
          </Text>
          {result.data.message && (
            <Text mt={10}>
              Saying: <b>{decodeHtmlEntities(result.data.message)}</b>
            </Text>
          )}
        </Box>
        <Box
          onClick={() => handleMarkAsRead(result._id)}
          className={`${classes.markAsRead}`}
        >
          <IconCheck size={20} />
        </Box>
      </Flex>
    </Paper>
  );
}

function RenderCommunityGiftPurchaseEvent(
  result: any,
  handleMarkAsRead: (id: string) => void
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { displayName, quantity } = result.data;
  const tierText = ''; // You can customize this if needed for this specific event type.

  return (
    <Paper mb={10}>
      {' '}
      {/* Add the Paper component */}
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid #6f48b6',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>
          <Text>
            <b>{displayName}</b> Gifted <b>{quantity}</b> Subs. Remember to
            thank them in chat! {tierText}
          </Text>
        </Box>
        <Box
          onClick={() => handleMarkAsRead(result._id)}
          className={`${classes.markAsRead}`}
        >
          <IconCheck size={20} />
        </Box>
      </Flex>
    </Paper>
  );
}

function RenderRaidEvent(
  result: any,
  handleMarkAsRead: (id: string) => void
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { displayName, amount } = result.data;
  const tierText = ''; // You can customize this if needed for this specific event type.

  return (
    <Paper mb={10}>
      {' '}
      {/* Add the Paper component */}
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid #6f48b6',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>
          <Text>
            <b>{displayName}</b> Raided with <b>{amount}</b> Viewers {tierText}
          </Text>
        </Box>
        <Box
          onClick={() => handleMarkAsRead(result._id)}
          className={`${classes.markAsRead}`}
        >
          <IconCheck size={20} />
        </Box>
      </Flex>
    </Paper>
  );
}

function RenderCheerEvent(
  result: any,
  handleMarkAsRead: (id: string) => void
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { displayName, amount } = result.data;
  let tierText = <></>; // You can customize this if needed for this specific event type.
  switch (true) {
    case amount < 100:
      tierText = (
        <Text span color={'#959595'}>
          {amount}
        </Text>
      );
      break;
    case amount < 1000:
      tierText = (
        <Text span color={'#8437c5'}>
          {amount}
        </Text>
      );
      break;
    case amount < 5000:
      tierText = (
        <Text span color={'#48b2a4'}>
          {amount}
        </Text>
      );
      break;
    case amount < 10000:
      tierText = (
        <Text span color={'#419afb'}>
          {amount}
        </Text>
      );
      break;
    case amount < 25000:
      tierText = (
        <Text span color={'#d32627'}>
          {amount}
        </Text>
      );
      break;
    default:
      tierText = (
        <Text span color={'#f7d002'}>
          {amount}
        </Text>
      );
      break;
  }

  return (
    <Paper mb={10}>
      {' '}
      {/* Add the Paper component */}
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid #6f48b6',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>
          <Text>
            <b>{displayName}</b> Cheered <b>{tierText}</b> Bits
          </Text>
        </Box>
        <Box
          onClick={() => handleMarkAsRead(result._id)}
          className={`${classes.markAsRead}`}
        >
          <IconCheck size={20} />
        </Box>
      </Flex>
    </Paper>
  );
}

function RenderTipEvent(
  result: any,
  handleMarkAsRead: (id: string) => void
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { username, amount } = result.data;

  return (
    <Paper mb={10}>
      {' '}
      {/* Add the Paper component */}
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid #6f48b6',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>
          <Text>
            <b>{username}</b> Tipped <b>{amount}</b>
          </Text>
        </Box>
        <Box
          onClick={() => handleMarkAsRead(result._id)}
          className={`${classes.markAsRead}`}
        >
          <IconCheck size={20} />
        </Box>
      </Flex>
    </Paper>
  );
}

function RenderDefaultEvent(
  result: any,
  type: string,
  handleMarkAsRead: (id: string) => void
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { displayName, amount, username } = result.data;
  const tierText = ''; // You can customize this if needed for this specific event type.

  return (
    <Paper mb={10}>
      {' '}
      {/* Add the Paper component */}
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid #6f48b6',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>
          <Text>
            <b>
              {displayName} {username} {type} {amount}
            </b>{' '}
            {tierText}
          </Text>
        </Box>
        <Box
          onClick={() => handleMarkAsRead(result._id)}
          className={`${classes.markAsRead}`}
        >
          <IconCheck size={20} />
        </Box>
      </Flex>
    </Paper>
  );
}
// TODO: Add more events.

export default function Activity(event: EventInt): JSX.Element | null {
  const { eventName, type, data: activity } = event;

  const handleMarkAsRead = (id: string) => {
    socket.emit('event:read', { _id: id });
  };

  if (eventName === 'event:test') {
    return (
      <div>
        <p>Test Event Received: {activity.data}</p>
      </div>
    );
  }

  if (eventName === 'event:test_room') {
    return (
      <div>
        <p>Test Room Event Received - Sent By: {activity.data}</p>
      </div>
    );
  }

  if (eventName === 'event' || eventName === 'event:initial') {
    switch (type) {
      case 'subscriber':
        return RenderSubscriberEvent(activity, handleMarkAsRead);
      case 'communityGiftPurchase':
        return RenderCommunityGiftPurchaseEvent(activity, handleMarkAsRead);
      case 'raid':
        return RenderRaidEvent(activity, handleMarkAsRead);
      case 'cheer':
        return RenderCheerEvent(activity, handleMarkAsRead);
      case 'tip':
        return RenderTipEvent(activity, handleMarkAsRead);
      default:
        return RenderDefaultEvent(activity, type, handleMarkAsRead);
    }
  }

  return null;
}
