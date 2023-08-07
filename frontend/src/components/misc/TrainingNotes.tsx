import {
  Box,
  Button,
  Flex,
  Group,
  SegmentedControl,
  Text,
  Title,
} from '@mantine/core';
import React from 'react';

export default function TrainingNotes({
  trainingRequest,
  onCancel,
  submitCallback,
}: {
  trainingRequest: any;
  onCancel?: (view: 'view') => void;
  submitCallback?: (any: any) => void;
}) {
  const [category, setCategory] = React.useState('trainee');

  return (
    <>
      <Flex justify={'center'}>
        <SegmentedControl
          value={category}
          onChange={(value) => setCategory(value)}
          data={[
            { value: 'trainee', label: 'Trainee' },
            { value: 'trainer', label: 'Trainer' },
          ]}
        />
      </Flex>
      <Box mt={20}>
        {category === 'trainee' ? (
          <Box>
            <Flex justify={'center'}>
              <Title order={3}>Trainee Notes</Title>
            </Flex>
            {trainingRequest.traineeNotes ? (
              <Text>{trainingRequest.traineeNotes}</Text>
            ) : (
              <Flex justify={'center'}>
                <Text italic>No notes...</Text>
              </Flex>
            )}
          </Box>
        ) : (
          <Box>
            <Flex justify={'center'}>
              <Title order={3}>Trainer Notes</Title>
            </Flex>
            {trainingRequest.notes ? (
              <Text>{trainingRequest.notes}</Text>
            ) : (
              <Flex justify={'center'}>
                <Text italic>No notes...</Text>
              </Flex>
            )}
          </Box>
        )}
      </Box>
      <Group position="right">
        <Button
          variant="outline"
          color="teal"
          onClick={() => {
            if (onCancel) onCancel('view');
            if (submitCallback) submitCallback(true);
          }}
        >
          Close
        </Button>
      </Group>
    </>
  );
}
