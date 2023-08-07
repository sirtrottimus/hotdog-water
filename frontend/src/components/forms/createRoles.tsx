import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextInput,
  MultiSelect,
  Divider,
  Title,
  TransferList,
  Button,
  Text,
  TransferListData,
  Box,
  LoadingOverlay,
  ColorInput,
  MultiSelectValueProps,
  CloseButton,
} from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { usePermissions } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';
import { z } from 'zod';
import { APIResponse, RoleInt } from '../../utils/types';
import RoleService from '../../utils/api/RoleService';

function ValueComponent({
  value,
  label,
  removable = true,
  onRemove,
  classNames,
  ...others
}: MultiSelectValueProps & { value: string; removable: boolean }) {
  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: 'flex',
          cursor: 'default',
          alignItems: 'center',
          backgroundColor:
            theme.colorScheme === 'dark'
              ? removable
                ? theme.colors.dark[3]
                : theme.colors.dark[4]
              : removable
              ? theme.colors.gray[2]
              : theme.colors.gray[0],
          border: `1px solid ${
            theme.colorScheme === 'dark'
              ? removable
                ? theme.colors.dark[3]
                : theme.colors.dark[4]
              : removable
              ? theme.colors.gray[2]
              : theme.colors.gray[0]
          }`,
          paddingLeft: 10,
          paddingRight: removable ? 0 : 10,
          paddingTop: removable ? 0 : 5,
          paddingBottom: removable ? 0 : 5,
          borderRadius: 4,
        })}
      >
        <Box sx={{ lineHeight: 1, fontSize: 12 }}>{label}</Box>
        {
          removable && (
            <CloseButton
              onMouseDown={onRemove}
              variant="transparent"
              size={22}
              iconSize={14}
              tabIndex={-1}
            />
          ) /* Display the remove button only if the value is removable */
        }
      </Box>
    </div>
  );
}

type FormRoleInput = {
  name: string;
  description: string;
  assignables: string[];
  permissions: string[];
  color: string;
};

const schema = z.object({
  name: z.string().min(4, 'You need to add a name').max(50, 'Name is too long'),
  description: z
    .string()
    .min(4, 'You need to add a description')
    .max(500, 'Description is too long'),
  assignables: z.array(z.string()),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
  color: z.string(),
  _id: z.string().optional(),
}) satisfies z.ZodType<FormRoleInput, z.ZodTypeDef, unknown>;
// Define the form data type based on the schema make sure no undefined values are allowed
export type FormRole = z.infer<typeof schema>;

