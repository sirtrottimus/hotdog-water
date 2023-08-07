import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { MainLayout } from '../../../../components/Layout/mainLayout';
import {
  Box,
  Button,
  Center,
  Flex,
  Paper,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { UserInt } from '../../../../utils/types';
import { IconArrowBack, IconPlus } from '@tabler/icons-react';
import CenteredLoader from '../../../../components/misc/CenteredLoader';
import { toast } from 'react-toastify';
import { capitalizeFirstLetter } from '../../../../utils/helpers';
import { useMachine } from '@xstate/react';
import FormModal from '../../../../components/modals/form';
import formMachine from '../../../../utils/machines/modalFormMachine';
import AddRolesForm from '../../../../components/forms/addRoles';
import RolesDisplay from '../../../../components/misc/RolesDisplay';
import useAuthorization from '../../../../hooks/useAuthorization';
import UserService from '../../../../utils/api/UserService';

export default function Index({ user }: { user: UserInt }) {
  const [state, send] = useMachine(formMachine);
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const { id } = router.query;

  let path = '';
  if (router.query.path === undefined) {
    path = `${router.basePath}/personnel/members`;
  } else {
    path = router.basePath + router.query.path;
  }

  const handlePush = async (path: string): Promise<void> => {
    await router.push(path);
  };

  if (id === undefined) {
    handlePush('/personnel/members').finally(() => {
      toast.error('Could not load member');
    });
  }

  const {
    data: member,
    isLoading,
    isError,
  } = useQuery(['members', id], async () => {
    const response = await UserService.getById(id as string);
    if (response.success) {
      return response.data;
    }
  });

  const { isAuthorized: canEditAll } = useAuthorization(
    user,
    ['SUPERADMIN'],
    'editMembers'
  );

  const { isAuthorized: canEditRoles } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'MODERATOR', 'EDIT_ROLES'],
    'editRoles'
  );

  switch (true) {
    case isLoading:
      return <CenteredLoader colorScheme={colorScheme} size={'xl'} />;
    case isError:
      return <CenteredLoader colorScheme={colorScheme} errored size={'xl'} />;
    case !isLoading && !isError && !member:
      handlePush('/personnel/members').finally(() => {
        toast.error('Could not load member');
      });
      return (
        <CenteredLoader colorScheme={colorScheme} redirecting size={'xl'} />
      );
    default:
      break;
  }

  const isMe = user._id === member?._id;

  return (
    member && (
      <>
        <Button
          variant="subtle"
          onClick={() => handlePush(path).finally(() => {})}
        >
          <IconArrowBack size={'20px'} />
          {router.query.path === undefined
            ? 'Back to Members'
            : `Back to ${capitalizeFirstLetter(path.split('/').pop() ?? '')}`}
        </Button>
        <Center>
          {isMe ? (
            <Title>Your Profile</Title>
          ) : (
            <Title>{member.username}</Title>
          )}
        </Center>
        <Flex justify={'center'} mt={30} mb={40}>
          <Paper p="md" my={5} mx={10} w={'30%'}>
            <Box
              component={'dl'}
              styles={{
                dl: {
                  display: 'grid',
                  gridTemplateColumns: 'max-content auto',
                },
              }}
              sx={
                {
                  '& dt': {
                    display: 'inline-block',
                    width: '200px',
                    fontWeight: 'bold',
                  },
                  '& dd': {
                    display: 'inline-block',
                    width: 'calc(100% - 200px)',
                    marginLeft: '0',
                  },
                } as any
              }
            >
              <Title order={3}>Discord Info</Title>
              <Text component={'dt'}>Username:</Text>
              <Text component={'dd'}>{member.username}</Text>
              <Text component={'dt'}>Discord Id:</Text>
              <Text component={'dd'}>{member.discordId}</Text>
            </Box>
          </Paper>
          <Paper p="md" my={5} mx={10} w={'30%'}>
            <Flex justify={'space-between'}>
              <Title order={3}>Roles</Title>
              {(!isMe && canEditRoles) || canEditAll ? (
                <Flex justify={'left'}>
                  <Button
                    variant="subtle"
                    p={'xs'}
                    onClick={() =>
                      send('OPEN', {
                        title: `Add a Role for ${member.username}`,
                        form: 'addRole',
                        size: 'lg',
                        element: (
                          <AddRolesForm
                            member={member}
                            submitCallback={() => send('CLOSE')}
                          />
                        ),
                      })
                    }
                  >
                    <IconPlus size={'20px'} />
                    Add Role
                  </Button>
                </Flex>
              ) : (
                <div />
              )}
            </Flex>
            <RolesDisplay
              displayActions={true}
              member={member}
              isMe={isMe}
              send={send}
              user={user}
            />
          </Paper>

          <Paper my={5} />
        </Flex>

        <FormModal state={state} send={send} />
      </>
    )
  );
}
Index.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
