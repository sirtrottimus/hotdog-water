import { Box, Button, Center, Overlay, Title } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMachine } from '@xstate/react';
import { MRT_ColumnDef, MantineReactTable } from 'mantine-react-table';
import { useRouter } from 'next/router';
import { ReactElement, useMemo } from 'react';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/Layout/mainLayout';
import { RowActions } from '../../components/discord/RowActions';
import WebhookTest from '../../components/discord/WebhookTest';
import FormModal from '../../components/modals/form';
import WebhookLinkCell from '../../components/table/WebhookLinkedCell';
import useAuthorization from '../../hooks/useAuthorization';
import { useGenericTable } from '../../hooks/useGenericTable';
import formMachine from '../../utils/machines/modalFormMachine';
import { APIResponse, UserInt as User } from '../../utils/types';
import { IconPlus } from '@tabler/icons-react';
import CreateDiscordSettingsForm from '../../components/forms/createDiscordSettingInstance';
import DiscordService, {
  DiscordSettingsInt,
} from '../../utils/api/DiscordService';

export default function Index({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
  const [state, send] = useMachine(formMachine);
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['discordSettings'],
    async () => {
      const res = await DiscordService.getAll();
      if (res.success) {
        return res.data;
      } else {
        return [];
      }
    }
  );

  const columns = useMemo<MRT_ColumnDef<DiscordSettingsInt>[]>(() => {
    return [
      {
        header: 'Identifier',
        accessorKey: 'identifier',
      },
      {
        header: 'Bot Name',
        accessorKey: 'botName',
      },
      {
        header: 'Webhook URL',
        accessorFn(row: DiscordSettingsInt) {
          return isBlurred
            ? '*******'
            : row.webhookURL
            ? `${row.webhookURL.substring(0, 40)}...`
            : 'Not Set';
        },
      },
      {
        header: 'Linked to',
        Cell: WebhookLinkCell,
      },
    ];
  }, [isBlurred]);

  const { isAuthorized: canEdit } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'EDIT_DISCORD_SETTINGS'],
    'canEdit'
  );

  const { isAuthorized: canDelete } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'DELETE_DISCORD_SETTINGS'],
    'canDelete'
  );

  const { isAuthorized: canCreate } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'CREATE_DISCORD_SETTINGS'],
    'canCreate'
  );

  const { isAuthorized: canView, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'VIEW_DISCORD_SETTINGS'],
    'canView'
  );
  const { table } = useGenericTable({
    data: data ?? [],
    isLoading,
    isFetching,
    isError,
    refetch,
    columns,
    initialState: {
      sorting: [{ id: 'identifier', desc: false }],
    },
    enableRowActions: true,
    rowActions: ({ row }) =>
      RowActions(
        { row },
        {
          auth: { canEdit, canDelete },
          send,
          deleteDiscordSettingsMutation,
        }
      ),
    placeholder: 'No Discord Settings Instances Found',
    details: ({ row }) => WebhookTest({ row }),
    extraToolbarActions: (
      <Button
        onClick={() => {
          send('OPEN', {
            title: 'Create Discord Settings Instance',
            form: 'createDiscordSettings',
            size: 'xl',
            element: (
              <CreateDiscordSettingsForm
                submitCallback={() => {
                  send('CLOSE');
                }}
                action="create"
              />
            ),
          });
        }}
        disabled={!canCreate}
        color="violet"
        leftIcon={<IconPlus size={19} />}
      >
        Create Discord Settings Instance
      </Button>
    ),
  });

  const queryClient = useQueryClient();

  const deleteDiscordSettingsMutation = useMutation(
    (id: string) => DiscordService.remove(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['discordSettings']);
        toast.success('Discord Settings Instance Deleted');
      },
      onError: (response: APIResponse<DiscordSettingsInt>) => {
        if (response.error)
          toast.error(
            `Error Deleting Instance: ${
              response.error.response?.data?.msg ?? ''
            }`
          );
        // Display an error message to the user or redirect to an error page
      },
    }
  );

  if (isBlurred) {
    return (
      <>
        <Center mb={30}>
          <Title>Discord Settings</Title>
        </Center>
        <Box
          style={{ filter: 'blur(5px)' }}
          top="0"
          left="0"
          right="0"
          bottom="0"
        >
          <MantineReactTable table={table} />
        </Box>
      </>
    );
  }

  if (!isAuthLoading && canView)
    return (
      <>
        <Center mb={30}>
          <Title>Discord Settings</Title>
        </Center>
        <MantineReactTable table={table} />

        <FormModal state={state} send={send} />
      </>
    );

  if (!isAuthLoading && !canView) {
    router.push('/dashboard').finally(() => {
      toast.error('You are not authorized to view this page.');
    });
    return (
      <Center>
        <Title>You are not authorized to view this page.</Title>
      </Center>
    );
  }
}

Index.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
