import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Group,
  Loader,
  LoadingOverlay,
  MantineColor,
  SelectItemProps,
  Text,
  TextInput,
} from '@mantine/core';
import React, { forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import TwitchService, { TwitchChannelInt } from '../../utils/api/TwitchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
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

AutoCompleteItem.displayName = '@mantine/core/AutocompleteItem';

const schema = z.object({
  title: z.string().min(3, 'Title is too short').max(50, 'Title is too long'),
  category: z.string(),
  isBrandedContent: z.boolean(),
}) satisfies z.ZodType<TwitchChannelInt, z.ZodTypeDef, unknown>;

export default function ModifyChannelDetails(
  {
    submitCallback,
    isBlurred,
  }: {
    submitCallback?: (any: any) => void;
    isBlurred?: boolean;
  } = { isBlurred: false }
) {
  const [submitting, setSubmitting] = React.useState(false);

  const { data: channelData, isLoading: channelLoading } = useQuery(
    ['twitchChannelData'],
    async () => {
      const response = await TwitchService.getChannelData();
      if (response.success) {
        return response.data.data;
      } else {
        return null;
      }
    }
  );
  const defaultValues = {
    title: '',
    category: '',
    isBrandedContent: false,
  };

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
    setValue,
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (channelData) {
      const {
        title,
        game_name: category,
        is_branded_content: isBrandedContent,
      } = channelData;
      const newValues = {
        title,
        category,
        isBrandedContent,
      };
      Object.keys(newValues).forEach((key) => {
        const field = key as keyof TwitchChannelInt;
        setValue(field, newValues[field]);
      });
    }
  }, [channelData, setValue]);

  const gameName = watch('category');

  const [debounced] = useDebouncedValue(gameName, 1000);
  const { data: categories, isFetching } = useQuery(
    ['twitchCategories', debounced],
    async () => {
      const response = await TwitchService.searchCategories(debounced);
      if (response.success) {
        return response.data.data;
      } else {
        return [];
      }
    },
    {
      initialData: [],
      enabled: !!debounced && debounced !== channelData?.game_name,
    }
  );

  const queryClient = useQueryClient();

  const modifyChannelMutation = useMutation(
    (data: TwitchChannelInt) => TwitchService.modifyChannel(data),
    {
      onSuccess: () => {
        toast.success('Channel updated successfully');
        queryClient.invalidateQueries(['twitchChannelData']).finally(() => {});
        if (submitCallback) submitCallback(true);
        setSubmitting(false);
      },
      onError: () => {
        toast.error(
          'Failed to update channel, Check Audit Logs for more information'
        );
        setSubmitting(false);
      },
      onMutate: () => {
        setSubmitting(true);
      },
    }
  );

  return (
    <Box pos={'relative'}>
      <LoadingOverlay visible={submitting} overlayBlur={2} />
      <form
        onSubmit={handleSubmit(async (data: TwitchChannelInt) => {
          modifyChannelMutation.mutate(data);
        })}
      >
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              label="Change Stream Title"
              placeholder="Enter a new stream title"
              withAsterisk
              mb={30}
              value={field.value}
              error={errors.title?.message?.toString()}
              description="Enter a new title for your stream. This will be displayed on the stream page and in the stream preview."
            />
          )}
        />

        {/* Change Stream Category */}
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              mt={10}
              label="Change Stream Category"
              description="Select a category/game for your stream"
              placeholder="Select a category"
              value={field.value}
              itemComponent={AutoCompleteItem}
              onChange={(event) => field.onChange(event)}
              data={
                categories.map(
                  (category: {
                    name: string;
                    id: string;
                    box_art_url: string;
                  }) => ({
                    value: category.name,
                    color: 'blue',
                    description: category.id,
                    image: category.box_art_url,
                  })
                ) ?? []
              }
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
          )}
        />

        <Controller
          name="isBrandedContent"
          control={control}
          render={({ field }) => (
            <Checkbox
              {...field}
              mt={10}
              label="Is Branded Content - Twitch Only"
              description="Check this if your stream has branded content (sponsored)"
              checked={field.value}
              value={field.value === true ? 0 : 1}
            />
          )}
        />

        <Button
          variant="gradient"
          gradient={{
            from: '#6838f1',
            to: '#dc51f2',
          }}
          size="md"
          radius="sm"
          mt={20}
          styles={{
            root: {
              display: 'block',
            },
          }}
          type="submit"
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </form>
    </Box>
  );
}
