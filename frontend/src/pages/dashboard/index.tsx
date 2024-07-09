import { Alert, Center, SimpleGrid, Title } from '@mantine/core';
import React, { ReactElement, useEffect } from 'react';
import { MainLayout } from '../../components/Layout/mainLayout';
import AnnouncementSelector from '../../components/announcements/announcementSelector';
import AnnouncementsViewer from '../../components/announcements/announcementsViewer';
import { UserInt as User } from '../../utils/types';
import ActivityViewer from '../../components/activity/ActivityViewer';
import { useQuery } from '@tanstack/react-query';
import StreamElementsService from '../../utils/api/StreamElementsService';
import NewWindow from 'react-new-window';

export default function Home({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
  const [activityWindowed, setActivityWindowed] = React.useState(false);
  const { data: JWT, isLoading } = useQuery(['Stream_elem_JWT'], async () => {
    const response = await StreamElementsService.getOne();
    if (response.success) {
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <>
        <Center>
          <Title>Loading...</Title>
        </Center>
      </>
    );
  }

  // TODO: Rewrite this to be more robust.
  // Issues:
  // 1. JWT is not defined when the user is not logged in.
  // 2. JWT is undefined when the user is logged in but has not set up their JWT.
  // 3. JWT is null when the user is logged in and has set up their JWT.
  // 4. JWT is null when the user is not logged in and has not set up their JWT.
  // 5. JWT is null when the user is not logged in and has set up their JWT.

  if (JWT === undefined && !isLoading) {
    return (
      <>
        <Alert>
          Please set up your StreamElements JWT in the settings page to use the
          activity viewer.
        </Alert>
      </>
    );
  }
  if (!JWT) {
    return (
      <>
        <Alert>
          Please set up your StreamElements JWT in the settings page to use the
          activity viewer.
        </Alert>
      </>
    );
  }

  return (
    <>
      <Center>
        <Title>
          Welcome {isBlurred ? 'totally anonymous user ;)' : user.username}
        </Title>
      </Center>

      <SimpleGrid mt={30} cols={2}>
        <AnnouncementSelector user={user} />
        <AnnouncementsViewer isBlurred={isBlurred} />
      </SimpleGrid>

      {activityWindowed ? (
        <NewWindow
          title="Activity Viewer"
          onUnload={() => setActivityWindowed(false)}
        >
          <ActivityViewer
            activityWindowed={activityWindowed}
            setActivityWindowed={setActivityWindowed}
          />
        </NewWindow>
      ) : (
        <ActivityViewer
          activityWindowed={activityWindowed}
          setActivityWindowed={setActivityWindowed}
        />
      )}
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
