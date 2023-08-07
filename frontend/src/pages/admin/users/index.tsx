import { useQuery } from '@tanstack/react-query';
import { MRT_ColumnDef } from 'mantine-react-table';
import { ReactElement, useMemo } from 'react';
import { MainLayout } from '../../../components/Layout/mainLayout';
import { UserInt } from '../../../utils/types';
import { useMantineColorScheme, Button } from '@mantine/core';
import { IconEditCircle, IconSearch } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useMachine } from '@xstate/react';
import formMachine from '../../../utils/machines/modalFormMachine';
import FormModal from '../../../components/modals/form';
import CenteredLoader from '../../../components/misc/CenteredLoader';
import StatusCell from '../../../components/table/UserStatusCell';
import GenericTable from '../../../components/table/GenericTable';
import RankCell from '../../../components/table/RankCell';
import UserService from '../../../utils/api/UserService';
import RolesDisplay from '../../../components/misc/RolesDisplay';
import { IconPlus } from '@tabler/icons-react';
import CreateRoleForm from '../../../components/forms/createRoles';
import CreateUserForm from '../../../components/forms/createUser';

const MembersPage = ({ user }: { user: UserInt }) => {
  const [state, send] = useMachine(formMachine);
  const path = '/dashboard/profile';
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['members'],
    async () => {
      const res = await UserService.getAll();
      if (res.success) {
        // if the user is a Trial or Recruit rank, filter them out
        return res.data;
      } else {
        return [];
      }
    }
  );

  const columns = useMemo<MRT_ColumnDef<UserInt>[]>(() => {
    if (isLoading) return [];
    return [
      {
        // @ts-ignore
        header: 'Username',
        accessorKey: 'username',
      },
      {
        header: 'Discord Id',
        accessorKey: 'discordId',
      },
      {
        header: 'Roles',
        accessorFn(originalRow) {
          return RolesDisplay({
            member: originalRow,
            isMe: originalRow._id === user._id,
            send: false,
            user,
            displayActions: false,
          });
        },
      },
    ];
  }, [isLoading, user]);

  if (isLoading) {
    return <CenteredLoader colorScheme={colorScheme} size={'xl'} />;
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
                title: 'Create a User',
                form: 'createUser',
                size: 'xl',
                element: (
                  <CreateUserForm
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
              variant="filled"
              size="xs"
              color="indigo"
              onClick={() =>
                router.push(`${path}/${row.original._id}?path=/admin/users`)
              }
            >
              <IconSearch size={'19px'} />
            </Button>
          </Button.Group>
        )}
      />
      <FormModal state={state} send={send} />
    </>
  );
};

export default MembersPage;

MembersPage.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
