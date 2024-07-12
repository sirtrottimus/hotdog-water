import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Center,
  Chip,
  Group,
  Paper,
  SegmentedControl,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { APIResponse, UserInt } from '../../utils/types';
import useAuthorization from '../../hooks/useAuthorization';
import CenteredLoader from '../misc/CenteredLoader';
import { TextEditor } from '../misc/TextEditor';
import AnnouncementService, {
  AnnouncementFormInput,
} from '../../utils/api/AnnouncementService';

const schema = z.object({
  announcementType: z.enum(['public', 'membersOnly']),
  text: z.string().min(1, {
    message:
      'You must enter some text for your announcement. That is the point of an announcement, after all.',
  }),
  postTo: z.array(z.string()).min(1, {
    message:
      'You must select at least one platform to post to, otherwise, what is the point?',
  }),
});

export type FormAnnouncement = z.infer<typeof schema>;

function AnnouncementSelector({ user }: { user: UserInt }) {
  const forms = {
    public: {
      label: 'Public announcement',
      placeholder: 'Your witty announcement here...',
      chips: ['discord', 'twitter', 'Twitch (StreamElements)'],
      id: 'public',
    },
    membersOnly: {
      label: 'Members only announcement',
      placeholder: 'Your clever little announcement here...',
      chips: ['discord'],
      id: 'membersOnly',
    },
  };

  const { isAuthorized: canMakePublicAnnouncements, isLoading } =
    useAuthorization(
      user,
      ['SUPERADMIN', 'ADMIN', 'POST_PUBLIC_ANNOUNCEMENTS'],
      'canMakePublicAnnouncements'
    );

  const { isAuthorized: canMakeMembersOnlyAnnouncements } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'POST_MEMBERS_ONLY_ANNOUNCEMENTS'],
    'canMakeMembersOnlyAnnouncements'
  );

  const { isAuthorized: canPostToDiscord } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'POST_ANNOUNCEMENT_DISCORD'],
    'canPostToDiscord'
  );

  const { isAuthorized: canPostToTwitter } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'POST_ANNOUNCEMENT_TWITTER'],
    'canPostToTwitter'
  );

  const { isAuthorized: canPostToTwitch } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'POST_ANNOUNCEMENT_TWITCH'],
    'canPostToTwitch'
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AnnouncementFormInput>({
    defaultValues: {
      announcementType: canMakePublicAnnouncements
        ? 'public'
        : canMakeMembersOnlyAnnouncements
        ? 'membersOnly'
        : 'public',
      text: '',
      postTo: [],
    },
    resolver: zodResolver(schema),
  });

  //useWatch

  const announcementType = useWatch({
    control,
    name: 'announcementType',
  });

  const [submitting, setSubmitting] = useState(false); // This is used to disable the submit button while the mutation is running
  const queryClient = useQueryClient();
  const PostAnnouncementMutation = useMutation(
    (announcement: FormAnnouncement) =>
      AnnouncementService.create(announcement),
    {
      onSuccess: () => {
        setSubmitting(false);
        reset({
          announcementType: canMakePublicAnnouncements
            ? 'public'
            : canMakeMembersOnlyAnnouncements
            ? 'membersOnly'
            : 'public',
          text: '',
          postTo: [],
        });
        toast.success('Announcement posted!');

        queryClient.invalidateQueries(['announcements']);
      },
      onError: (response: APIResponse<FormAnnouncement>) => {
        setSubmitting(false);
        toast.error(`Error posting announcement. ${response.error}`);
      },
      onMutate: (d) => {
        setSubmitting(true);
      },
    }
  );

  const theme = useMantineTheme();

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (!canMakePublicAnnouncements && !canMakeMembersOnlyAnnouncements) {
    return (
      <Center>
        <Text color="red">
          You do not have permission to make announcements.
        </Text>
      </Center>
    );
  }

  return (
    <Paper
      p={'xl'}
      sx={{
        border: `3px solid ${
          theme.colorScheme === 'dark'
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }`,
        minHeight: '500px',
      }}
    >
      <form
        onSubmit={handleSubmit((data) => PostAnnouncementMutation.mutate(data))}
      >
        <Controller
          name="announcementType"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              fullWidth
              styles={{
                root: {
                  marginBottom: theme.spacing.xl,
                },
              }}
              defaultValue={
                canMakePublicAnnouncements ? 'public' : 'membersOnly'
              }
              data={[
                {
                  label: 'Public Announcement',
                  value: 'public',
                  disabled: !canMakePublicAnnouncements,
                },
                {
                  label: 'Members Only',
                  value: 'membersOnly',
                  disabled: !canMakeMembersOnlyAnnouncements,
                },
              ]}
              {...field}
            />
          )}
        />
        <Controller
          name="text"
          control={control}
          render={({ field }) => (
            <TextEditor content={field.value} handleChange={field.onChange} />
          )}
        />

        <Controller
          name="postTo"
          control={control}
          render={({ field }) => (
            <Chip.Group multiple value={field.value} onChange={field.onChange}>
              <Group position="center" mt={20}>
                {forms[announcementType].chips.map((chip) => {
                  if (
                    chip === 'twitter' &&
                    announcementType === 'membersOnly'
                  ) {
                    // Skip rendering the 'twitter' chip for 'membersOnly' announcement
                    return null;
                  }

                  return (
                    <Chip
                      radius={'sm'}
                      variant="filled"
                      value={chip}
                      color="violet"
                      disabled={
                        (chip === 'discord' && !canPostToDiscord) ||
                        (chip === 'twitter' && !canPostToTwitter) ||
                        (chip === 'Twitch (StreamElements)' && !canPostToTwitch)
                      }
                      key={forms[announcementType].id + chip}
                    >
                      Post to {chip}.
                    </Chip>
                  );
                })}
              </Group>
              {errors.postTo && (
                <Center>
                  <Text color="red">{errors.postTo.message}</Text>
                </Center>
              )}
            </Chip.Group>
          )}
        />
        <Button
          variant="gradient"
          mx={'auto'}
          gradient={{
            from: '#6838f1',
            to: '#dc51f2',
          }}
          size="lg"
          radius="sm"
          mt={20}
          styles={{
            root: {
              display: 'block',
            },
          }}
          type="submit"
          loading={submitting}
        >
          Post Announcement
        </Button>
      </form>
    </Paper>
  );
}

export default AnnouncementSelector;
