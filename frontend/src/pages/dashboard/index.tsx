import {
  Alert,
  Center,
  Flex,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core';
import React, { ReactElement, use, useEffect } from 'react';
import { MainLayout } from '../../components/Layout/mainLayout';
import AnnouncementSelector from '../../components/announcements/announcementSelector';
import AnnouncementsViewer from '../../components/announcements/announcementsViewer';
import { UserInt as User } from '../../utils/types';
import ActivityViewer from '../../components/activity/ActivityViewer';
import { useQuery } from '@tanstack/react-query';
import StreamElementsService from '../../utils/api/StreamElementsService';
import NewWindow from 'react-new-window';
import useAuthorization from '../../hooks/useAuthorization';
import { ModifyDetails } from '../../components/LiveStreams/modify-details';
import YoutubeService from '../../utils/api/YoutubeService';

export default function Home({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
  const [activityWindowed, setActivityWindowed] = React.useState(false);

  const { isAuthorized: canSeeJWT } = useAuthorization(
    user,
    ['SUPERADMIN', 'ADMIN', 'CAN_SEE_JWT'],
    'canSeeJWT'
  );

  const { data: JWT, isLoading } = useQuery(
    ['Stream_elem_JWT'],
    async () => {
      const response = await StreamElementsService.getOne();
      if (response.success) {
        return response.data;
      }
    },
    {
      enabled: canSeeJWT,
    }
  );

  //Call the youtube service to get the youtubechannelDetails then console log the response

  const { data: youtubeChannelDetails, isLoading: youtubeLoading } = useQuery(
    ['youtubeChannelDetails'],
    async () => {
      const response = await YoutubeService.getChannelDetails();
      if (response.success) {
        return response.data;
      } else {
        console.log(response.error);
      }
    },
    {
      enabled: canSeeJWT,
    }
  );

  useEffect(() => {
    console.log(youtubeChannelDetails);
  }, [youtubeChannelDetails]);

  if (canSeeJWT && isLoading) {
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

  if (canSeeJWT && JWT === undefined && !isLoading) {
    return (
      <>
        <Alert>
          Please set up your StreamElements JWT in the settings page to use the
          activity viewer.
        </Alert>
      </>
    );
  }
  if (canSeeJWT && !JWT) {
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

      <Flex justify={'space-around'}>
        <ModifyDetails />
        <Paper mt={30} w={'30%'}>
          <Text
            //Center text in the paper both vertically and horizontally
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
            //Set the font size to 1.5rem
            size={'xl'}
            weight={700}
          >
            Coming Soon
          </Text>
        </Paper>
        <Paper mt={30} w={'30%'}>
          <Text
            //Center text in the paper both vertically and horizontally
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
            //Set the font size to 1.5rem
            size={'xl'}
            weight={700}
          >
            Coming Soon
          </Text>
        </Paper>
      </Flex>

      {activityWindowed ? (
        <NewWindow
          title="Activity Viewer"
          onUnload={() => setActivityWindowed(false)}
        >
          <ActivityViewer
            activityWindowed={activityWindowed}
            setActivityWindowed={setActivityWindowed}
            user={user}
          />
        </NewWindow>
      ) : (
        <ActivityViewer
          activityWindowed={activityWindowed}
          setActivityWindowed={setActivityWindowed}
          user={user}
        />
      )}
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