export default function CreateRoleForm({
  submitCallback,
  role,
  action = 'create',
}: {
  submitCallback?: (any: any) => void;
  role?: RoleInt;
  action?: 'create' | 'update';
}) {
  const { isLoading, isError, permissions } = usePermissions();
  const { roles, isLoading: rolesLoading, isError: rolesError } = useRoles();

  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState<TransferListData>([[], []]);
  const [initialValues, setInitialValues] = useState<TransferListData>(
    {} as any
  );
  const [roleData, setRoleData] = useState<
    { value: string; label: string; removable: boolean }[]
  >([] as { value: string; label: string; removable: boolean }[]);

  // Use React Hook Form to handle form state and validation

  const [group, setGroup] = useState<
    {
      label: string;
      value: string;
    }[]
  >(
    [] as {
      label: string;
      value: string;
    }[]
  );

  const defaultValues = {
    name: role?.name ?? '',
    description: role?.description ?? '',
    permissions: role?.permissions ? role.permissions.map((p) => p._id) : [],
    assignables: role?.assignables
      ? role.assignables.map((p) => p._id)
      : ['6475c47525752298bb687c85'],
    color: role?.color ?? '',
    _id: role?._id ?? undefined,
  };

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    setValue,
    reset,
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();
  // Use React-Query to create a mutation for creating a new role
  const createRoleMutation = useMutation(
    (newRole: FormRole) => RoleService.create(newRole),
    {
      onSuccess: () => {
        toast.success('Role created successfully');
        // Redirect the user to a different page or display a success message
        reset();
        queryClient.invalidateQueries(['roles']).finally(() => {});
        if (submitCallback) submitCallback(true);
        setData(initialValues);
        setSubmitting(false);
      },
      onError: (response: APIResponse<RoleInt>) => {
        if (response.error)
          toast.error(
            `Error creating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
      },
    }
  );

  const updateRoleMutation = useMutation(
    (newRole: FormRole) => RoleService.update(newRole),
    {
      onSuccess: () => {
        toast.success('Role updated successfully');
        // Redirect the user to a different page or display a success message
        reset();
        queryClient.invalidateQueries(['roles']).finally(() => {});
        setData(initialValues);
        if (submitCallback) submitCallback(true);
        setSubmitting(false);
      },
      onError: (response: APIResponse<RoleInt>) => {
        if (response.error)
          toast.error(
            `Error updating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
      },
    }
  );

  //Set the initial data for the TransferList component without triggering a re-render
  useEffect(() => {
    if (permissions) {
      const availablePermissions = permissions.map((permission) => ({
        label: permission.name,
        value: permission._id,
      }));

      if (action === 'update') {
        const selectedPermissions = role?.permissions
          ? role.permissions.map((permission) => ({
              label: permission.name,
              value: permission._id,
            }))
          : [];

        const w = availablePermissions.filter((permission) => {
          return !selectedPermissions.some(
            (selectedPermission) =>
              selectedPermission.value === permission.value
          );
        });

        setData([w, selectedPermissions]);
        setInitialValues([w, selectedPermissions]);
        return;
      }
      setData([availablePermissions, []]);
      setInitialValues([availablePermissions, []]);
    }
  }, [permissions, role, action]);

  //Set the initial data for the MultiSelect component without triggering a re-render
  useEffect(() => {
    if (roles) {
      const availableRoles = roles.map((role) => ({
        label: role.name,
        value: role._id,
        removable: role.name !== 'Senior Admin',
      }));
      setRoleData(availableRoles);

      if (action === 'update') {
        // Set the initial value for the MultiSelect component
        const selectedRoles = role?.assignables
          ? role.assignables.map((role) => ({
              label: role.name,
              value: role._id,
              removable: role.name !== 'Senior Admin',
            }))
          : [];
        setValue(
          'assignables',
          selectedRoles.map((item) => item.value)
        );
      }
    }
  }, [roles, action, setValue, role]);

  if (isLoading || rolesLoading) return <div>Loading...</div>;

  if (isError || rolesError) return <div>Error loading required data</div>;

  // Event handler for the TransferList component
  const handleTransferChange = (data: TransferListData) => {
    setValue(
      'permissions',
      data[1].map((item) => item.value),
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
    setData(data);
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={submitting} overlayBlur={2} />
      <form
        onSubmit={handleSubmit((data) => {
          if (action === 'update') {
            updateRoleMutation.mutate(data);
            return;
          }
          createRoleMutation.mutate(data);
        })}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              key={field.name}
              {...field}
              label="Name"
              placeholder="Enter a name"
              error={errors.name?.message}
              autoComplete="off"
            />
          )}
        />

        <Controller
          name="assignables"
          control={control}
          render={({ field }) => (
            <MultiSelect
              key={field.name}
              {...field}
              data={roleData}
              label="Assignable by"
              error={errors.assignables?.message}
              placeholder="Select roles that can assign this role"
              valueComponent={ValueComponent}
              mt={20}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextInput
              key={field.name}
              {...field}
              label="Description"
              placeholder="Enter a description"
              error={errors.description?.message}
              autoComplete="off"
              mt={20}
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorInput
              key={field.name}
              {...field}
              label="Role Color"
              placeholder="Select a color"
              mt={20}
              error={errors.color?.message}
            />
          )}
        />

        <Divider my={30} />
        <Title order={3}>Permissions</Title>
        <Text>
          Select the permissions that you want to assign to this role.
        </Text>
        <Controller
          name="permissions"
          control={control}
          render={({ field }) => (
            <TransferList
              key={field.name}
              {...field}
              value={data}
              titles={['Available permissions', 'Selected permissions']}
              title="Permissions"
              listHeight={300}
              onChange={handleTransferChange}
              placeholder="Select permissions"
              color="violet"
              mt={20}
            />
          )}
        />
        {
          errors.permissions && (
            <Text color="red" mt={10}>
              {errors.permissions?.message}
            </Text>
          ) /* Display the error message if the form validation fails */
        }
        <Button type="submit" mt={10} disabled={!isDirty} color="violet">
          {action === 'create' ? 'Create' : 'Update'} Role
        </Button>
      </form>
    </Box>
  );
}
