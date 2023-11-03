import React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Paper,
  Text,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import ConnectionState from './ConnectionState';

import Activity from './Activity';
import useBackendSocket from '../../hooks/useBackendSocket';

const colorIndex = [
  'blue',
  'red',
  'teal',
  'yellow',
  'gray',
  'cyan',
  'lime',
  'indigo',
  'pink',
  'purple',
  'orange',
  'green',
];

interface ColorProps {
  color: string;
  depth: number;
  isDirectlyActive: boolean;
  index: number;
}

const useStyles = createStyles((theme, { color, depth }: ColorProps) => {
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

      maxHeight: '75vh',
      scrollbarWidth: 'thin',
      overflowY: 'auto',
    },
  };
});

function ActivityViewer() {
  const { classes } = useStyles({
    color: 'blue',
    depth: 0,
    isDirectlyActive: false,
    index: 0,
  });
  const {
    socket: backendSocket,
    isConnected: isBackendConnected,
    eventsData: backendEventsData,
    activeSockets,
  } = useBackendSocket();
  const theme = useMantineTheme();

  console.log('backendEventsData', backendEventsData);
  return (
    <>
      <Paper
        mt={30}
        p={'xl'}
        sx={{
          border: `3px solid ${
            theme.colorScheme === 'dark'
              ? theme.colors.dark[9]
              : theme.colors.gray[2]
          }`,
        }}
        w={'75%'}
        mx={'auto'}
      >
        <Flex justify={'space-between'} align={'center'}>
          <ConnectionState isConnected={isBackendConnected} title={'Backend'} />
          <Badge size="lg">Alpha</Badge>
        </Flex>
        <Avatar.Group>
          {activeSockets?.map((socket: any, index: number) => (
            <Avatar
              key={index}
              src=""
              alt={socket.username}
              size="md"
              radius={'xl'}
              color={colorIndex[index % colorIndex.length]}
            >
              {socket.username[0].toUpperCase()}
            </Avatar>
          ))}
        </Avatar.Group>

        <Divider my={20} />
        <Group my={20}>
          <Button
            size="sm"
            onClick={() => {
              backendSocket.emit('event:test', 'test');
            }}
          >
            Emit Test Event
          </Button>
          <Button
            size="sm"
            onClick={() => {
              backendSocket.emit(
                'event:test_room',
                activeSockets.find((s: any) => s.socketId === backendSocket.id)
                  ?.username ?? 'unknown'
              );
            }}
          >
            Emit Test Room Event
          </Button>
          <Button
            size="sm"
            onClick={() => {
              isBackendConnected
                ? backendSocket.disconnect()
                : backendSocket.connect();
            }}
          >
            {isBackendConnected ? 'Disconnect Backend' : 'Connect Backend'}
          </Button>
        </Group>

        {isBackendConnected && (
          <>
            {backendEventsData?.length > 0 ? (
              <Box className={`${classes.activityContainer}`}>
                {backendEventsData?.map((event: any, index: number) => (
                  <div key={index}>
                    <Activity
                      eventName={event.eventName}
                      type={event.type}
                      data={event}
                    />
                  </div>
                ))}
              </Box>
            ) : (
              <Box className={`${classes.activityContainer}`}>
                <Center>
                  <Text c="dimmed">No events to display yet.</Text>
                </Center>
              </Box>
            )}
          </>
        )}
      </Paper>
    </>
  );
}

export default ActivityViewer;
