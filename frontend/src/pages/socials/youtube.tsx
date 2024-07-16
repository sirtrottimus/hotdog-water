import { ReactElement, useState, useEffect } from 'react';

import {
  Affix,
  Alert,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Text,
  Title,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { MainLayout } from '../../components/Layout/mainLayout';
import { APIResponse, UserInt as User } from '../../utils/types';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Prism } from '@mantine/prism';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';
import YoutubeService, {
  FormYoutubeSettingsInput,
  YoutubeSettingsInt,
} from '../../utils/api/YoutubeService';
import useAuthorization from '../../hooks/useAuthorization';

const schema = z.object({
  youtubeClientID: z.string().min(1, {
    message: 'Youtube Client ID is required',
  }),
  youtubeClientSecret: z.string().min(1, {
    message: 'Youtube Client Secret is required',
  }),
});

type Test = {
  ran: boolean;
  result: APIResponse<any> | null;
  running: boolean;
  success: boolean;
};

export default function Home({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
  const theme = useMantineTheme();
  const [submitting, setSubmitting] = useState(false);
  const [update, setUpdate] = useState(false);
  const [getTest, setGetTest] = useState<Test>({
    ran: false,
    result: null,
    running: false,
    success: false,
  });
  const [postTest, setPostTest] = useState<Test>({
    ran: false,
    result: null,
    running: false,
    success: false,
  });
  const [scroll, scrollTo] = useWindowScroll();

  const { isAuthorized: canView, isLoading: isAuthLoading } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'VIEW_TWITCH_SETTINGS'],
    'canView'
  );

  const { isAuthorized: canEdit } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'EDIT_TWITCH_SETTINGS'],
    'canEdit'
  );

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery(
    ['youtubeSettings'],
    async () => {
      const response = await YoutubeService.getOne();
      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    },
    {
      enabled: canView && !isAuthLoading,
    }
  );

  const defaultValues = {
    youtubeClientID: settings?.youtubeClientID ?? '',
    youtubeClientSecret: settings?.youtubeClientSecret ?? '',
  };

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<FormYoutubeSettingsInput>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const queryClient = useQueryClient();
  const createYoutubeSettingsMutation = useMutation(
    async (data: FormYoutubeSettingsInput) => YoutubeService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['youtubeSettings']).finally(() => {});
        setSubmitting(false);
        toast.success('Youtube settings updated successfully!');
      },
      onError: (response: APIResponse<YoutubeSettingsInt>) => {
        if (response.error)
          toast.error(
            `Error creating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
        setGetTest({
          ran: false,
          result: null,
          running: false,
          success: false,
        });
      },
    }
  );

  const updateYoutubeSettingsMutation = useMutation(
    async (data: FormYoutubeSettingsInput) => YoutubeService.update(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['youtubeSettings']).finally(() => {});
        setSubmitting(false);
        toast.success('Youtube settings updated successfully!');
      },
      onError: (response: APIResponse<YoutubeSettingsInt>) => {
        if (response.error)
          toast.error(
            `Error creating class: ${response.error.response?.data?.msg ?? ''}`
          );
        setSubmitting(false);
        // Display an error message to the user or redirect to an error page
      },
      onMutate: () => {
        setSubmitting(true);
        setGetTest({
          ran: false,
          result: null,
          running: false,
          success: false,
        });
      },
    }
  );

  const handleGetTest = async () => {
    if (settings) {
      setGetTest({
        ran: false,
        result: null,
        running: true,
        success: false,
      });
      const response = await YoutubeService.testGet();
      if (response.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed!');
      }
      setGetTest({
        ran: true,
        result: response,
        running: false,
        success: response.success,
      });
    }
  };

  const handlePostTest = async () => {
    if (settings) {
      setPostTest({
        ran: false,
        result: null,
        running: true,
        success: false,
      });
      const response = await YoutubeService.testPost();
      if (response.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed!');
      }
      setPostTest({
        ran: true,
        result: response,
        running: false,
        success: response.success,
      });
    }
  };

  useEffect(() => {
    if (settings) {
      setUpdate(true);
      reset(settings);
    }
  }, [settings, reset]);

  const handleLogin = () => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = `${process.env.NEXT_PUBLIC_DEV_API_URL}api/auth/youtube`;
      return;
    }
    window.location.href = `${process.env.NEXT_PUBLIC_PROD_API_URL}api/auth/youtube`;
  };

  return (
    <>
      <Center>
        <Title>Youtube Settings</Title>
      </Center>
      <Container size={'md'}>
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
                <b>Warning:</b> You have not set up your Youtube settings yet.
                You will not be able to use Youtube features until you do so.
              </Alert>
            )}
            {!isLoading && isError && (
              <Alert mb={20} color="red">
                <b>Error:</b> Could not load Youtube settings. Please try again,
                or contact the developer.
              </Alert>
            )}
            <form
              onSubmit={handleSubmit((data) =>
                update
                  ? updateYoutubeSettingsMutation.mutate(data)
                  : createYoutubeSettingsMutation.mutate(data)
              )}
            >
              <Text mb={20}>
                Fill in your Youtube details below. You can get these from the
                Youtube Developer Console, under the OAuth credentials tab.
              </Text>
              <Controller
                name="youtubeClientID"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Youtube Client ID"
                    placeholder="Youtube Client ID"
                    withAsterisk
                    error={errors.youtubeClientID?.message}
                    disabled={isBlurred}
                    mb={30}
                    {...field}
                    description="This is your Youtube App's Client ID. You can get this from the Youtube Developer Console, under the OAuth credentials tab. Keep this secret!"
                  />
                )}
              />
              <Controller
                name="youtubeClientSecret"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Youtube Client Secret"
                    placeholder="Youtube Client Secret"
                    withAsterisk
                    error={errors.youtubeClientSecret?.message}
                    disabled={isBlurred}
                    mb={30}
                    {...field}
                    description="This is your Youtube App's Client Secret. You can get this from the Youtube Developer Console, under the OAuth credentials tab. Keep this secret!"
                  />
                )}
              />
              <Flex justify={'space-between'}>
                <Group position="center">
                  <Button
                    variant="gradient"
                    gradient={{
                      from: '#6838f1',
                      to: '#dc51f2',
                    }}
                    size="md"
                    radius="sm"
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
                <Button
                  size="md"
                  style={{
                    background: 'red',
                    color: 'white',
                  }}
                  onClick={handleLogin}
                  disabled={!settings}
                >
                  Login with Youtube
                </Button>
              </Flex>
            </form>
          </Paper>
          <Divider my={80} size={'md'} />
          <Paper
            mt={80}
            p={'xl'}
            sx={{
              border: `3px solid ${
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[4]
                  : theme.colors.gray[2]
              }`,
            }}
          >
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
                onClick={handleGetTest}
                loading={getTest.running}
              >
                Test Connection With Get Request
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
              {getTest.ran ? (
                <>
                  {getTest.success ? (
                    <Alert
                      color="green"
                      title="Success!"
                      withCloseButton={false}
                      mb={10}
                    >
                      Connection successful! You should see your Youtube
                      details.
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
                    {JSON.stringify(getTest.result, null, 2)}
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
          <Paper
            mt={30}
            p={'xl'}
            sx={{
              border: `3px solid ${
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[4]
                  : theme.colors.gray[2]
              }`,
            }}
          >
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
                onClick={handlePostTest}
                loading={postTest.running}
              >
                Test Connection With Post Request
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
              {postTest.ran ? (
                <>
                  {postTest.success ? (
                    <Alert
                      color="green"
                      title="Success!"
                      withCloseButton={false}
                      mb={10}
                    >
                      Connection successful! a tweet should have been posted to
                      your account.
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
                    {JSON.stringify(postTest.result, null, 2)}
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
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button
              leftIcon={<IconArrowUp size="1rem" />}
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
              color="violet"
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
