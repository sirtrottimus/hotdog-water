import { Center, SimpleGrid, Title } from '@mantine/core';
import { ReactElement } from 'react';
import { MainLayout } from '../../components/Layout/mainLayout';
import AnnouncementSelector from '../../components/announcements/announcementSelector';
import AnnouncementsViewer from '../../components/announcements/announcementsViewer';
import { UserInt as User } from '../../utils/types';
import ActivityViewer from '../../components/activity/ActivityViewer';

export default function Home({
  user,
  isBlurred,
}: {
  user: User;
  isBlurred: boolean;
}) {
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
        <ActivityViewer />
      </SimpleGrid>
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
