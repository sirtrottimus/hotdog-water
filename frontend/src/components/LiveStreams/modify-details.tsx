//Modify Details of twitch channel.

import React from 'react';
import { Paper } from '@mantine/core';
import ModifyStreamDetails from '../forms/modifyStreamDetails';

export const ModifyDetails = () => {
  return (
    <Paper mt={30} w={'30%'} p={20}>
      <ModifyStreamDetails />
    </Paper>
  );
};
