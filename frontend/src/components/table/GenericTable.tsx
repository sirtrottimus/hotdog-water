import {
  Tooltip,
  ActionIcon,
  useMantineColorScheme,
  Group,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons';

import { MantineReactTable } from 'mantine-react-table';

import React from 'react';

type GenericTableProps = {
  data: any;
  columns: any;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
  enableRowActions?: boolean;
  rowActions?: (row: any) => React.ReactNode;
  placeholder?: string;
  extraToolbarActions?: React.ReactNode;
  details?: (row: any) => React.ReactNode;
  initialState?: any;
  enablePagination?: boolean;
  enableRowDragging?: boolean;
  enableRowOrdering?: boolean;
  enableSorting?: boolean;
};

export default function GenericTable({
  data,
  columns,
  isLoading,
  isFetching,
  isError,
  refetch,
  enableRowActions,
  rowActions,
  placeholder,
  extraToolbarActions,
  details,
  initialState,
  enablePagination = true,
  enableRowDragging = false,
  enableRowOrdering = false,
  enableSorting = true,
}: GenericTableProps) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <MantineReactTable
      data={data ?? []}
      columns={columns}
      mantinePaperProps={{
        shadow: 'none',
        style: {
          borderRadius: '10px',
          border:
            colorScheme === 'dark' ? '3px solid #373A40' : '3px solid #ced4da',
          padding: '10px',
        },
      }}
      enablePagination={enablePagination}
      enableRowDragging={enableRowDragging}
      enableRowOrdering={enableRowOrdering}
      enableSorting={enableSorting}
      enableFullScreenToggle={false}
      mantineTopToolbarProps={{
        style: {
          backgroundColor: 'transparent',
        },
      }}
      mantineBottomToolbarProps={
        {
          style: {
            backgroundColor: 'transparent',
          },
        } as any
      }
      mantineFilterTextInputProps={
        {
          placeholder: 'Filter Roles...',
          sx: {
            '& input': {
              border: 'none',
              borderBottom:
                colorScheme === 'dark'
                  ? '3px solid #373A40'
                  : '3px solid #ced4da',
            },
            '& input:focus': {
              border: 'none',
              borderBottom:
                colorScheme === 'dark'
                  ? '3px solid #373A40'
                  : '3px solid #ced4da',
            },
          },
        } as any
      }
      mantineToolbarAlertBannerProps={
        isError
          ? {
              color: 'red',
              children: 'Error loading data',
            }
          : undefined
      }
      state={{
        isLoading,
        showAlertBanner: isError,
        showProgressBars: isFetching,
      }}
      initialState={initialState}
      renderTopToolbarCustomActions={() => (
        <Group>
          <Tooltip withArrow label="Refresh Data">
            <ActionIcon
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="refresh-wrapper"
            >
              <IconRefresh className="refresh" />
            </ActionIcon>
          </Tooltip>
          {extraToolbarActions}
        </Group>
      )}
      enableRowActions={enableRowActions}
      renderRowActions={rowActions}
      renderDetailPanel={details}
      positionActionsColumn="last"
      mantinePaginationProps={
        {
          style: {
            backgroundColor: 'transparent',
          },
        } as any
      }
      mantineSearchTextInputProps={
        {
          placeholder,
        } as any
      }
      mantineTableProps={
        {
          style: {
            border: 'none',
          },
        } as any
      }
    />
  );
}
