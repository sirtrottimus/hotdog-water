import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  MultiSelect,
  Select,
  TextInput,
} from '@mantine/core';
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
import ScheduleService, {
  FormScheduleInput,
  ScheduleInt,
} from '../../utils/api/ScheduleService';
import { DatePickerInput, TimeInput } from '@mantine/dates';

const schema = z.object({
  title: z.string().min(3, { message: 'Title is required' }),
  date: z.date().optional().nullable(),
  description: z.string().min(3, { message: 'Description is required' }),
  type: z.enum([
    'stream',
    'event',
    'video',
    'announcement',
    'bored',
    'podcast',
  ]),
  startTime: z.string(),
  endTime: z.string().optional(),
  link: z.string().optional(),
  isRecurring: z.boolean(),
  recurringDays: z.array(z.string()),
  overridesRecurring: z.boolean().optional(),
  membersOnly: z.boolean().optional(),
  _id: z.string().optional(),
}) satisfies z.ZodType<FormScheduleInput, z.ZodTypeDef, unknown>;

export default function CreateEventForm(
  {
    submitCallback,
    isBlurred,
    event,
    action = 'create',
  }: {
    submitCallback?: (any: any) => void;
    isBlurred?: boolean;
    event?: ScheduleInt;
    action?: 'create' | 'update';
  } = { isBlurred: false }
) {
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = {
    title: event?.title ?? '',
    date: new Date(event?.date! ?? new Date()),
    description: event?.description ?? '',
    type: event?.type ?? 'stream',
    startTime: event?.startTime ?? '',
    endTime: event?.endTime ?? '',
    link: event?.link ?? '',
    isRecurring: event?.isRecurring ?? false,
    recurringDays: event?.recurringDays ?? [],
    overridesRecurring: event?.overridesRecurring ?? false,
    membersOnly: event?.membersOnly ?? false,
    _id: event?._id ?? undefined,
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

  const createEventMutation = useMutation(
    async (data: FormScheduleInput) => ScheduleService.create(data),
    {
      onSuccess: () => {
        toast.success('Event created successfully');
        // Redirect the user to a different page or display a success message

        queryClient.invalidateQueries(['schedule']).finally(() => {});
        reset();
        setSubmitting(false);
        submitCallback?.('close');
      },
      onError: (response: APIResponse<UserInt>) => {
        if (response.error)
          toast.error(
            `Error creating Event ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
      },
    }
  );

  const updateEventMutation = useMutation(
    async (data: FormScheduleInput) => ScheduleService.update(data),
    {
      onSuccess: () => {
        toast.success('Event updated successfully');
        // Redirect the user to a different page or display a success message

        queryClient.invalidateQueries(['schedule']).finally(() => {});
        reset();
        setSubmitting(false);
        submitCallback?.('close');
      },
      onError: (response: APIResponse<UserInt>) => {
        if (response.error)
          toast.error(
            `Error updating Event ${response.error.response?.data?.msg ?? ''}`
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
          if (action === 'create') {
            createEventMutation.mutate(data);
          } else {
            updateEventMutation.mutate(data);
          }
        })}
      >
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              mt={5}
              label="Title"
              placeholder="Event Title"
              required
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              {...field}
              mt={5}
              label="Date"
              clearable
              error={errors.date?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              mt={5}
              label="Description"
              placeholder="Event Description"
              required
              error={errors.description?.message}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              mt={5}
              data={[
                'stream',
                'event',
                'video',
                'announcement',
                'bored',
                'podcast',
              ]}
              label="Type"
              required
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          name="startTime"
          control={control}
          render={({ field }) => (
            <TimeInput
              {...field}
              mt={5}
              label="Start Time"
              required
              error={errors.startTime?.message}
            />
          )}
        />

        <Controller
          name="endTime"
          control={control}
          render={({ field }) => (
            <TimeInput
              {...field}
              mt={5}
              label="End Time"
              error={errors.endTime?.message}
            />
          )}
        />

        <Controller
          name="link"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              mt={5}
              label="Link"
              placeholder="Event Link"
              error={errors.link?.message}
            />
          )}
        />

        <Controller
          name="isRecurring"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              label="Recurring"
              mt={5}
              value={field.value ? 1 : 0}
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              error={errors.isRecurring?.message}
              description="Check this box if the event is recurring"
            />
          )}
        />

        <Controller
          name="recurringDays"
          control={control}
          render={({ field }) => (
            <MultiSelect
              {...field}
              mt={5}
              data={[
                'Daily',
                'Mondays',
                'Tuesdays',
                'Wednesdays',
                'Thursdays',
                'Fridays',
                'Sporadic',
              ]}
              label="Recurring Days"
              error={errors.recurringDays?.message}
            />
          )}
        />

        <Controller
          name="membersOnly"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              label="Members Only"
              mt={5}
              value={field.value ? 1 : 0}
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              error={errors.membersOnly?.message}
              description="Check this box if this event is for members only"
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
            Create Event
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
