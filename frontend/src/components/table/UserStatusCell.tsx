import { MRT_Cell } from 'mantine-react-table';
import { Badge } from '@mantine/core';
import { UserInt } from '../../utils/types';

const UserStatusCell = ({ cell }: { cell: MRT_Cell<UserInt> }) => {
  return (
    <>
      <Badge
        radius={'sm'}
        color={cell.row.original.status.color}
        sx={{ textTransform: 'unset' }}
      >
        {' '}
        {cell.row.original.status.name}
      </Badge>
    </>
  );
};

export default UserStatusCell;
