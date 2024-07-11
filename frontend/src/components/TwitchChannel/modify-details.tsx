//Modify Details of twitch channel.

import React, { forwardRef } from 'react';
import {
  Autocomplete,
  Avatar,
  Button,
  Group,
  MantineColor,
  Paper,
  SelectItemProps,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import TwitchService from '../../utils/api/TwitchService';
import { toast } from 'react-toastify';

interface ItemProps extends SelectItemProps {
  color: MantineColor;
  description: string;
  image: string;
}

const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ description, value, image, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />

        <div>
          <Text>{value}</Text>
          <Text size="xs" color="dimmed">
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);

export const ModifyDetails = () => {
  const [category, setCategory] = React.useState('');
  const [debounced] = useDebouncedValue(category, 1000);
  const [categories, setCategories] = React.useState([]) as any[];
  const [title, setTitle] = React.useState('');

  React.useEffect(() => {
    if (!debounced || debounced === '') return;
    async function fetchCategories() {
      const response = await TwitchService.searchCategories(debounced);
      console.log(response.data.data.data);
      if (response.success) {
        setCategories(response.data.data.data);
      }
    }

    fetchCategories();
  }, [debounced]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await TwitchService.modifyChannel({
      title: title,
      category: category,
    });

    if (response.success) {
      toast.success('Channel updated successfully');
    }

    if (!response.success) {
      toast.error('Failed to update channel');
    }
  };

  return (
    <Paper mt={30} w={'75%'} mx={'auto'} p={20}>
      <form onSubmit={handleSubmit}>
        {/* Change Stream Title */}
        <TextInput
          label="Change Stream Title"
          placeholder="Enter a new title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
        />

        {/* Change Stream Category */}
        <Autocomplete
          label="Change Stream Category"
          placeholder="Select a category"
          value={category}
          itemComponent={AutoCompleteItem}
          onChange={(event) => setCategory(event)}
          data={categories.map((category) => ({
            value: category.name,
            color: 'blue',
            description: category.id,
            image: category.box_art_url,
          }))}
          limit={50}
          dropdownPosition="bottom"
          styles={{
            dropdown: {
              maxHeight: 200,
              scrollbar: true,
              overflow: 'auto',
            },
          }}
        />

        <Button
          variant="gradient"
          gradient={{
            from: '#6838f1',
            to: '#dc51f2',
          }}
          size="md"
          radius="sm"
          my={10}
          styles={{
            root: {
              display: 'block',
            },
          }}
          type="submit"
        >
          Save Changes
        </Button>
      </form>
    </Paper>
  );
};
