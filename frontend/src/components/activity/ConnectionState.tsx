import { Flex, Title } from '@mantine/core';
import React, { useEffect } from 'react';
import TwitchService from '../../utils/api/TwitchService';
import { checkTwitchStatus } from '../../utils/helpers';
import YoutubeService from '../../utils/api/YoutubeService';
import ConnectionDisplay from './ConnectionDisplay';

interface Props {
  isConnected: boolean;
  title: string;
}

export default function ConnectionState({ isConnected, title }: Props) {
  const [isTwitchLive, setTwitchLive] = React.useState(false);
  const [isYouTubeLive, setYouTubeLive] = React.useState(false);
  useEffect(() => {
    async function TwitchStatus() {
      const response = await TwitchService.getOne();
      if (!response.data) return;

      const res = await checkTwitchStatus(response.data);
      if (!res.isLive) {
        setTwitchLive(false);
      }

      if (res.isLive) {
        setTwitchLive(true);
      }
    }
    TwitchStatus();
  }, []);

  useEffect(() => {
    async function YouTubeStatus() {
      const response = await YoutubeService.checkLiveStatus();
      if (!response.success) {
        return;
      }
      if (!response.data.isLive) {
        setYouTubeLive(false);
      }

      if (response.data.isLive) {
        setYouTubeLive(true);
      }
    }
    YouTubeStatus();
  }, []);

  return (
    <Title>
      <Flex justify={'space-around'}>
        <ConnectionDisplay
          isconnected={isConnected}
          isLoading={false}
          title={title}
        />
        <ConnectionDisplay
          isconnected={isTwitchLive}
          isLoading={false}
          title={'Twitch'}
          wording={{
            connected: 'Live',
            disconnected: 'Offline',
            loading: 'Loading...',
          }}
        />
        <ConnectionDisplay
          isconnected={isYouTubeLive}
          isLoading={false}
          title={'YouTube'}
          wording={{
            connected: 'Live',
            disconnected: 'Offline',
            loading: 'Loading...',
          }}
        />
      </Flex>
    </Title>
  );
}
