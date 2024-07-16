import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Popover,
  Text,
  TextInput,
  Title,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import ConnectionState from './ConnectionState';

import Activity from './Activity';
import useBackendSocket from '../../hooks/useBackendSocket';
import { IconAd, IconExternalLink } from '@tabler/icons-react';
import { DateTimePicker } from '@mantine/dates';
import TwitchService from '../../utils/api/TwitchService';
import useAuthorization from '../../hooks/useAuthorization';
import { UserInt } from '../../utils/types';

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
          : theme.colors.gray[1],
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      border: `2px solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }`,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,

      scrollbarWidth: 'thin',
      overflowY: 'auto',
    },
  };
});

function ActivityViewer({
  activityWindowed,
  setActivityWindowed,
  user,
}: {
  activityWindowed: boolean;
  setActivityWindowed: (activityWindowed: boolean) => void;
  user: UserInt;
}) {
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
    isLoading,
  } = useBackendSocket();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [message, setMessage] = useState('Hello, world!');
  const [messageOpened, setMessageOpened] = useState(false);

  const { isAuthorized: canViewActivity } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'CAN_VIEW_ACTIVITY'],
    'canViewActivity'
  );

  const { isAuthorized: canRunAd } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'CAN_RUN_AD'],
    'canRunAd'
  );

  const { isAuthorized: canDismissActivity } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'CAN_DISMISS_ACTIVITY'],
    'canDismissActivity'
  );

  if (!canViewActivity) {
    return (
      <Center my={30}>
        <Text color="red">You do not have permission to view activity.</Text>
      </Center>
    );
  }

  //Filter remove read events from backendEventsData
  const filteredEvents = backendEventsData?.filter(
    (event: any) => event.read === false
  );
  console.log(filteredEvents);
  console.log(backendEventsData);
  return (
    <Paper
      mt={30}
      p={activityWindowed ? 0 : 20}
      sx={{
        border: `3px solid ${
          theme.colorScheme === 'dark'
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }`,
      }}
      w={activityWindowed ? '100%' : '75%'}
      mx={activityWindowed ? 0 : 'auto'}
    >
      {!activityWindowed && (
        <>
          <ConnectionState
            isConnected={isBackendConnected}
            title={'Activity'}
          />
          <Avatar.Group>
            {activeSockets
              ? Array.from(activeSockets).map(([socketId, socket], index) => (
                  <Avatar
                    key={socketId}
                    size="lg"
                    src={`https://avatars.dicebear.com/api/avataaars/${socket.username}.svg`}
                    title={socket.username}
                    radius="xl"
                    style={{ zIndex: index }}
                  />
                ))
              : null}
          </Avatar.Group>
        </>
      )}
      <Divider my={20} />
      <Group my={20} position="center">
        {!activityWindowed && (
          <>
            <Button
              size="sm"
              onClick={() => {
                setActivityWindowed(true);
              }}
              leftIcon={<IconExternalLink />}
            >
              Open Activity in New Window
            </Button>

            <Button
              size="sm"
              variant="outline"
              color="gray"
              onClick={() => {
                backendSocket.disconnect();
                backendSocket.connect();
              }}
            >
              Refresh From Schedule
            </Button>
            <Popover
              opened={messageOpened}
              onChange={setMessageOpened}
              width={300}
              trapFocus
            >
              <Popover.Target>
                <Button
                  onClick={() => setMessageOpened((o) => !o)}
                  variant="outline"
                  color="gray"
                >
                  Send Message
                </Button>
              </Popover.Target>

              <Popover.Dropdown>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    backendSocket.emit('send-message', {
                      displayName: user.username,
                      message,
                    });
                  }}
                >
                  <TextInput
                    placeholder="Enter message"
                    onChange={(e) => setMessage(e.currentTarget.value)}
                  />
                  <Center>
                    <Button type="submit">Submit</Button>
                  </Center>
                </form>
              </Popover.Dropdown>
            </Popover>
            <Popover opened={opened} onChange={setOpened} width={300} trapFocus>
              <Popover.Target>
                <Button
                  onClick={() => setOpened((o) => !o)}
                  variant="outline"
                  color="gray"
                >
                  Fetch Previous Events
                </Button>
              </Popover.Target>

              <Popover.Dropdown>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    backendSocket.emit('refresh-date', selectedDate);
                  }}
                >
                  <DateTimePicker
                    placeholder="Pick date and time"
                    popoverProps={{ withinPortal: false }}
                    mb={10}
                    value={selectedDate}
                    onChange={setSelectedDate as any}
                  />
                  <Center>
                    <Button type="submit">Submit</Button>
                  </Center>
                </form>
              </Popover.Dropdown>
            </Popover>
            {canRunAd && (
              <Button
                size="sm"
                onClick={() => {
                  TwitchService.runAd();
                }}
                variant="gradient"
                ml={'auto'}
                gradient={{
                  from: '#6838f1',
                  to: '#dc51f2',
                }}
                leftIcon={<IconAd />}
              >
                Run Advert
              </Button>
            )}
          </>
        )}
      </Group>

      {isBackendConnected && (
        <>
          {filteredEvents?.length > 0 ? (
            <Box
              className={`${classes.activityContainer}`}
              mah={activityWindowed ? '75vh' : '100%'}
            >
              <Title order={5} mb={10} align="center">
                {filteredEvents.length} Events to Display
              </Title>
              {filteredEvents?.map((event: any, index: number) => (
                <div key={index}>
                  <Activity
                    eventName={event.eventName}
                    type={event.type}
                    data={event}
                    canDismissActivity={canDismissActivity}
                  />
                </div>
              ))}
            </Box>
          ) : (
            <Box className={`${classes.activityContainer}`}>
              <Center>
                <Text c="dimmed">
                  {isLoading ? 'Loading...' : 'No events to display yet.'}
                </Text>
              </Center>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}

export default ActivityViewer;
