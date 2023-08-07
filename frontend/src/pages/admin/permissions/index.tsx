import { Alert, Button, Group, Text } from '@mantine/core';
import { IconEditCircle, IconPlus, IconTrash } from '@tabler/icons';
import {
  UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMachine } from '@xstate/react';
import { MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { ReactElement, useMemo } from 'react';
import { toast } from 'react-toastify';
import { MainLayout } from '../../../components/Layout/mainLayout';
import FormModal from '../../../components/modals/form';
import GenericTable from '../../../components/table/GenericTable';
import useAuthorization from '../../../hooks/useAuthorization';
import formMachine from '../../../utils/machines/modalFormMachine';
import { APIResponse, PermissionInt, UserInt } from '../../../utils/types';
import CreatePermissionForm from '../../../components/forms/createPermissions';
import PermissionService from '../../../utils/api/PermissionService';

const Index = ({ user }: { user: UserInt }) => {
  const [state, send] = useMachine(formMachine);
  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['permissions'],
    async () => {
      const res = await PermissionService.getAll();
      if (res.success) {
        return res.data;
      } else {
        return [];
      }
    }
  );

  const columns = useMemo<MRT_ColumnDef<PermissionInt>[]>(() => {
    return [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Description',
        accessorKey: 'description',
      },
    ];
  }, []);

  const queryClient = useQueryClient();

  const deletePermissionMutation = useMutation(
    (id: string) => PermissionService.remove(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['permissions']).finally(() => {});
        toast.success('Request deleted successfully');
        send('CLOSE');
      },
      onError: (e) => {
        toast.error(e as string);
      },
    }
  );

  const { isAuthorized: canEdit, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'EDIT_PERMISSION'],
    'editPermission'
  );

  const { isAuthorized: canDelete } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'DELETE_PERMISSION'],
    'deletePermission'
  );

  return (
    <>
      {!isAuthLoading && (
        <>
          <GenericTable
            data={data ?? []}
            columns={columns}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            refetch={refetch}
            extraToolbarActions={
              <Button
                variant="light"
                color="violet"
                onClick={() => {
                  send('OPEN', {
                    title: 'Create Permission',
                    form: 'createPermission',
                    element: (
                      <CreatePermissionForm
                        submitCallback={() => {
                          send('CLOSE');
                        }}
                        action="create"
                      />
                    ),
                  });
                }}
              >
                <IconPlus size={'19px'} />
              </Button>
            }
            enableRowActions={true}
            rowActions={({ row }) =>
              RowActions(
                { row },
                {
                  auth: { canEdit, canDelete },
                  send,
                  deletePermissionMutation,
                }
              )
            }
          />

          <FormModal state={state} send={send} />
        </>
      )}
    </>
  );
};

export default Index;

Index.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

const RowActions = (
  {
    row,
  }: {
    row: MRT_Row<PermissionInt>;
  },
  {
    auth: { canEdit, canDelete },
    send,
    deletePermissionMutation,
  }: {
    auth: {
      canEdit: boolean;
      canDelete: boolean;
    };
    send: any;

    deletePermissionMutation: UseMutationResult<
      APIResponse<PermissionInt>,
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
              title: `Update Permission ${row.original.name}`,
              form: 'updateRequest',
              element: (
                <CreatePermissionForm
                  submitCallback={() => {
                    send('CLOSE');
                  }}
                  action="update"
                  permission={row.original}
                />
              ),
            });
          }}
        >
          <IconEditCircle size={'19px'} />
        </Button>
        <Button
          variant="light"
          size="xs"
          color="red"
          disabled={!canDelete}
          onClick={() =>
            send('OPEN', {
              title: `Delete ${row.original}`,
              form: 'deletePermission',
              size: 'md',
              element: (
                <>
                  <Alert
                    color="red"
                    title={`Are you sure you want to delete ${row.original.name}?`}
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
                        deletePermissionMutation.mutate(row.original._id);
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
