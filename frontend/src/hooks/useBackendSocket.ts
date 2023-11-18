import { useEffect, useState, useCallback, useMemo } from 'react';
import { socket } from '../utils/sockets/backendSocket';
import { getCookie } from 'cookies-next';

interface EventData<T = Data> {
  eventName: string;
  data: T;
  [key: string]: any;
}

interface Data {
  provider: string;
  type: string;
  [key: string]: any;
}

interface ActiveSocket {
  socketId: string;
  userId: string;
  username: string;
  iat: number;
}

const useBackendSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [activeSockets, setActiveSockets] = useState<ActiveSocket[]>([]);
  const jwtToken = getCookie('token');

  const onConnect = useCallback(() => {
    setIsConnected(true);
    socket.emit('authenticate', {
      method: 'jwt',
      token: jwtToken,
    });
  }, [jwtToken]);

  const onAuthenticated = useCallback(() => {
    console.log('Authenticated');
  }, []);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const customEvents = useMemo(() => {
    return [
      {
        name: 'event:test',
        callback: (data: any) => {
          setEventsData((prevData) => [
            ...prevData,
            { eventName: 'event:test', data },
          ]);
        },
      },
      {
        name: 'event:read',
        callback: (data: any) => {
          //Filter out the event that was read
          setEventsData((prevData) => [
            ...prevData.filter((event) => event._id !== data._id),
            { ...data, read: true },
          ]);
        },
      },
      {
        name: 'event:test_room',
        callback: (data: any) => {
          setEventsData((prevData) => [
            ...prevData,
            { eventName: 'event:test_room', data },
          ]);
        },
      },
      {
        name: 'event',
        callback: (data: any) => {
          setEventsData((prevData) => {
            const newArray = [...prevData, { eventName: 'event', ...data }];
            const sortedData = [...newArray].sort(
              (a, b) => b.createdAt - a.createdAt
            );
            const newData = sortedData.filter((event) => {
              const { message } = event.data;
              const { type, provider } = event;

              if (!provider || !type) {
                console.log('Removed event: ', event);
                return true; // Remove the event
              } // Remove the event

              if (
                (provider === 'youtube' && type !== 'subscriber') ||
                (provider === 'twitch' && type !== 'follow') ||
                (provider === 'twitch' &&
                  type === 'subscriber' &&
                  message.includes('gifted'))
              ) {
                console.log('Removed event: ', event);
                return true; // Remove the event
              }
              console.log('Kept event: ', event);
              return false; // Keep the event
            });
            return newData;
          });
        },
      },
      {
        name: 'active-sockets',
        callback: (data: any) => {
          setActiveSockets(data);
        },
      },
      {
        name: 'event:initial',
        callback: (data: any) => {
          setEventsData(
            data
              .filter((event: any) => {
                const { message } = event.data;
                const { type, provider } = event;

                if (!provider || !type) {
                  console.log('Removed event: ', event, 'because of no type');
                  return false; // Remove the event
                } // Remove the event

                if (
                  (provider === 'youtube' && type !== 'subscriber') ||
                  (provider === 'twitch' && type !== 'follow') ||
                  (provider === 'twitch' &&
                    type === 'subscriber' &&
                    message.includes('gifted'))
                ) {
                  console.log('Removed event: ', event, 'because of type');
                  return true; // Remove the event
                }

                return false; // Keep the event
              })
              .map((event: any) => ({
                eventName: 'event:initial',
                ...event,
                _id: event.SE_ID,
              }))
          );
        },
      },
      // Add other custom events here
    ];
  }, [
    setEventsData,
    setActiveSockets,
    // Add other dependencies here
  ]); // Empty dependency array, memoizes the customEvents array

  useEffect(() => {
    socket.connect();

    socket.on('connect', onConnect);
    socket.on('authenticated', onAuthenticated);
    socket.on('unauthorized', console.error);
    socket.on('disconnect', onDisconnect);

    customEvents.forEach((event) => {
      socket.on(event.name, event.callback);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('authenticated', onAuthenticated);
      socket.off('unauthorized', console.error);
      socket.off('disconnect', onDisconnect);

      customEvents.forEach((event) => {
        socket.off(event.name, event.callback);
      });

      socket.disconnect();
    };
  }, [jwtToken, onConnect, onAuthenticated, onDisconnect, customEvents]);

  function disconnect() {
    socket.disconnect();
    setIsConnected(false);
  }

  function connect() {
    socket.connect();
    setIsConnected(true);
  }

  return {
    socket,
    isConnected,
    eventsData,
    activeSockets,
    disconnect,
    connect,
  };
};

export default useBackendSocket;
