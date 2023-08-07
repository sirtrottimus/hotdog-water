import { Button, useMantineColorScheme } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { useMachine } from '@xstate/react';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useRouter } from 'next/router';
import { ReactElement, useMemo, useState } from 'react';
import { MainLayout } from '../../../components/Layout/mainLayout';
import CenteredLoader from '../../../components/misc/CenteredLoader';
import FormModal from '../../../components/modals/form';
import formMachine from '../../../utils/machines/modalFormMachine';
import { UserInt } from '../../../utils/types';
import GenericTable from '../../../components/table/GenericTable';
import { IconPlus } from '@tabler/icons-react';
import RolesDisplay from '../../../components/misc/RolesDisplay';
import UserService from '../../../utils/api/UserService';
import CreateUserForm from '../../../components/forms/createUser';
import useAuthorization from '../../../hooks/useAuthorization';
import { toast } from 'react-toastify';

const MembersPage = ({ user }: { user: UserInt }) => {
  const [state, send] = useMachine(formMachine);
  const path = '/dashboard/profile';
  const router = useRouter();
  const [pushed, setPushed] = useState(false);
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

  const { isAuthorized: canView, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'VIEW_USERS_PAGE'],
    'admin'
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
