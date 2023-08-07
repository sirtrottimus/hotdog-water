import { Badge } from '@mantine/core';
import React from 'react';

const StatusCell = ({ row }: any) => {
  const statuses: { [key: string]: string } = {
    Open: 'blue',
    Completed: 'green',
    'Approved Date': 'green',
    Denied: 'red',
    Cancelled: 'gray',
    Rescheduled: 'orange',
    Pending: 'yellow',
    'No Show': 'red',
    'Choosing Date': 'yellow',
    'On Hold': 'yellow',
  };

  return (
    <Badge radius={'xs'} color={statuses[row.original.status]}>
      {row.original.status}
    </Badge>
  );
};

export default StatusCell;
