import React from 'react';
import {
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  Text,
  useMantineTheme,
} from '@mantine/core';
import ConnectionState from './ConnectionState';
import useSocket from '../../hooks/useStreamSocket';

function ActivityViewer({ JWT }: { JWT: string }) {
  const { socket, isConnected, eventsData } = useSocket(JWT);
  const theme = useMantineTheme();
  console.log(eventsData);
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
      >
        <Flex justify={'space-between'} align={'center'}>
          <ConnectionState isConnected={isConnected} />
          <Badge size="lg">Alpha</Badge>
        </Flex>
        <Group mt={20}>
          <Button
            onClick={() => {
              isConnected ? socket.disconnect() : socket.connect();
            }}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>

          <Button
            onClick={() => {
              socket.emit('event:test', 'test');
            }}
          >
            Emit Test Event
          </Button>
        </Group>
        <div>
          {
            // @ts-ignore
            socket?.connected ? (
              <div>
                <p>Connected</p>
                <p>Socket ID: {socket.id}</p>
              </div>
            ) : (
              <div>
                <p>Not Connected</p>
              </div>
            )
          }
          {socket.receiveBuffer.map((event: any, index: number) => (
            <div key={index}>
              <p>Event: {event.event}</p>
              <p>Data: {JSON.stringify(event.data)}</p>
            </div>
          ))}
          {socket.listeners('test').map((listener: any, index: number) => (
            <div key={index}>
              <p>Listener: {listener.name}</p>
            </div>
          ))}

          {eventsData?.map((event: any, index: number) => (
            <div key={index}>
              {event.eventName === 'event' && (
                <>
                  {event.type === 'subscriber' && (
                    <Text>
                      <b>{event.data.displayName}</b> Subbed for{' '}
                      <b>
                        {event.data.amount}{' '}
                        {event.data.amount === 1 ? 'month' : 'months'}{' '}
                      </b>
                      {event.data.tier === 'prime'
                        ? 'with Prime'
                        : event.data.tier === '1000'
                        ? 'at Tier 1'
                        : event.data.tier === '2000'
                        ? 'at Tier 2'
                        : event.data.tier === '3000'
                        ? 'at Tier 3'
                        : ''}
                    </Text>
                  )}

                  {
                    // @ts-ignore
                    event.type === 'communityGiftPurchase' && (
                      <Text>
                        <b>{event.data.displayName}</b> Gifted{' '}
                        <b>{event.data.quantity}</b> Subs
                      </Text>
                    )
                  }

                  {event.type !== 'subscriber' &&
                    event.type !== 'communityGiftPurchase' && (
                      <Text>
                        {event.data.displayName} {event.type}{' '}
                        {event.data.amount}
                      </Text>
                    )}
                </>
              )}
              {event.eventName === 'event:test' && (
                <p>Test Event Received: {event.data}</p>
              )}
            </div>
          ))}
        </div>
      </Paper>
    </>
  );
}

export default ActivityViewer;
