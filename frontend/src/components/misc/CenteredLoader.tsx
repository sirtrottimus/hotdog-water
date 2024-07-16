import {
  ColorScheme,
  Flex,
  Loader,
  MantineNumberSize,
  MantineStyleSystemProps,
  Title,
  createStyles,
} from '@mantine/core';
import React from 'react';
import { ServerError } from './ServerError';

interface CenteredLoaderProps {
  size?: MantineNumberSize;
  colorScheme?: ColorScheme;
  redirecting?: boolean;
  redirectText?: string;
  loadingText?: string;
  errored?: boolean;
  align?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline';
  justify?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  height?: MantineStyleSystemProps['h'];
  error?: string;
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[8]
        : theme.colors.gray[1],
  },
}));

const CenteredLoader = ({
  size,
  redirecting,
  redirectText,
  loadingText,
  errored,
  error,
  align,
  justify,
  height,
}: CenteredLoaderProps) => {
  const { classes } = useStyles();
  return (
    <Flex
      justify={justify ?? 'center'}
      align={align ?? 'center'}
      direction={'column'}
      h={height ?? '100vh'}
      className={classes.wrapper}
    >
      {errored ? (
        <ServerError error={error} />
      ) : (
        <>
          <Loader size={size} color="violet" />
          {redirecting && <Title>{redirectText ?? 'Redirecting...'}</Title>}
          {!redirecting && loadingText && <Title>{loadingText}</Title>}
        </>
      )}
    </Flex>
  );
};

export default CenteredLoader;
