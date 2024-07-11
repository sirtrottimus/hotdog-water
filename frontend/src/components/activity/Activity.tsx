import { Box, Flex, Paper, Text, createStyles } from '@mantine/core';
import React from 'react';
import socket from '../../utils/sockets/backendSocket';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { IconCheck } from '@tabler/icons-react';
import { decodeHtmlEntities, sentenceToEmoji } from '../../utils/helpers';

dayjs.extend(calendar);

const symbolMap: { [key: string]: string } = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: '$',
  AUD: '$',
  NZD: '$',
  CHF: 'Fr',
  SEK: 'kr',
  DKK: 'kr',
  ISK: 'kr',
  NOK: 'kr',
  JPY: '¥',
  KRW: '₩',
  CNY: '¥',
  INR: '₹',
  RUB: '₽',
  TRY: '₺',
  BRL: 'R$',
  IDR: 'Rp',
  MYR: 'RM',
  PHP: '₱',
  SGD: '$',
  THB: '฿',
  VND: '₫',
  ZAR: 'R',
  HKD: '$',
  TWD: 'NT$',
  PLN: 'zł',
  ILS: '₪',
};

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
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { tier, displayName, amount, username } = result.data;
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

  if (result.data.gifted) {
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
              <b>{result.data.sender}</b> Gifted <b> a sub</b> to {displayName}{' '}
              at {tierText} What a nice person!
            </Text>
          </Box>
          {canDismissActivity && (
            <Box
              onClick={() => handleMarkAsRead(result._id)}
              className={`${classes.markAsRead}`}
            >
              <IconCheck size={20} />
            </Box>
          )}
        </Flex>
      </Paper>
    );
  }

  if (result.provider && result.provider === 'twitch') {
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
            {result.data.message ? (
              <Text mt={10}>
                Saying:{' '}
                <b>
                  {sentenceToEmoji(decodeHtmlEntities(result.data.message))}
                </b>
              </Text>
            ) : (
              <Text mt={10} c={'dimmed'}>
                They left no message
              </Text>
            )}
          </Box>
          {canDismissActivity && (
            <Box
              onClick={() => handleMarkAsRead(result._id)}
              className={`${classes.markAsRead}`}
            >
              <IconCheck size={20} />
            </Box>
          )}
        </Flex>
      </Paper>
    );
  }

  if (result.provider && result.provider === 'youtube') {
    return (
      <Paper mb={10}>
        <Flex align={'stretch'} justify={'space-between'}>
          <Box
            style={{
              padding: '10px 20px 10px 20px',
              borderLeft: '3px solid red',
            }}
          >
            <Text size={'sm'} c={'dimmed'}>
              {dayjs(result.createdAt).calendar()}
            </Text>

            <Text>
              <b>{(username as string).truncateSecondName()}</b> subscribed on
              YouTube
            </Text>
          </Box>
          {canDismissActivity && (
            <Box
              onClick={() => handleMarkAsRead(result._id)}
              className={`${classes.markAsRead}`}
            >
              <IconCheck size={20} />
            </Box>
          )}
        </Flex>
      </Paper>
    );
  }
  return <></>;
}

function RenderCommunityGiftPurchaseEvent(
  result: any,
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { displayName, amount } = result.data;
  const tierText = ''; // You can customize this if needed for this specific event type.

  return (
    <Paper mb={10}>
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
            <b>{displayName}</b> Gifted <b>{amount}</b> Subs. Remember to thank
            them in chat! {tierText}
          </Text>
        </Box>
        {canDismissActivity && (
          <Box
            onClick={() => handleMarkAsRead(result._id)}
            className={`${classes.markAsRead}`}
          >
            <IconCheck size={20} />
          </Box>
        )}
      </Flex>
    </Paper>
  );
}

function RenderRaidEvent(
  result: any,
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
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
        {canDismissActivity && (
          <Box
            onClick={() => handleMarkAsRead(result._id)}
            className={`${classes.markAsRead}`}
          >
            <IconCheck size={20} />
          </Box>
        )}
      </Flex>
    </Paper>
  );
}

function RenderCheerEvent(
  result: any,
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { displayName, amount, message } = result.data;
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
          {
            result.data.message ? (
              <Text mt={10}>
                Saying:{' '}
                <b>
                  {sentenceToEmoji(decodeHtmlEntities(result.data.message))}
                </b>
              </Text>
            ) : (
              <Text mt={10} c={'dimmed'}>
                They left no message
              </Text>
            ) // You can customize this if needed for this specific event type.
          }
        </Box>
        {canDismissActivity && (
          <Box
            onClick={() => handleMarkAsRead(result._id)}
            className={`${classes.markAsRead}`}
          >
            <IconCheck size={20} />
          </Box>
        )}
      </Flex>
    </Paper>
  );
}

