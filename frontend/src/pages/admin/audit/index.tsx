import { useQuery } from '@tanstack/react-query';
import React, { ReactElement } from 'react';
import { MainLayout } from '../../../components/Layout/mainLayout';
import GenericTable from '../../../components/table/GenericTable';
import UserCell from '../../../components/table/AuditUserCell';
import { Badge, Box, Center, SimpleGrid, Text, Title } from '@mantine/core';
import { Prism } from '@mantine/prism';
import AuditService, { IFunctionLog } from '../../../utils/api/AuditService';

export default function Index() {
  const { data, isLoading, isFetching, isError, refetch } = useQuery(
    ['audit'],
    async () => {
      const res = await AuditService.getAll();
      if (res.success) {
        return res.data;
      } else {
        return [];
      }
    }
  );

  return (
    <div>
      <GenericTable
        data={data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        initialState={{
          sorting: [{ id: 'Date', desc: true }],
        }}
        refetch={refetch}
        columns={[
          {
            header: 'User',
            Cell: UserCell,
          },
          {
            header: 'Date',
            accessorFn: (row: IFunctionLog) => {
              return new Date(row.createdAt).toLocaleString();
            },
            sortingFn: (a: any, b: any) =>
              new Date(a.original.createdAt) > new Date(b.original.createdAt)
                ? 1
                : -1,

            id: 'Date',
          },
          {
            header: 'Location',
            accessorFn: (row: IFunctionLog) => {
              return `${row.controller} - ${row.functionName}`;
            },
          },
          {
            header: 'Status',
            accessorFn: (row: IFunctionLog) => (
              <Badge radius={'xs'} color={row.success ? 'green' : 'red'}>
                {row.success ? 'Success' : 'Failed'}
              </Badge>
            ),
            sortingFn: (a: any, b: any) =>
              a.original.success > b.original.success ? 1 : -1,
          },
        ]}
        details={({ row }) => (
          <>
            <Text>
              <b>Error:</b>{' '}
              {`${row.original.errorMessage || 'No error was logged'}.`}
            </Text>
            <SimpleGrid cols={2}>
              <Box>
                <Center>
                  <Title order={4}>Request</Title>
                </Center>
                {row.original.params ? (
                  <Prism language={'json'}>
                    {JSON.stringify(row.original.params, null, 2)}
                  </Prism>
                ) : (
                  <Center>No response</Center>
                )}
              </Box>
              <Box>
                <Center>
                  <Title order={4}>Response</Title>
                </Center>
                {row.original.data ? (
                  <Prism language={'json'}>
                    {JSON.stringify(row.original.data, null, 2)}
                  </Prism>
                ) : (
                  <Center>No response</Center>
                )}
              </Box>
            </SimpleGrid>
          </>
        )}
      />
    </div>
  );
}

Index.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
