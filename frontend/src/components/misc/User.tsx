import React from 'react';
import {
  IconChevronRight,
  IconChevronLeft,
  IconSettings,
  IconLogout,
  IconUserSearch,
} from '@tabler/icons';
import {
  UnstyledButton,
  Group,
  Avatar,
  Text,
  Box,
  useMantineTheme,
  Menu,
} from '@mantine/core';
import { UserInt } from '../../utils/types';
import { useMediaQuery } from '@mantine/hooks';
import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import UserService from '../../utils/api/UserService';
export function User({
  user,
  isBlurred,
  setIsBlurred,
}: {
  user: UserInt | undefined | null;
  isBlurred: boolean;
  setIsBlurred: (isBlurred: boolean) => void;
}) {
  const theme = useMantineTheme();
  const matchesSm = useMediaQuery('(min-width: 900px)');
  const router = useRouter();

  const handleBlur = () => {
    setIsBlurred(true);
  };

  const handleLogout = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const result = await UserService.logout();
    if (result.success) {
      deleteCookie('connect.sid', { path: '/' });
    }
  };

  return (
    <Box
      sx={{
        paddingTop: theme.spacing.sm,
        borderTop: `1px solid ${
          theme.colorScheme === 'dark'
            ? theme.colors.dark[4]
            : theme.colors.gray[2]
        }`,
      }}
    >
      {user ? (
        <Menu shadow="ms" width={300} position="right-end">
          <Menu.Target>
            <UnstyledButton
              sx={{
                display: 'block',
                width: '100%',
                padding: theme.spacing.xs,
                borderRadius: theme.radius.sm,
                color:
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[0]
                    : theme.black,

                '&:hover': {
                  backgroundColor:
                    theme.colorScheme === 'dark'
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },
              }}
            >
              <Group>
                <Avatar
                  src={null}
                  radius="xl"
                  size={matchesSm ? 'sm' : 'md'}
                  alt="User avatar"
                  color={'blue'}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }} mb={10}>
                  <Text fz={{ base: 'sm', sm: 'xs', md: 'sm' }} weight={500}>
                    {user.username}
                  </Text>
                </Box>

                {theme.dir === 'ltr' ? (
                  <IconChevronRight size={18} />
                ) : (
                  <IconChevronLeft size={18} />
                )}
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>User</Menu.Label>
            <Menu.Item
              icon={<IconSettings size={14} />}
              onClick={() =>
                router
                  .push(
                    `/dashboard/profile/${user._id}?path=${
                      router.asPath.split('?')[0]
                    }`
                  )
                  .finally(() => {})
              }
            >
              Account Settings
            </Menu.Item>
            <Menu.Item icon={<IconUserSearch size={14} />} onClick={handleBlur}>
              Anonymise Details
            </Menu.Item>
            <Menu.Item
              icon={<IconLogout size={14} />}
              color="red"
              onClick={handleLogout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <Box>Login</Box>
      )}
    </Box>
  );
}
