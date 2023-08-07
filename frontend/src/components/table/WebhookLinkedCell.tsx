import { Badge, Group } from '@mantine/core';
import { MRT_Cell } from 'mantine-react-table';
import { DiscordSettingsInt } from '../../utils/api/discord';

const WebhookLinkCell = ({
  cell,
}: {
  cell: MRT_Cell<DiscordSettingsInt>;
}): React.ReactElement => {
  return (
    <Group>
      {cell.row.original.isLivePostWebhook && (
        <Badge color="red" radius={'xs'} variant="filled" mr={5}>
          Live Posts
        </Badge>
      )}
      {cell.row.original.isAnnouncementWebhook && (
        <Badge color="blue" radius={'xs'} variant="filled">
          Announcements
        </Badge>
      )}

      {cell.row.original.isMemberOnlyWebhook && (
        <Badge color="violet" radius={'xs'} variant="filled">
          Members Only
        </Badge>
      )}
    </Group>
  );
};

export default WebhookLinkCell;
