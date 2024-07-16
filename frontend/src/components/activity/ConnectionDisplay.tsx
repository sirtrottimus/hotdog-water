// Component to display the connection status.
// Used for both Twitch and YouTube, and displays the connection status to the backend too.

import { Box, Text } from '@mantine/core';
import React from 'react';

interface ConnectionDisplayProps {
  isconnected: boolean;
  isLoading?: boolean;
  title: string;
  wording?: {
    connected: string;
    disconnected: string;
    loading: string;
  };
}

const ConnectionDisplay: React.FC<ConnectionDisplayProps> = ({
  isconnected,
  isLoading,
  title,
  wording,
}) => {
  const showDisconnected = () => (
    <Box>
      <Text span>{title} - </Text>
      <Text span color="red" fw={'bold'}>
        {wording?.disconnected || 'Disconnected'}
      </Text>
    </Box>
  );

  const showConnected = () => (
    <Box>
      <Text span>{title} - </Text>
      <Text span color="green" fw={'bold'}>
        {wording?.connected || 'Connected'}
      </Text>
    </Box>
  );

  const showLoading = () => (
    <Box>
      <Text span>{title} - </Text>
      <Text span color="gray" fw={'bold'}>
        {wording?.loading || 'Loading...'}
      </Text>
    </Box>
  );

  if (isLoading) {
    return showLoading();
  }

  if (isconnected) {
    return showConnected();
  }

  return showDisconnected();
};

export default ConnectionDisplay;
