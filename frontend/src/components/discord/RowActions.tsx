import { MRT_Row } from 'mantine-react-table';
import { DiscordSettingsInt } from '../../utils/api/DiscordService';
import { UseMutationResult } from '@tanstack/react-query';
import { APIResponse } from '../../utils/types';
import { Alert, Button, Group, Text } from '@mantine/core';
import CreateDiscordSettingsForm from '../forms/createDiscordSettingInstance';
import { IconEdit, IconTrash } from '@tabler/icons-react';

export const RowActions = (
  {
    row,
  }: {
    row: MRT_Row<DiscordSettingsInt>;
  },
  {
    auth: { canEdit, canDelete },
    send,
    deleteDiscordSettingsMutation,
  }: {
    auth: {
      canEdit: boolean;
      canDelete: boolean;
    };
    send: any;

    deleteDiscordSettingsMutation: UseMutationResult<
      APIResponse<DiscordSettingsInt>,
      unknown,
      string,
      unknown
    >;
  }
) => {
  return (
    <>
      <Button.Group>
        <Button
          variant="light"
          size="xs"
          color="violet"
          disabled={!canEdit}
          onClick={() => {
            send('OPEN', {
              title: `Update ${row.original.identifier} Instance`,
              form: 'updateDiscordSettings',
              size: 'xl',
              element: (
                <CreateDiscordSettingsForm
                  submitCallback={() => {
                    send('CLOSE');
                  }}
                  action="update"
                  discordSettings={row.original}
                />
              ),
            });
          }}
        >
          <IconEdit size={'19px'} />
        </Button>
        <Button
          variant="light"
          size="xs"
          color="red"
          disabled={!canDelete}
          onClick={() =>
            send('OPEN', {
              title: `Delete ${row.original.identifier} Instance`,
              form: 'deleteDiscordSettings',
              size: 'xl',
              element: (
                <>
                  <Alert
                    color="red"
                    title={`Are you sure you want to delete ${row.original.identifier}?`}
                    withCloseButton={false}
                  >
                    <Text>This action is irreversible.</Text>
                  </Alert>

                  <Group mt={10} position="right">
                    <Button variant="light" onClick={() => send('CLOSE')}>
                      Cancel
                    </Button>
                    <Button
                      variant="filled"
                      color="red"
                      onClick={() => {
                        deleteDiscordSettingsMutation.mutate(row.original._id);
                        send('CLOSE');
                      }}
                    >
                      Delete
                    </Button>
                  </Group>
                </>
              ),
            })
          }
        >
          <IconTrash size={'19px'} />
        </Button>
      </Button.Group>
    </>
  );
};
