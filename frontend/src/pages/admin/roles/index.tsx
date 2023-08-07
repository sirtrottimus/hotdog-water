/**
 * This component is the main page for the admin roles section.
 * It displays a table of all roles, with the ability to create, update, and delete roles.
 * It also displays the permissions for each role in a modal.
 * @param user - The user object containing information about the current user.
 * @returns A React component.
 */
import {
  Alert,
  Button,
  Group,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { IconEditCircle, IconPlus, IconTrash } from '@tabler/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMachine } from '@xstate/react';
import { MRT_ColumnDef } from 'mantine-react-table';
import React, { ReactElement, useMemo } from 'react';
import { toast } from 'react-toastify';
import { MainLayout } from '../../../components/Layout/mainLayout';
import CreateRoleForm from '../../../components/forms/createRoles';
import FormModal from '../../../components/modals/form';
import ColorCell from '../../../components/table/ColorCell';
import GenericTable from '../../../components/table/GenericTable';
import StatusCell from '../../../components/table/RolePermissionsCell';
import useAuthorization from '../../../hooks/useAuthorization';
import formMachine from '../../../utils/machines/modalFormMachine';
import { RoleInt, UserInt } from '../../../utils/types';
import RoleService from '../../../utils/api/RoleService';
import CenteredLoader from '../../../components/misc/CenteredLoader';
import { useRouter } from 'next/router';

const Index = ({ user }: { user: UserInt }) => {
  const [state, send] = useMachine(formMachine);
  const [pushed, setPushed] = React.useState(false);
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const { isAuthorized: canView, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'VIEW_ROLES_PAGE'],
    'admin'
  );
  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['roles'],
    async () => {
      const res = await RoleService.getAll();
      if (res.success) {
        return res.data;
      } else {
        return [];
      }
    }
  );

  const columns = useMemo<MRT_ColumnDef<RoleInt>[]>(() => {
    return [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Description',
        accessorKey: 'description',
      },
      {
        header: 'Color',
        Cell: ColorCell,
      },
    ];
  }, []);

  const queryClient = useQueryClient();

  const deleteRoleMutation = useMutation(
    (id: string) => RoleService.remove(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['roles']).finally(() => {});
        toast.success('Role deleted successfully');
      },
      onError: (e) => {
        toast.error(e as string);
      },
    }
  );
  switch (true) {
    case isAuthLoading:
      return <CenteredLoader colorScheme={colorScheme} size={'xl'} />;

    case !isAuthLoading && !canView:
      router.push('/dashboard');

      if (!pushed) {
        setPushed(true);
        toast.error('You are not authorized to view this page.');
      }
      return (
        <CenteredLoader colorScheme={colorScheme} redirecting size={'xl'} />
      );
    case isError:
      return <CenteredLoader colorScheme={colorScheme} errored size={'xl'} />;
    default:
      break;
  }

  return (
    <>
      <GenericTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
        enableRowActions={true}
        extraToolbarActions={
          <Button
            color="violet"
            variant="light"
            size="xs"
            onClick={() => {
              send('OPEN', {
                title: 'Create a Role',
                form: 'createRole',
                size: 'xl',
                element: (
                  <CreateRoleForm
                    submitCallback={() => {
                      send('CLOSE');
                    }}
                  />
                ),
              });
            }}
          >
            <IconPlus size={'19px'} />
          </Button>
        }
        rowActions={({ row }) => (
          <Button.Group>
            <Button
              variant="light"
              size="xs"
              color="violet"
              onClick={() => {
                send('OPEN', {
                  title: `Update Role ${row.original.name}`,
                  form: 'updateRole',
                  size: 'xl',
                  element: (
                    <CreateRoleForm
                      role={row.original}
                      submitCallback={() => {
                        send('CLOSE');
                      }}
                      action="update"
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
              onClick={() =>
                send('OPEN', {
                  title: `Delete Role ${row.original.name}`,
                  form: 'deleteRole',
                  size: 'lg',
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
                            deleteRoleMutation.mutate(row.original._id);
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
        )}
        details={({ row }) => (
          <>
            <Title order={4}>Permissions</Title>
            <StatusCell row={row} />
          </>
        )}
      />

      <FormModal state={state} send={send} />
    </>
  );
};

export default Index;

Index.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
