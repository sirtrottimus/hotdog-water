import { Title } from '@mantine/core';
import React from 'react';

interface Props {
  isConnected: boolean;
}

export default function ConnectionState({ isConnected }: Props) {
  return (
    <Title>
      Activity Viewer - {isConnected ? 'Connected' : 'Disconnected'}
    </Title>
  );
}
