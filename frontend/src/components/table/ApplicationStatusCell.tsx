import { Badge } from '@mantine/core';
import React from 'react';

const StatusCell = ({ row }: any) => {
  const statuses: { [key: string]: string } = {
    open: 'blue',
    'closed-accepted': 'green',
    'closed-rejected': 'red',
    'close-denied': 'red',
    'Under Review': 'yellow',
  };

  return (
    <Badge radius={'xs'} color={statuses[row.original.status]}>
      {row.original.status}
    </Badge>
  );
};

export default StatusCell;
