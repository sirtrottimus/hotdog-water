import React from 'react';
import { Badge, Text } from '@mantine/core';
import { MRT_Cell } from 'mantine-react-table';
import { RoleInt } from '../../utils/types';

const DataOrNoneCell = (
  { cell }: { cell: MRT_Cell<any> },
  noneText = 'None'
): React.ReactElement => {
  return cell.row.original.roles.length > 0 ? (
    cell.row.original.roles.map((role: RoleInt) => {
      return (
        <Badge color="gray" radius={'xs'} key={role._id} mr={5}>
          {role.name ?? 'None'}
        </Badge>
      );
    })
  ) : (
    <Text c={'dimmed'}>{noneText}</Text>
  );
};

export default DataOrNoneCell;
