import { Badge, BadgeVariant, HoverCard, Text } from '@mantine/core';
import React from 'react';

type Status = {
  status: string;
  statusColor: string;
  statusText: string;
};

export default function WIPTag({
  type = 'light',
  statusType,
}: {
  type?: BadgeVariant;
  statusType: string;
}) {
  let status: Status = {
    status: statusType,
    statusColor: 'red',
    statusText: 'This feature is a work in progress',
  };

  switch (true) {
    case status.status === 'WIP':
      status = {
        status: 'WIP',
        statusColor: 'red',
        statusText:
          'This feature is a work in progress. Not ready for testing.',
      };
      break;

    case status.status === 'ALPHA':
      status = {
        status: 'ALPHA',
        statusColor: 'orange',
        statusText: 'This feature is in alpha testing, use with caution.',
      };
      break;

    case status.status === 'BETA':
      status = {
        status: 'BETA',
        statusColor: 'yellow',
        statusText: 'This feature is in beta testing, mostly stable.',
      };
      break;

    case status.status === 'RELEASE':
      status = {
        status: 'RELEASE',
        statusColor: 'green',
        statusText: 'This feature is released. Please report any bugs.',
      };
      break;

    case status.status === 'COMING SOON':
      status = {
        status: 'COMING SOON',
        statusColor: 'indigo',
        statusText: 'This feature is coming soon. No ETA yet.',
      };

    default:
      break;
  }

  return (
    <HoverCard width={280} shadow="md" openDelay={200}>
      <HoverCard.Target>
        <Badge color={status.statusColor} variant={type}>
          {status.status}
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="sm">{status.statusText}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
