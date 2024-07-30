import React, { ReactElement, useMemo } from 'react';
import { UserInt } from '../../utils/types';
import useAuthorization from '../../hooks/useAuthorization';
import GenericTable from '../../components/table/GenericTable';
import { Alert, Button, Group, Text } from '@mantine/core';
import { useMachine } from '@xstate/react';
import formMachine from '../../utils/machines/modalFormMachine';
import { IconEditCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import FormModal from '../../components/modals/form';
import { MainLayout } from '../../components/Layout/mainLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ScheduleService, { ScheduleInt } from '../../utils/api/ScheduleService';
import { toast } from 'react-toastify';
import { MRT_ColumnDef } from 'mantine-react-table';
import CreateEventForm from '../../components/forms/createEvent';

const SchedulePage = ({ user }: { user: UserInt }) => {
  const [state, send] = useMachine(formMachine);
  const { isAuthorized: canView, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'VIEW_ROLES_PAGE'],
    'admin'
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['schedule'],
    async () => {
      const res = await ScheduleService.getAll();
      if (res.success) {
        return res.data;
      } else {
        return [];
      }
    }
  );

  const columns = useMemo<MRT_ColumnDef<ScheduleInt>[]>(() => {
    return [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Description',
        accessorKey: 'description',
      },
      {
        header: 'Date',
        accessorKey: 'date',
      },
      {
        header: 'Type',
        accessorKey: 'type',
      },
      {
        header: 'Recurring Days',
        accessorKey: 'recurringDays',
      },
    ];
  }, []);

  const queryClient = useQueryClient();

  const deleteEventMutation = useMutation(
    (id: string) => ScheduleService.remove(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['schedule']).finally(() => {});
        toast.success('Event deleted successfully');
      },
      onError: (e) => {
        toast.error(e as string);
      },
    }
  );

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
                title: 'Create an Event',
                form: 'createEvent',
                size: 'xl',
                element: (
                  <CreateEventForm
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
                  title: `Update Event ${row.original.title}`,
                  form: 'updateEvent',
                  size: 'xl',
                  element: (
                    <CreateEventForm
                      event={row.original}
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
              onClick={() => {
                send('OPEN', {
                  title: `Delete Event ${row.original.name}`,
                  form: 'deleteEvent',
                  size: 'xl',
                  element: (
                    <>
                      <Alert
                        color="red"
                        title={`Are you sure you want to delete ${row.original.title}?`}
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
                            console.log('deleting', row.original._id);
                            deleteEventMutation.mutate(row.original._id);
                            send('CLOSE');
                          }}
                        >
                          Delete
                        </Button>
                      </Group>
                    </>
                  ),
                });
              }}
            >
              <IconTrash size={'19px'} />
            </Button>
          </Button.Group>
        )}
        details={({ row }) => (
          <>
            <Text>{row.original.description}</Text>
          </>
        )}
      />

      <FormModal state={state} send={send} />
    </>
  );
};

export default SchedulePage;

SchedulePage.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
