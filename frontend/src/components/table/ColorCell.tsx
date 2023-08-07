import React from 'react';
import { ColorSwatch, Group, Badge } from '@mantine/core';
import { MRT_Cell } from 'mantine-react-table';

const ColorCell = ({ cell }: { cell: MRT_Cell<any> }): React.ReactElement => {
  return (
    <Badge color="gray" radius={'xs'}>
      <Group>
        <ColorSwatch color={cell.row.original.color ?? '#000'} size={10} />
        {cell.row.original.color ?? 'None'}
      </Group>
    </Badge>
  );
};

export default ColorCell;
