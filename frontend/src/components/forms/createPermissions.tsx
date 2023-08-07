import React, { useState } from 'react';
import { Box, Button, LoadingOverlay, TextInput } from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PermissionService, {
  FormPermissionInput,
  PermissionInt,
} from '../../utils/api/PermissionService';

const schema = z.object({
  name: z
    .string()
    .min(3, 'Name is too short')
    .max(50, 'Name is too long')
    .regex(/^[A-Z_]+$/, 'Name must be all uppercase letters'),
  description: z.string().max(500, 'Description is too long').optional(),
  _id: z.string().optional(),
}) satisfies z.ZodType<FormPermissionInput, z.ZodTypeDef, unknown>;

export default function CreatePermissionForm({
  submitCallback,
  permission,
  action = 'create',
}: {
  submitCallback?: (any: any) => void;
  permission?: PermissionInt;
  action?: 'create' | 'update';
}) {
  const [submitting, setSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm({
    defaultValues: {
      name: permission?.name ?? '',
      description: permission?.description ?? '',
      _id: permission?._id ?? undefined,
    },
    resolver: zodResolver(schema),
  });
  const queryClient = useQueryClient();
  const createPermissionMutation = useMutation(
    (newPermission: any) => PermissionService.create(newPermission),
    {
      onSuccess: (_, data) => {
        toast.success('Permission created successfully');
        reset();
        queryClient.invalidateQueries(['permissions']).finally(() => {});
        if (submitCallback) submitCallback(true);
        setSubmitting(false);
      },
      onError: (error) => {
        toast.error('Error creating permission');
        setSubmitting(false);
      },
      onMutate: () => {
        setSubmitting(true);
      },
    }
  );

  const updatePermissionMutation = useMutation(
    (newPermission: any) => PermissionService.update(newPermission),
    {
      onSuccess: () => {
        toast.success('Permission updated successfully');
        reset();
        queryClient.invalidateQueries(['permissions']).finally(() => {});
        if (submitCallback) submitCallback(true);
        setSubmitting(false);
      },
      onError: () => {
        toast.error('Error updating permission');
        setSubmitting(false);
      },
      onMutate: () => {
        setSubmitting(true);
      },
    }
  );

  return (
    <Box pos="relative">
      <LoadingOverlay visible={submitting} overlayBlur={2} />

      <form
        onSubmit={handleSubmit((data) => {
          if (action === 'update') {
            updatePermissionMutation.mutate(data);
            return;
          }
          createPermissionMutation.mutate(data);
        })}
      >
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextInput
              label="Name"
              placeholder="Enter a name for the permission"
              error={errors.name?.message?.toString()}
              {...field}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextInput
              label="Description"
              placeholder="Enter a description for the permission"
              {...field}
            />
          )}
        />

        <Button type="submit" color="violet" mt={10} disabled={!isDirty}>
          {action === 'create' ? 'Create' : 'Update'} Permission
        </Button>
      </form>
    </Box>
  );
}
