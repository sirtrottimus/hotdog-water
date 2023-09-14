import React from 'react';
import {
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  useMantineTheme,
} from '@mantine/core';
import ConnectionState from './ConnectionState';
import useSocket from '../../hooks/useStreamSocket';

function ActivityViewer({ JWT }: { JWT: string }) {
  const { socket, isConnected } = useSocket(JWT);
  const theme = useMantineTheme();
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
              socket.emit('test', 'test');
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
        </div>
      </Paper>
    </>
  );
}

export default ActivityViewer;
