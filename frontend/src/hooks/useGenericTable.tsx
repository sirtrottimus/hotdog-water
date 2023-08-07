import {
  Tooltip,
  ActionIcon,
  useMantineColorScheme,
  Group,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useMantineReactTable } from 'mantine-react-table';
import React from 'react';

type GenericTableProps = {
  data: any;
  columns: any;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
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

// Define the hook function
export function useGenericTable({
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

  const table = useMantineReactTable({
    data: data ?? [],
    columns,
    initialState,
    mantinePaperProps: {
      shadow: 'none',
      style: {
        borderRadius: '10px',
        border:
          colorScheme === 'dark' ? '3px solid #373A40' : '3px solid #ced4da',
        padding: '10px',
      },
    },
    enablePagination,
    enableRowDragging,
    enableRowOrdering,
    enableSorting,
    positionActionsColumn: 'last',
    mantineTopToolbarProps: {
      style: {
        backgroundColor: 'transparent',
      },
    },
    mantineBottomToolbarProps: {
      style: {
        backgroundColor: 'transparent',
      },
    },
    mantineFilterTextInputProps: {
      placeholder: 'Filter Roles...',
      sx: {
        '& input': {
          border: 'none',
          borderBottom:
            colorScheme === 'dark' ? '3px solid #373A40' : '3px solid #ced4da',
        },
        '& input:focus': {
          border: 'none',
          borderBottom:
            colorScheme === 'dark' ? '3px solid #373A40' : '3px solid #ced4da',
        },
      },
    },
    mantineToolbarAlertBannerProps: {
      color: 'red',
      children: 'Error loading data',
    },
    mantineProgressProps(props) {
      return {
        ...props,
        color: 'violet',
      };
    },
    enableFullScreenToggle: false,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
    },
    renderTopToolbarCustomActions: () => (
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
    ),
    enableRowActions,
    renderRowActions: rowActions,
    renderDetailPanel: details,
    mantinePaginationProps: {
      style: {
        backgroundColor: 'transparent',
      },
    },
    mantineSearchTextInputProps: {
      placeholder,
    },
    mantineTableProps: {
      style: {
        border: 'none',
      },
    },
  });

  // Return any additional state or values needed
  return { table };
}
