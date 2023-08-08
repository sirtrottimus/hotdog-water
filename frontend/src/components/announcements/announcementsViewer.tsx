// A Component for viewing all announcements. All announcements are displayed in a list, with the most recent announcement at the top. The user can click on an announcement to view it in full.
import {
  Alert,
  Box,
  Button,
  Center,
  Paper,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import AnnouncementService, {
  AnnouncementInt,
} from '../../utils/api/AnnouncementService';
import { APIPaginationResponse } from '../../utils/types';
import CenteredLoader from '../misc/CenteredLoader';
import AnnouncementDisplay from './announcementDisplay';

function AnnouncementsViewer({ isBlurred }: { isBlurred?: boolean }) {
  const theme = useMantineTheme();
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);

  const { data, isLoading, error } = useQuery(['announcements'], async () => {
    const res = await AnnouncementService.getPaginated(offset, 100);
    if (res.success) {
      if (res.hasMore === false) setHasMore(false);
      return res.data;
    } else {
      return [];
    }
  });

  const queryClient = useQueryClient();
  const fetchNextPageMutation = useMutation(
    (offset: number) => AnnouncementService.getPaginated(offset, 100),
    {
      onSuccess: (response: APIPaginationResponse<AnnouncementInt[]>) => {
        const data = response.data;
        if (!data || data.length === 0) {
          return;
        }

        if (!response.hasMore) {
          setHasMore(false);
        }
        queryClient.setQueryData(['announcements'], (oldData: any) => [
          ...oldData,
          ...data,
        ]);
      },
    }
  );

  const handleLoadMore = () => {
    setOffset(offset + 5);
    fetchNextPageMutation.mutate(offset + 5);
  };

  return (
    <Paper
      p={'xl'}
      sx={{
        border: `3px solid ${
          theme.colorScheme === 'dark'
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }`,
      }}
    >
      <Title order={3} mb={20}>
        Previous Announcements
      </Title>

      {isLoading && <CenteredLoader height={400} />}

      {(error as Error) && (
        <Alert color="red" title="Error" mt={30}>
          There was an error loading announcements. Please try again later. If
          the problem persists, please contact an administrator.
        </Alert>
      )}

      {!isLoading && data && data.length > 0 && (
        <>
          <Box
            mah={isBlurred ? 400 : 600}
            sx={{
              overflowY: 'scroll',
              '&::-webkit-scrollbar': {
                width: '0.4em',
                marginLeft: 10,
                borderRadius: 10,
                backgroundColor: 'rgba(0,0,0,.1)',
              },
              '&::-webkit-scrollbar-track': {
                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                borderRadius: 10,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,.3)',
                borderRadius: 10,
                marginLeft: 10,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'rgba(0,0,0,.5)',
              },
            }}
          >
            {data.map((announcement) => (
              <AnnouncementDisplay
                announcement={announcement}
                key={announcement._id}
              />
            ))}
          </Box>
          {hasMore ? (
            <Button
              onClick={handleLoadMore}
              loading={fetchNextPageMutation.isLoading}
              disabled={fetchNextPageMutation.isLoading}
              variant="subtle"
              color="violet"
              fullWidth
              mt={30}
            >
              Load More
            </Button>
          ) : (
            <Center c="dimmed" mt={10}>
              <Text>No more announcements to load.</Text>
            </Center>
          )}
        </>
      )}
      {!isLoading && !data && !error && (
        <Text>No announcements could be found.</Text>
      )}
    </Paper>
  );
}

export default AnnouncementsViewer;
