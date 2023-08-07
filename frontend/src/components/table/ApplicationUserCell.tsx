import { Avatar } from '@mantine/core';
import { MRT_Cell } from 'mantine-react-table';
import { ApplicationInt } from '../../utils/types';

const Usercell = ({
  cell,
}: {
  cell: MRT_Cell<ApplicationInt>;
}): React.ReactElement => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Avatar
        radius="xl"
        src={`https://cdn.discordapp.com/avatars/${cell.row.original.createdBy.discordId}/${cell.row.original.createdBy.avatar}.png`}
        alt={cell.row.original.createdBy.username}
        mr={10}
      />
      <div>
        <div>{cell.row.original.createdBy.username}</div>
        <div style={{ fontSize: '12px' }}>
          {cell.row.original.createdBy.discordId}
        </div>
      </div>
    </div>
  );
};

export default Usercell;
