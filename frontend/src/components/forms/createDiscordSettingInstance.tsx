import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  TextInput,
} from '@mantine/core';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { APIResponse } from '../../utils/types';
import DiscordService, {
  DiscordSettingsInt,
  FormDiscordSettingsInput,
} from '../../utils/api/DiscordService';

const schema = z.object({
  botName: z.string().min(1, { message: 'Bot name is required' }),
  webhookURL: z.string().url({ message: 'Webhook URL is required' }),
  identifier: z.string().min(1, { message: 'Identifier is required' }),
  isLivePostWebhook: z.boolean(),
  isAnnouncementWebhook: z.boolean(),
  isMemberOnlyWebhook: z.boolean(),
  _id: z.string().optional(),
}) satisfies z.ZodType<FormDiscordSettingsInput, z.ZodTypeDef, unknown>;

export default function CreateDiscordSettingsForm(
  {
    submitCallback,
    discordSettings,
    isBlurred,
    action,
  }: {
    submitCallback?: (any: any) => void;
    discordSettings?: DiscordSettingsInt;
    action?: 'create' | 'update';
    isBlurred?: boolean;
  } = { action: 'create', isBlurred: false }
) {
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = {
    botName: discordSettings?.botName ?? '',
    webhookURL: discordSettings?.webhookURL ?? '',
    identifier: discordSettings?.identifier ?? '',
    isLivePostWebhook: discordSettings?.isLivePostWebhook ?? false,
    isAnnouncementWebhook: discordSettings?.isAnnouncementWebhook ?? false,
    isMemberOnlyWebhook: discordSettings?.isMemberOnlyWebhook ?? false,
    _id: discordSettings?._id ?? undefined,
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

  const createDiscordSettingsMutation = useMutation(
    async (data: FormDiscordSettingsInput) => DiscordService.create(data),
    {
      onSuccess: () => {
        toast.success('Discord Settings instance created successfully');
        // Redirect the user to a different page or display a success message

        queryClient.invalidateQueries(['discordSettings']).finally(() => {});
        reset();
        setSubmitting(false);
        submitCallback?.('close');
      },
      onError: (response: APIResponse<DiscordSettingsInt>) => {
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

  const updateDiscordSettingsMutation = useMutation(
    async (data: FormDiscordSettingsInput) => DiscordService.update(data),
    {
      onSuccess: () => {
        toast.success('Discord Settings instance updated successfully');
        // Redirect the user to a different page or display a success message
        reset();
        queryClient.invalidateQueries(['discordSettings']).finally(() => {});
        setSubmitting(false);
        submitCallback?.('close');
      },
      onError: (response: APIResponse<DiscordSettingsInt>) => {
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

  return (
    <Box pos="relative">
      <LoadingOverlay visible={submitting} overlayBlur={2} />
      <form
        onSubmit={handleSubmit((data) => {
          if (action === 'update') {
            updateDiscordSettingsMutation.mutate(data);
            return;
          }
          createDiscordSettingsMutation.mutate(data);
        })}
      >
        <Controller
          name="identifier"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Identifier"
              placeholder="Identifier"
              withAsterisk
              mb={30}
              disabled={isBlurred}
              value={isBlurred ? '********' : field.value}
              error={errors.identifier?.message?.toString()}
              description="This is just a name to help you identify this Discord Webhook, and what it is used for. It can be anything you want."
            />
          )}
        />
        <Controller
          name="botName"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Discord Bot Name"
              placeholder="Discord Bot Name"
              withAsterisk
              mb={30}
              disabled={isBlurred}
              value={isBlurred ? '********' : field.value}
              error={errors.botName?.message?.toString()}
              description="This is the name of the Discord bot you want to show in the Discord server."
            />
          )}
        />
        <Controller
          name="webhookURL"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Discord Webhook URL"
              placeholder="Discord Webhook URL"
              withAsterisk
              mb={30}
              disabled={isBlurred}
              value={isBlurred ? '********' : field.value}
              error={errors.webhookURL?.message?.toString()}
              description="This is the Webhook URL of the Discord bot. You can generate this inside a channel in your Discord server."
            />
          )}
        />
        <Group position="center">
          <Controller
            name="isLivePostWebhook"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                label="Use this Discord Webhook for live posts"
                checked={field.value}
                value={field.value === true ? 0 : 1}
              />
            )}
          />

          <Controller
            name="isAnnouncementWebhook"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                label="Use this Discord Webhook for announcements"
                checked={field.value}
                value={field.value === true ? 0 : 1}
              />
            )}
          />

          <Controller
            name="isMemberOnlyWebhook"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                label="Use this Discord Webhook for member-only posts"
                checked={field.value}
                value={field.value === true ? 0 : 1}
              />
            )}
          />
        </Group>

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
            {action === 'create' ? 'Create' : 'Update'} Discord Settings
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
