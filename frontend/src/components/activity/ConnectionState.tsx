import { Flex, Title } from '@mantine/core';
import React, { useEffect } from 'react';
import TwitchService from '../../utils/api/TwitchService';
import { checkTwitchStatus } from '../../utils/helpers';

interface Props {
  isConnected: boolean;
  title: string;
}

export default function ConnectionState({ isConnected, title }: Props) {
  const [live, setLive] = React.useState(false);
  useEffect(() => {
    async function TwitchStatus() {
      const response = await TwitchService.getOne();
      if (!response.data) return;

      const res = await checkTwitchStatus(response.data);
      if (!res.isLive) {
        setLive(false);
      }
    }
    TwitchStatus();
  }, []);
  return (
    <Title>
      <Flex justify={'space-around'}>
        <div>
          {title} -{' '}
          {isConnected ? (
            <span style={{ color: 'green', fontWeight: 'bold' }}>
              Connected
            </span>
          ) : (
            <span style={{ color: 'red', fontWeight: 'bold' }}>
              Disconnected
            </span>
          )}
        </div>
        <div>
          Twitch -{' '}
          {live ? (
            <span
              style={{
                color: 'green',
                fontWeight: 'bold',
              }}
            >
              Live
            </span>
          ) : (
            <span
              style={{
                color: 'red',
                fontWeight: 'bold',
              }}
            >
              Offline
            </span>
          )}
        </div>
        YouTube - TBA
      </Flex>
    </Title>
  );
}
