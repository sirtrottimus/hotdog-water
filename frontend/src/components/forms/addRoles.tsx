import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Flex,
  LoadingOverlay,
  TransferList,
  TransferListData,
} from '@mantine/core';
import { toast } from 'react-toastify';

import { UserInt } from '../../utils/types';
import RoleService from '../../utils/api/RoleService';
import UserService from '../../utils/api/UserService';

export default function AddRolesForm({
  member,
  submitCallback,
}: {
  member: UserInt;
  submitCallback?: (any: any) => void;
}) {
  const {
    data: roles,
    isLoading: rolesLoading,
    isError: rolesError,
  } = useQuery(['roles'], async () => {
    const response = await RoleService.getAssignable();
    return response.data;
  });

  //React Hook Form to handle form state and validation

  const { control, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      roles: [] as string[],
    },
  });

  const initialValues: TransferListData = [[], []];

  const [data, setData] = useState<TransferListData>(initialValues);
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const addRolesMutation = useMutation(
    (data: any) => UserService.updateRoles(member._id, data),
    {
      onSuccess: async () => {
        toast.success('Roles added successfully');
        reset();
        await queryClient.invalidateQueries(['members', member._id]);
        if (submitCallback) submitCallback(true);
        setSubmitting(false);
      },
      onError: (error) => {
        toast.error(error as string);
        setSubmitting(false);
      },
      onMutate: () => {
        setSubmitting(true);
      },
    }
  );

  useEffect(() => {
    if (roles) {
      // set the roles to the available roles
      // but remove the roles that the user already has
      // final format is [availableRoles, selectedRoles]
      // they need a value and a label
      // Both Roles are RoleInt so includes.(role._id) doesn't work
      const availableRoles = roles
        .filter((role) => !member.roles.some((mRole) => mRole._id === role._id))
        .map((role) => ({ value: role._id, label: role.name }));

      setData([availableRoles, []]);
    }
  }, [roles, member]);

  if (rolesLoading) return <div>Loading...</div>;

  if (rolesError) return <div>Error</div>;

  // Event handler for the TransferList component
  const handleTransferChange = (data: TransferListData) => {
    setValue(
      'roles',
      data[1].map((item) => item.value)
    );
    setData(data);
  };

  if (data[0].length === 0 && data[1].length === 0) {
    return (
      <Alert color="blue" title="Uh-oh!">
        This user already has all the roles you can assign.
      </Alert>
    );
  }

  return (
    <Box pos="relative">
      <LoadingOverlay visible={submitting} overlayBlur={2} />

      <form
        onSubmit={handleSubmit((data) => {
          addRolesMutation.mutate(data);
        })}
      >
        <Controller
          name="roles"
          control={control}
          render={({ field }) => (
            <TransferList
              {...field}
              value={data}
              onChange={handleTransferChange}
              titles={['Available Roles', 'Selected Roles']}
              nothingFound="No roles found"
              placeholder="Search roles..."
            />
          )}
        />
        <Flex mt={5} align="end" justify={'end'}>
          <Button mt={10} type="submit">
            Submit
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
