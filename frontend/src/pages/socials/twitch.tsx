import { ReactElement, useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { MainLayout } from '../../components/Layout/mainLayout';

import { APIResponse, UserInt as User } from '../../utils/types';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Prism } from '@mantine/prism';
import TwitchService, {
  TwitchSettingsInt,
} from '../../utils/api/TwitchService';
import useAuthorization from '../../hooks/useAuthorization';
import { useRouter } from 'next/router';

type FormTwitchSettingsInput = {
  twitchUsername: string;
  twitchClientID: string;
  twitchClientSecret: string;
};

const schema = z.object({
  twitchUsername: z.string().min(1, { message: 'Twitch username is required' }),
  twitchClientID: z
    .string()
    .min(1, { message: 'Twitch Client ID is required' }),
  twitchClientSecret: z
    .string()
    .min(1, { message: 'Twitch Client Secret is required' }),
});

export default function Home({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
  const theme = useMantineTheme();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [update, setUpdate] = useState(false);
  const [testResult, setTestResult] = useState({}) as any;
  const [testRan, setTestRan] = useState(false);

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery(
    ['twitchSettings'], // query key
    async () => {
      const response = await TwitchService.getOne();
      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    } // query function
  );

  const defaultValues = {
    twitchUsername: '',
    twitchClientID: '',
    twitchClientSecret: '',
  };

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<FormTwitchSettingsInput>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();
  const createTwitchSettingsMutation = useMutation(
    async (data: FormTwitchSettingsInput) => TwitchService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['twitchSettings']).finally(() => {});
        setSubmitting(false);
        toast.success('Twitch settings updated successfully!');
      },
      onError: (response: APIResponse<TwitchSettingsInt>) => {
        if (response.error)
          toast.error(
            `Error creating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
        setTestRan(false);
      },
    }
  );

  const updateTwitchSettingsMutation = useMutation(
    async (data: FormTwitchSettingsInput) => TwitchService.update(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['twitchSettings']).finally(() => {});
        setSubmitting(false);
        toast.success('Twitch settings updated successfully!');
      },
      onError: (response: APIResponse<TwitchSettingsInt>) => {
        if (response.error)
          toast.error(
            `Error creating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
        setTestRan(false);
      },
    }
  );

  const handleTest = async () => {
    if (settings) {
      const response = await TwitchService.test(settings);
      if (response.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed!');
      }
      setTestRan(true);
      setTestResult(response);
    }
  };

  useEffect(() => {
    if (settings) {
      setUpdate(true);
      reset(settings);
    }
  }, [settings, reset]);

  const { isAuthorized: canEdit } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'EDIT_TWITCH_SETTINGS'],
    'canEdit'
  );

  const { isAuthorized: canTest } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'TEST_TWITCH_SETTINGS'],
    'canTest'
  );

  const { isAuthorized: canView, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'VIEW_TWITCH_SETTINGS'],
    'canView'
  );

  if (!isAuthLoading && canView)
    return (
      <>
        <Center>
          <Title>Twitch Settings</Title>
        </Center>
        <Container>
          <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayBlur={2} />
            <Paper
              mt={100}
              p={'xl'}
              sx={{
                border: `3px solid ${
                  theme.colorScheme === 'dark'
                    ? theme.colors.dark[4]
                    : theme.colors.gray[2]
                }`,
              }}
            >
              {!isLoading && !settings && !isError && (
                <Alert mb={20}>
                  <b>Warning:</b> You have not set up your Twitch settings yet.
                  You will not be able to find out if your Twitch stream is live
                  until you do so.
                </Alert>
              )}
              {!isLoading && isError && (
                <Alert mb={20} color="red">
                  <b>Error:</b> Could not load Twitch settings. Please try
                  again, or contact the developer.
                </Alert>
              )}
              <form
                onSubmit={handleSubmit((data) =>
                  update
                    ? updateTwitchSettingsMutation.mutate(data)
                    : createTwitchSettingsMutation.mutate(data)
                )}
              >
                <Controller
                  name="twitchUsername"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="Twitch Username"
                      placeholder="Twitch Username"
                      withAsterisk
                      mb={30}
                      disabled={isBlurred || !canEdit}
                      error={errors.twitchUsername?.message}
                      description="This is the username of the Twitch account you want to check is live."
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="twitchClientID"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      label="Twitch Client ID"
                      placeholder="Twitch Client ID"
                      withAsterisk
                      mb={30}
                      disabled={isBlurred || !canEdit}
                      error={errors.twitchClientID?.message}
                      description="This is the Client ID of the Twitch bot. You can get this from the Twitch Developer Console. Keep this secret!"
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="twitchClientSecret"
                  control={control}
                  render={({ field }) => (
                    <PasswordInput
                      label="Twitch Client Secret"
                      placeholder="Twitch Client Secret"
                      withAsterisk
                      mb={30}
                      disabled={isBlurred || !canEdit}
                      error={errors.twitchClientSecret?.message}
                      description="This is the Client Secret of the Twitch bot. You can get this from the Twitch Developer Console. Keep this secret!"
                      {...field}
                    />
                  )}
                />

                <Group position="center">
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
                    loading={submitting}
                    type="submit"
                    disabled={!isDirty || !canEdit}
                  >
                    {update ? 'Update' : 'Save'}
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
                    onClick={() => {
                      reset();
                    }}
                    disabled={!isDirty || !canEdit}
                  >
                    Cancel
                  </Button>
                </Group>
              </form>
              <Divider />
              <Group position="center" mt={10}>
                <Button
                  variant="outline"
                  color="violet"
                  size="md"
                  radius="sm"
                  my={10}
                  styles={{
                    root: {
                      display: 'block',
                    },
                  }}
                  onClick={handleTest}
                  disabled={!canTest || !settings}
                >
                  Test Connection
                </Button>
              </Group>
              <Box
                p={'xl'}
                sx={{
                  background: ` ${
                    theme.colorScheme === 'dark'
                      ? theme.colors.dark[4]
                      : theme.colors.gray[2]
                  }`,
                  borderRadius: theme.radius.sm,
                  color: `${
                    theme.colorScheme === 'dark'
                      ? theme.colors.dark[0]
                      : theme.colors.gray[7]
                  }`,
                }}
              >
                {testRan ? (
                  <>
                    {testResult.success ? (
                      <Alert
                        color="green"
                        title="Success!"
                        withCloseButton={false}
                        mb={10}
                      >
                        Connection successful! You should see your Twitch Stream
                        Details below.
                      </Alert>
                    ) : (
                      <Alert
                        color="red"
                        title="Error!"
                        withCloseButton={false}
                        mb={10}
                      >
                        Connection failed! Please check your settings and try
                        again. If the problem persists, please contact the
                        developer.
                      </Alert>
                    )}
                    <Prism language="json">
                      {JSON.stringify(testResult, null, 2)}
                    </Prism>
                  </>
                ) : (
                  <>
                    <Prism language="json">
                      Run a test to see the result here.
                    </Prism>
                  </>
                )}
              </Box>
            </Paper>
          </Box>
        </Container>
      </>
    );

  if (!isAuthLoading && !canView) {
    router.push('/dashboard').finally(() => {
      toast.error('You are not authorized to view this page.');
    });
    return (
      <Center>
        <Title>You are not authorized to view this page.</Title>
      </Center>
    );
  }
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
