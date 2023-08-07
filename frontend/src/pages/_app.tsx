import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
  MantineThemeOverride,
} from '@mantine/core';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppPropsWithLayout } from '../utils/types';
import { ToastContainer } from 'react-toastify';
import { getCookie, setCookie } from 'cookies-next';
import NextApp, { AppContext } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';
import '../globals.css';
// Create a client
const queryClient = new QueryClient();

function App(props: AppPropsWithLayout & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value ?? (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={
            {
              colorScheme,
              components: {
                Button: {
                  styles: {
                    root: {
                      borderWidth: 2,
                    },
                  },
                },
                Chip: {
                  styles: {
                    label: {
                      borderWidth: 2,
                    },
                  },
                },
                Input: {
                  styles: {
                    input: {
                      borderWidth: 2,
                    },
                  },
                },
                Pagination: {
                  styles: {
                    item: {
                      borderWidth: 2,
                    },
                  },
                },
                Switch: {
                  styles: {
                    track: {
                      borderWidth: 2,
                    },
                  },
                },
              },
              other: {
                defaultBorderWidth: 2,
              },
            } as MantineThemeOverride
          }
        >
          <ToastContainer
            toastStyle={{
              backgroundColor: colorScheme === 'dark' ? '#464c54' : '#fafafa',
            }}
            theme={colorScheme === 'dark' ? 'dark' : 'light'}
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {getLayout(<Component {...pageProps} />)}
        </MantineProvider>
      </ColorSchemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) ?? 'dark',
  };
};

export default App;
