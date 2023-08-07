import { MRT_Cell } from 'mantine-react-table';
import { UserInt } from '../../utils/types';
import { Text } from '@mantine/core';

const OpsJoinedCell = ({
  cell,
}: {
  cell: MRT_Cell<UserInt>;
}): React.ReactElement => {
  if (cell.row.original.opsJoined === 0) {
    return <>None</>;
  }

  if (cell.row.original.opsJoined === 1) {
    return <>1 Op</>;
  }

  if (
    cell.row.original.rank?.name === 'Trial' &&
    cell.row.original.opsJoined > 2
  ) {
    return <Text color={'green'}>{cell.row.original.opsJoined} Ops</Text>;
  }

  if (
    cell.row.original.rank?.name === 'Recruit' &&
    cell.row.original.opsJoined > 9
  ) {
    return <Text color={'green'}>{cell.row.original.opsJoined} Ops</Text>;
  }

  return <>{cell.row.original.opsJoined} Ops</>;
};

export default OpsJoinedCell;
