import { Alert, Center, SimpleGrid, Title } from '@mantine/core';
import { ReactElement } from 'react';
import { MainLayout } from '../../components/Layout/mainLayout';
import AnnouncementSelector from '../../components/announcements/announcementSelector';
import AnnouncementsViewer from '../../components/announcements/announcementsViewer';
import { UserInt as User } from '../../utils/types';
import ActivityViewer from '../../components/activity/ActivityViewer';
import { useQuery } from '@tanstack/react-query';
import StreamElementsService from '../../utils/api/StreamElementsService';

export default function Home({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
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

  console.log(JWT?.streamElementsToken);

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
        <div />
        <ActivityViewer JWT={JWT?.streamElementsToken} />
      </SimpleGrid>
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
