import { Title } from '@mantine/core';
import React from 'react';

interface Props {
  isConnected: boolean;
  title: string;
}

export default function ConnectionState({ isConnected, title }: Props) {
  return (
    <Title>
      {title} Activity Viewer - {isConnected ? 'Connected' : 'Disconnected'}
    </Title>
  );
}
