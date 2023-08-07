import React, { ReactElement } from 'react';
import { MainLayout } from '../../components/Layout/mainLayout';
import { ActionsGrid } from '../../components/misc/ActionsGrid';
import {
  IconList,
  IconShieldBolt,
  IconUserCode,
  IconUsers,
} from '@tabler/icons-react';

export default function SocialIndex() {
  const actions = [
    {
      title: 'Audit Logs',
      icon: IconList,
      color: 'violet',
      href: '/admin/audit',
    },
    {
      title: 'Roles',
      icon: IconUserCode,
      color: 'violet',
      href: '/admin/roles',
    },
    {
      title: 'Users',
      icon: IconUsers,
      color: 'violet',
      href: '/admin/users',
    },
    {
      title: 'Permissions',
      icon: IconShieldBolt,
      color: 'violet',
      href: '/admin/permissions',
    },
  ];

  return (
    <>
      <ActionsGrid actions={actions} title="Admin" />
    </>
  );
}

SocialIndex.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
