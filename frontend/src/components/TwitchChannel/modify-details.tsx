//Modify Details of twitch channel.

import React from 'react';
import { Paper } from '@mantine/core';
import ModifyChannelDetails from '../forms/modifyChannelDetails';

export const ModifyDetails = () => {
  return (
    <Paper mt={30} w={'30%'} p={20}>
      <ModifyChannelDetails />
    </Paper>
  );
};