function RenderTipEvent(
  result: any,
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
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
            <b>{username}</b> Tipped{' '}
            <b
              style={{
                color: 'green',
              }}
            >
              £{amount}
            </b>
          </Text>
          {
            result.data.message ? (
              <Text mt={10}>
                Saying:{' '}
                <b>
                  {sentenceToEmoji(decodeHtmlEntities(result.data.message))}
                </b>
              </Text>
            ) : (
              <Text mt={10} c={'dimmed'}>
                They left no message
              </Text>
            ) // You can customize this if needed for this specific event type.
          }
        </Box>
        {canDismissActivity && (
          <Box
            onClick={() => handleMarkAsRead(result._id)}
            className={`${classes.markAsRead}`}
          >
            <IconCheck size={20} />
          </Box>
        )}
      </Flex>
    </Paper>
  );
}

function RenderSponsorEvent(
  result: any,
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { username, tier, message } = result.data;
  return (
    <Paper mb={10}>
      {' '}
      {/* Add the Paper component */}
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid red',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>
          <Text>
            <b>{(username as string).truncateSecondName()} </b>Became a{' '}
            <b
              style={{
                color: '#ff0000',
              }}
            >
              {tier}
            </b>
          </Text>
          {
            result.data.message ? (
              <Text mt={10}>
                Saying:{' '}
                <b>
                  {sentenceToEmoji(decodeHtmlEntities(result.data.message))}
                </b>
              </Text>
            ) : (
              <Text mt={10} c={'dimmed'}>
                They left no message
              </Text>
            ) // You can customize this if needed for this specific event type.
          }
        </Box>
        {canDismissActivity && (
          <Box
            onClick={() => handleMarkAsRead(result._id)}
            className={`${classes.markAsRead}`}
          >
            <IconCheck size={20} />
          </Box>
        )}
      </Flex>
    </Paper>
  );
}

function RenderSuperChatEvent(
  result: any,
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
): JSX.Element {
  const { classes } = useStyles(); // Add the useStyles hook here.
  const { amount, username, currency, message } = result.data;

  const currencySymbol = symbolMap[currency] || currency;

  return (
    <Paper mb={10}>
      {' '}
      {/* Add the Paper component */}
      <Flex align={'stretch'} justify={'space-between'}>
        <Box
          style={{
            padding: '10px 20px 10px 20px',
            borderLeft: '3px solid red',
          }}
        >
          <Text size={'sm'} c={'dimmed'}>
            {dayjs(result.createdAt).calendar()}
          </Text>
          <Text>
            <b>{username} </b> Superchatted{' '}
            <b
              style={{
                color: 'green',
              }}
            >
              {currencySymbol}
              {amount}
            </b>
          </Text>
          {
            message ? (
              <Text mt={10}>
                Saying: <b>{sentenceToEmoji(decodeHtmlEntities(message))}</b>
              </Text>
            ) : (
              <Text mt={10} c={'dimmed'}>
                They left no message
              </Text>
            ) // You can customize this if needed for this specific event type.
          }
        </Box>
        {canDismissActivity && (
          <Box
            onClick={() => handleMarkAsRead(result._id)}
            className={`${classes.markAsRead}`}
          >
            <IconCheck size={20} />
          </Box>
        )}
      </Flex>
    </Paper>
  );
}

function RenderDefaultEvent(
  result: any,
  type: string,
  handleMarkAsRead: (id: string) => void,
  canDismissActivity: boolean
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
        {canDismissActivity && (
          <Box
            onClick={() => handleMarkAsRead(result._id)}
            className={`${classes.markAsRead}`}
          >
            <IconCheck size={20} />
          </Box>
        )}
      </Flex>
    </Paper>
  );
}
// TODO: Add more events.

export default function Activity(event: EventInt): JSX.Element | null {
  const { eventName, type, data: activity, canDismissActivity } = event;

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
        <p>Test Room Event Received - Sent By: {activity.data} hatLUL</p>
      </div>
    );
  }

  if (eventName === 'message') {
    return (
      <div>
        <p>Message Received: {activity.data}</p>
      </div>
    );
  }

  if (eventName === 'event' || eventName === 'event:initial') {
    switch (type) {
      case 'subscriber':
        return RenderSubscriberEvent(
          activity,
          handleMarkAsRead,
          canDismissActivity
        );
      case 'communityGiftPurchase':
        return RenderCommunityGiftPurchaseEvent(
          activity,
          handleMarkAsRead,
          canDismissActivity
        );
      case 'raid':
        return RenderRaidEvent(activity, handleMarkAsRead, canDismissActivity);
      case 'cheer':
        return RenderCheerEvent(activity, handleMarkAsRead, canDismissActivity);
      case 'tip':
        return RenderTipEvent(activity, handleMarkAsRead, canDismissActivity);
      case 'sponsor':
        return RenderSponsorEvent(
          activity,
          handleMarkAsRead,
          canDismissActivity
        );
      case 'superchat':
        return RenderSuperChatEvent(
          activity,
          handleMarkAsRead,
          canDismissActivity
        );
      default:
        return RenderDefaultEvent(
          activity,
          type,
          handleMarkAsRead,
          canDismissActivity
        );
    }
  }

  return (
    <div>
      <p>Unknown Event Received: {eventName}</p>
    </div>
  );
}
