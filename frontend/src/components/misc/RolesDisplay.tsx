import {
  ActionIcon,
  Badge,
  Button,
  Center,
  DefaultMantineColor,
  Group,
  Text,
  useMantineTheme,
} from '@mantine/core';
import React from 'react';
import { IconX } from '@tabler/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'react-toastify';
import UserService, { UserInt } from '../../utils/api/UserService';
import { RoleInt } from '../../utils/api/RoleService';

export default function RolesDisplay({
  member,
  isMe,
  send,
  user,
  displayActions,
}: {
  member: UserInt;
  isMe: boolean;
  send: any;
  user: UserInt;
  displayActions: boolean;
}) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const removeRoleMutation = useMutation(
    (role: RoleInt) =>
      UserService.updateRoles(member._id, [role._id], 'remove'),
    {
      onSuccess: () => {
        toast.success('Role removed successfully');
        // Redirect the user to a different page or display a success message
        queryClient.invalidateQueries(['roles']).finally(() => {});
        queryClient.invalidateQueries(['members']).finally(() => {});
      },
      onError: (error) => {
        toast.error(error as string);

        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {},
    }
  );

  const handleRemoveRole = (role: RoleInt): void => {
    send('CLOSE');
    removeRoleMutation.mutate(role);
  };

  const canRemoveRole = (roleTC: RoleInt) => {
    if (roleTC.name === 'Senior Admin') return false;
    if (user.roles.find((role) => role.name === 'Senior Admin')) return true;
    if (isMe) return false;

    const hasAssignableRole = user.roles?.some((role) => {
      return roleTC.assignables.some(
        (assignable: unknown) => assignable === role._id
      );
    });

    return hasAssignableRole;
  };

  const removeButton = (role: RoleInt) => {
    if (!canRemoveRole(role)) return;
    return (
      <ActionIcon
        size="xs"
        color="gray"
        radius="xl"
        variant="transparent"
        sx={{
          '&:hover': {
            backgroundColor: theme.colors.red[1],
            color: theme.colors.red[9],
          },
        }}
        onClick={() => {
          send('OPEN', {
            header: 'Remove Role',
            title: `Remove ${member.username}'s Role`,
            form: 'removeRole',
            element: (
              <>
                <Text>
                  Are you sure you want to remove {member.username}&apos;s role?
                </Text>
                <Group mt={10} position="right">
                  <Button variant="outline" onClick={() => send('CLOSE')}>
                    Cancel
                  </Button>
                  <Button
                    variant="filled"
                    color="red"
                    onClick={() => {
                      handleRemoveRole(role);
                    }}
                  >
                    Remove Role
                  </Button>
                </Group>
              </>
            ),
          });
        }}
      >
        <IconX size={10} />
      </ActionIcon>
    );
  };

  return (
    <>
      {member.roles?.length > 0 ? (
        <Group spacing={6} mt={10}>
          {member.roles?.map((role: RoleInt) => (
            <Badge
              variant="dot"
              key={role._id}
              radius={'xs'}
              mx={-1}
              sx={{
                paddingRight: canRemoveRole(role) ? 0 : 10,
                '::before': {
                  content: '""',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: role.color as DefaultMantineColor,
                  marginRight: 5,
                },
                backgroundColor:
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[4]
                    : theme.colors.gray[2],
                borderColor:
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[4]
                    : theme.colors.gray[2],
              }}
              rightSection={displayActions ? removeButton(role) : null}
            >
              {role.name}
            </Badge>
          ))}
        </Group>
      ) : (
        <Center>
          <Text>{isMe ? 'You have' : `${member.username} has`} no roles</Text>
        </Center>
      )}
    </>
  );
}
