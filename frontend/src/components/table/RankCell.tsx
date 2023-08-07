import { Badge } from '@mantine/core';
import { MRT_Cell } from 'mantine-react-table';
import { UserInt } from '../../utils/types';

const RankCell = ({
  cell,
}: {
  cell: MRT_Cell<UserInt>;
}): React.ReactElement => {
  return (
    <Badge
      radius={'xs'}
      sx={{
        borderColor: cell.row.original.rank?.color,
        color: cell.row.original.rank?.color,
        borderWidth: '2px',
      }}
      variant="outline"
    >
      {cell.row.original.rank?.name}
    </Badge>
  );
};

export default RankCell;
