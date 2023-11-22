import { Avatar } from '@mantine/core';
import { MRT_Cell } from 'mantine-react-table';
import { IFunctionLog } from '../../utils/api/AuditService';

const UserCell = ({
  cell,
}: {
  cell: MRT_Cell<IFunctionLog>;
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
        src={`https://cdn.discordapp.com/avatars/${cell.row.original.user.discordId}/${cell.row.original.user.avatar}.png`}
        alt={cell.row.original.user.username}
        mr={10}
      />
      <div>
        <div>{cell.row.original.user.username}</div>
        <div style={{ fontSize: '12px' }}>
          {cell.row.original.user.discordId}
        </div>
      </div>
    </div>
  );
};

export default UserCell;
