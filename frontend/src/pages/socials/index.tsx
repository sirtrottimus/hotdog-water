import React, { ReactElement } from 'react';
import { MainLayout } from '../../components/Layout/mainLayout';
import { ActionsGrid } from '../../components/misc/ActionsGrid';
import {
  IconBrandTwitch,
  IconBrandTwitter,
  IconBrandDiscord,
} from '@tabler/icons-react';
import { Alert, Center } from '@mantine/core';

export default function SocialIndex() {
  const actions = [
    {
      title: 'Discord',
      icon: IconBrandDiscord,
      color: 'blue',
      href: '/socials/discord',
    },
    {
      title: 'Twitter',
      icon: IconBrandTwitter,
      color: 'blue',
      href: '/socials/twitter',
    },
    {
      title: 'Twitch',
      icon: IconBrandTwitch,
      color: 'violet',
      href: '/socials/twitch',
    },
    {
      title: 'YouTube',
      icon: IconBrandTwitch,
      color: 'red',
      href: '/socials/youtube',
    },
    {
      title: 'StreamElements',
      icon: IconBrandTwitch,
      color: '',
      href: '/socials/streamElements',
    },
  ];

  return (
    <>
      <ActionsGrid actions={actions} title="Social Settings" />
      <Center>
        <Alert title="Something Missing?" w={'33%'} mt={150}>
          If you want to add more socials, please contact the developer.
        </Alert>
      </Center>
    </>
  );
}

SocialIndex.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
