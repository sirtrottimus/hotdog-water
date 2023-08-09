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
import StreamElementsService, {
  StreamElementsSettingsInt,
} from '../../utils/api/StreamElementsService';
import useAuthorization from '../../hooks/useAuthorization';
import { useRouter } from 'next/router';

type FormStreamElementsSettingsInput = {
  streamElementsToken: string;
};

const schema = z.object({
  streamElementsToken: z
    .string()
    .min(1, { message: 'StreamElements JWT Token is Required' }),
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
    ['streamElementsSettings'], // query key
    async () => {
      const response = await StreamElementsService.getOne();
      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    } // query function
  );

  const defaultValues = {
    streamElementsToken: '',
  };

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<FormStreamElementsSettingsInput>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();
  const createStreamElementsSettingsMutation = useMutation(
    async (data: FormStreamElementsSettingsInput) =>
      StreamElementsService.create(data),
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['streamElementsSettings'])
          .finally(() => {});
        setSubmitting(false);
        toast.success('StreamElements settings updated successfully!');
      },
      onError: (response: APIResponse<StreamElementsSettingsInt>) => {
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

  const updateStreamElementsSettingsMutation = useMutation(
    async (data: FormStreamElementsSettingsInput) =>
      StreamElementsService.update(data),
    {
      onSuccess: () => {
        queryClient
          .invalidateQueries(['streamElementsSettings'])
          .finally(() => {});
        setSubmitting(false);
        toast.success('StreamElements settings updated successfully!');
      },
      onError: (response: APIResponse<StreamElementsSettingsInt>) => {
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
      const response = 'Mock Response';
      alert(
        'This is a mock response. The test will not work until the StreamElements settings are saved.'
      );
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
    ['SUPERADMIN', 'ADMIN', 'EDIT_STREAMELEMENTS_SETTINGS'],
    'canEdit'
  );

  const { isAuthorized: canTest } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'TEST_STREAMELEMENTS_SETTINGS'],
    'canTest'
  );

  const { isAuthorized: canView, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'VIEW_STREAMELEMENTS_SETTINGS'],
    'canView'
  );

  if (!isAuthLoading && canView)
    return (
      <>
        <Center>
          <Title>StreamElements Settings</Title>
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
                  <b>Warning:</b> You have not set up your StreamElements
                  settings yet. You will not be able to use the StreamElements
                  Activity Monitor until you do so.
                </Alert>
              )}
              {!isLoading && isError && (
                <Alert mb={20} color="red">
                  <b>Error:</b> Could not load StreamElements settings. Please
                  try again, or contact the developer.
                </Alert>
              )}
              <form
                onSubmit={handleSubmit((data) =>
                  update
                    ? updateStreamElementsSettingsMutation.mutate(data)
                    : createStreamElementsSettingsMutation.mutate(data)
                )}
              >
                <Controller
                  name="streamElementsToken"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="StreamElements Username"
                      placeholder="StreamElements Username"
                      withAsterisk
                      mb={30}
                      disabled={isBlurred || !canEdit}
                      error={errors.streamElementsToken?.message}
                      description="This is the username of the StreamElements account you want to check is live."
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
                        Connection successful! You should see your
                        StreamElements Stream Details below.
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
