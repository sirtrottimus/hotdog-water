import React, { useState } from 'react';
import { Box, Button, Group, LoadingOverlay, TextInput } from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { APIResponse } from '../../utils/types';
import UserService, {
  FormUserInput,
  UserInt,
} from '../../utils/api/UserService';

const schema = z.object({
  discordId: z
    .string()
    .min(17, { message: 'Discord ID is required' })
    .max(18, { message: 'Discord ID needs to be a valid length' }),
}) satisfies z.ZodType<FormUserInput, z.ZodTypeDef, unknown>;

export default function CreateUserForm(
  {
    submitCallback,
    isBlurred,
  }: {
    submitCallback?: (any: any) => void;
    isBlurred?: boolean;
  } = { isBlurred: false }
) {
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = {
    discordId: '',
  };

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();

  const createUserMutation = useMutation(
    async (data: FormUserInput) => UserService.create(data),
    {
      onSuccess: () => {
        toast.success('User Account created successfully');
        // Redirect the user to a different page or display a success message

        queryClient.invalidateQueries(['users']).finally(() => {});
        reset();
        setSubmitting(false);
        submitCallback?.('close');
      },
      onError: (response: APIResponse<UserInt>) => {
        if (response.error)
          toast.error(
            `Error creating User ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
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
          createUserMutation.mutate(data);
        })}
      >
        <Controller
          name="discordId"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Discord ID"
              placeholder="Discord ID"
              withAsterisk
              mb={30}
              disabled={isBlurred}
              value={isBlurred ? '********' : field.value}
              error={errors.discordId?.message?.toString()}
              description="The Discord ID of the user you want to create.Make sure you have the correct ID, otherwise the user will not be able to access the site."
            />
          )}
        />

        <Group position="center" mt={10}>
          <Button
            variant="gradient"
            gradient={{
              from: '#6838f1',
              to: '#dc51f2',
            }}
            size="md"
            radius="sm"
            my={10}
            styles={{
              root: {
                display: 'block',
              },
            }}
            type="submit"
            loading={submitting}
            disabled={!isDirty}
          >
            Create User
          </Button>
          <Button
            variant="light"
            color="gray"
            size="md"
            radius="sm"
            my={10}
            styles={{
              root: {
                display: 'block',
              },
            }}
            onClick={() => reset()}
            disabled={!isDirty}
          >
            Cancel
          </Button>
        </Group>
      </form>
    </Box>
  );
}
