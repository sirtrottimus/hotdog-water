import {
  ActionIcon,
  AppShell,
  Box,
  Button,
  Group,
  Header,
  Navbar,
  ScrollArea,
  Text,
  createStyles,
  useMantineColorScheme,
  Alert,
  Container,
  Flex,
  Code,
  Anchor,
} from '@mantine/core';
import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { useUsers } from '../../hooks/userQuery';
import {
  IconAlertCircle,
  IconBrandDiscordFilled,
  IconBrandTwitch,
  IconBrandTwitterFilled,
  IconBrandYoutube,
  IconHexagonLetterM,
  IconHome,
  IconListDetails,
  IconMoonStars,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';

import Head from 'next/head';
import { useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { capitalizeFirstLetter, checkTwitchStatus } from '../../utils/helpers';
import CenteredLoader from '../misc/CenteredLoader';
import { User } from '../misc/User';
import Sidebar, { Link as LinkInt } from '../misc/Sidebar';
import FormModal from '../modals/form';
import { useMachine } from '@xstate/react';
import formMachine from '../../utils/machines/modalFormMachine';
import TwitchService from '../../utils/api/TwitchService';
import { useJWTAuth } from '../../hooks/useGetJWTAuthStatus';
import Link from 'next/link';

const useStyles = createStyles((theme) => ({
  links: {
    marginLeft: '20px',
    marginRight: '20px',
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
}));

export function MainLayout({ children }: { children: ReactNode }) {
  const [state, send] = useMachine(formMachine);
  const { classes } = useStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const userQuery = useUsers();
  const smallScreen = useMediaQuery('(max-width: 768px)');
  const { users: user } = userQuery;
  const {
    jwtAuth,
    isError: checkJWTAuthStatus,
    isLoading: checkJWTAuthStatusLoading,
  } = useJWTAuth();
  const [isBlurred, setIsBlurred] = React.useState(true);

  console.log(jwtAuth);

  const { theme } = useStyles();
  const [mini, setMini] = useState(false);

  useEffect(() => {
    async function TwitchStatus() {
      const response = await TwitchService.getOne();
      if (!response.data) return;

      const res = await checkTwitchStatus(response.data);
      if (!res.isLive) {
        setIsBlurred(false);
      }
    }
    TwitchStatus();
  }, []);

  switch (true) {
    case userQuery.isLoading:
      return <CenteredLoader colorScheme={colorScheme} size={'xl'} />;

    case !userQuery.isLoading && !userQuery.users:
      router.push('/');
      return (
        <CenteredLoader colorScheme={colorScheme} redirecting size={'xl'} />
      );
    case userQuery.isError:
      return <CenteredLoader colorScheme={colorScheme} errored size={'xl'} />;
    default:
      break;
  }

  children = React.Children.map(children, (el: ReactNode) => {
    return React.cloneElement(el as ReactElement, {
      user,
      isBlurred,
      setIsBlurred,
    });
  });

  const jwtAuthStatus = checkJWTAuthStatusLoading ? (
    <CenteredLoader colorScheme={colorScheme} size={'xl'} />
  ) : (
    <Box mb={30}>
      {jwtAuth?.map((auth) => (
        <Alert
          key={auth.provider}
          color="red"
          title={`${capitalizeFirstLetter(
            auth.provider
          )} JWT Token is missing or invalid.`}
          withCloseButton={false}
          mt="md"
        >
          <Text>
            {capitalizeFirstLetter(auth.provider)} JWT Token is missing or
            invalid. Please head over to the{' '}
            <Link href="/socials/streamElements">
              <Anchor color="red">Stream Elements</Anchor>
            </Link>{' '}
            page and re-authenticate {auth.provider}.
          </Text>
        </Alert>
      ))}
    </Box>
  );

  const data = [
    {
      icon: <IconHome size={16} />,
      color: 'blue',
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: <IconSettings size={16} />,
      color: 'teal',
      label: 'Socials Settings',
      path: '/socials',
      children: [
        {
          color: 'blue',
          label: 'Discord',
          path: '/socials/discord',
          icon: <IconBrandDiscordFilled size={16} />,
          parent: '/socials',
        },
        {
          color: 'violet',
          label: 'Twitch',
          path: '/socials/twitch',
          icon: <IconBrandTwitch size={16} />,
        },
        {
          color: 'blue',
          label: 'Twitter',
          path: '/socials/twitter',
          icon: <IconBrandTwitterFilled size={16} />,
        },
        {
          color: 'green',
          label: 'Stream Elements',
          path: '/socials/streamElements',
          icon: <IconHexagonLetterM size={16} />,
        },
        {
          color: 'red',
          label: 'YouTube',
          path: '/socials/youtube',
          icon: <IconBrandYoutube size={16} />,
        },
      ],
    },
    {
      icon: <IconListDetails />,
      color: 'red',
      label: 'Admin',
      path: '/admin',
      perms: ['SUPERADMIN', 'ADMIN'],
      children: [
        {
          color: 'violet',
          label: 'Users',
          path: '/admin/users',
          parent: '/admin',
          perms: ['SUPERADMIN', 'ADMIN', 'VIEW_USERS_PAGE'],
        },
        {
          color: 'violet',
          label: 'Roles',
          path: '/admin/roles',
          parent: '/admin',
          perms: ['SUPERADMIN', 'ADMIN', 'VIEW_ROLES_PAGE'],
        },
        {
          color: 'violet',
          label: 'Permissions',
          path: '/admin/permissions',
          parent: '/admin',
          perms: ['SUPERADMIN', 'ADMIN', 'VIEW_PERMISSIONS_PAGE'],
        },
        {
          color: 'violet',
          label: 'Audit',
          path: '/admin/audit',
          parent: '/admin',
          perms: ['SUPERADMIN', 'ADMIN', 'VIEW_AUDIT_PAGE'],
        },
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>
          {process.env.NEXT_PUBLIC_NAME} v{process.env.NEXT_PUBLIC_VERSION} |{' '}
          {capitalizeFirstLetter(router.asPath.split('/').slice(1)[0])}
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <AppShell
        padding="sm"
        navbarOffsetBreakpoint="sm"
        zIndex={199}
        asideOffsetBreakpoint={smallScreen ? undefined : 'sm'}
        navbar={
          <Navbar hidden={smallScreen} width={{ base: 300 }}>
            <Navbar.Section
              grow
              component={ScrollArea}
              mx="-xs"
              px="xs"
              className={classes.links}
            >
              <Box py="md">
                <div className={classes.linksInner}>
                  <Sidebar
                    links={data as LinkInt[]}
                    mini={mini}
                    setMini={setMini}
                    user={user}
                  />
                </div>
              </Box>
            </Navbar.Section>
            <Navbar.Section>
              <User
                user={user}
                isBlurred={isBlurred}
                setIsBlurred={setIsBlurred}
              />
            </Navbar.Section>
          </Navbar>
        }
        header={
          <Header height={60} p="xs">
            <Group sx={{ height: '100%' }} px={20} position="apart">
              <Group position="apart">
                <Text
                  size="xl"
                  weight={700}
                  color={
                    theme.colorScheme === 'dark'
                      ? theme.colors.dark[0]
                      : theme.colors.gray[9]
                  }
                  className={'textGradient'}
                >
                  {process.env.NEXT_PUBLIC_NAME?.toUpperCase()} DASHBOARD
                </Text>
                <Code sx={{ fontWeight: 700 }}>
                  {process.env.NEXT_PUBLIC_VERSION}
                </Code>
              </Group>
              <Group>
                <ActionIcon
                  variant="default"
                  onClick={() => toggleColorScheme()}
                  size={30}
                  aria-label={
                    colorScheme === 'dark'
                      ? 'Switch to light mode'
                      : 'Switch to dark mode'
                  }
                  sx={{
                    border:
                      theme.colorScheme === 'dark'
                        ? '2px solid #373A40;'
                        : '2px solid #ced4da;',
                  }}
                >
                  {colorScheme === 'dark' ? (
                    <IconSun size={16} />
                  ) : (
                    <IconMoonStars size={16} />
                  )}
                </ActionIcon>
              </Group>
            </Group>
          </Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === 'dark'
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        {isBlurred && (
          <Container size={'xl'}>
            <Alert
              title="You're in Streamer mode."
              color="violet"
              mt="md"
              mb="md"
              icon={<IconAlertCircle size="1rem" />}
            >
              <Flex align={'center'} justify={'space-between'}>
                <Text size="sm" mr={10}>
                  You are currently in Streamer mode. This means that potential
                  sensitive information will be blurred out.
                </Text>
                <Button
                  variant="outline"
                  onClick={() =>
                    send('OPEN', {
                      title: 'Disable Streamer mode',
                      form: 'disableStreamerMode',
                      size: 'lg',
                      element: (
                        <>
                          <Alert
                            color="red"
                            title={
                              'Are you sure you want to disable streamer mode?'
                            }
                            withCloseButton={false}
                          >
                            <Text>
                              it&apos;s recommended to only disable streamer
                              mode when you are not streaming. If you are
                              streaming, it is recommended to keep streamer mode
                              enabled. If you must disable streamer mode while
                              streaming, make sure to hide your screen first.
                            </Text>

                            <Text mt={10} size={'sm'} c="dimmed">
                              Disabling streamer mode will allow you and anyone
                              else watching your stream to see possible
                              sensitive information.
                            </Text>
                          </Alert>

                          <Group mt={10} position="right">
                            <Button
                              variant="light"
                              onClick={() => send('CLOSE')}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="filled"
                              color="red"
                              onClick={() => {
                                setIsBlurred(false);
                                send('CLOSE');
                              }}
                            >
                              Yes, disable streamer mode
                            </Button>
                          </Group>
                        </>
                      ),
                    })
                  }
                  color="violet"
                >
                  Disable Streamer mode
                </Button>
              </Flex>
            </Alert>
          </Container>
        )}
        {jwtAuthStatus}
        {children}
      </AppShell>
      <FormModal state={state} send={send} />
    </>
  );
}
