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

type SocketConnection = {
  socketId: string;
  userId: string;
  username: string;
};

const useBackendSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSockets, setActiveSockets] = useState<
    Map<string, SocketConnection>
  >(new Map<string, SocketConnection>());
  const jwtToken = getCookie('token');

  const onConnect = useCallback(() => {
    setIsConnected(true);
    socket.emit('authenticate', {
      method: 'jwt',
      token: jwtToken,
    });
  }, [jwtToken]);

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
            //Filter for duplicate events
            const isDuplicate = prevData.some(
              (event) => event._id === data._id
            );
            if (isDuplicate) {
              return prevData;
            }
            const newArray = [...prevData, { eventName: 'event', ...data }];
            const sortedData = [...newArray].sort(
              (a, b) => b.createdAt - a.createdAt
            );
            const newData = sortedData.filter((event) => {
              const { type, provider } = event;

              if (!provider || !type) {
                return false;
              }

              if (event.data.gifted && event.data.amount > 1) {
                return false;
              }

              return true;
            });
            return newData;
          });
        },
      },

      {
        name: 'active-sockets',
        callback: (data: any) => {
          setActiveSockets(
            new Map<string, SocketConnection>(
              Array.from(data, ([socketId, socketData]) => [
                socketId,
                socketData,
              ])
            )
          );
        },
      },
      {
        name: 'event:initial',
        callback: (data: any) => {
          setIsLoading(true);
          //Filter for duplicate events
          const uniqueArray = data.filter(
            (obj: any, index: any, self: any) =>
              index === self.findIndex((o: any) => o.SE_ID === obj.SE_ID)
          );

          setEventsData(
            uniqueArray
              .filter((event: any) => {
                const { type, provider } = event;

                if (!provider || !type) {
                  return false;
                }

                if (event.data.gifted && event.data.amount > 1) {
                  return false;
                }
                return true;
              })
              .map((event: any) => ({
                eventName: 'event:initial',
                ...event,
                _id: event.SE_ID,
              }))
          );
          setIsLoading(false);
        },
      },
      // Add other custom events here
      {
        name: 'PONG',
        callback: () => {
          console.log('PONG');
        },
      },
      {
        name: 'refresh',
        callback: () => {
          socket.disconnect();
          socket.connect();
        },
      },
      {
        name: 'message',
        callback: (data: any) => {
          console.log(data);
          setEventsData((prevData) => {
            return [
              ...prevData,
              {
                eventName: 'message',
                data: data,
                read: false,
                _id: Math.random().toString(36).substring(7),
              },
            ];
          });
        },
      },
    ];
  }, [
    setEventsData,
    setActiveSockets,
    // Add other dependencies here
  ]); // Empty dependency array, memoizes the customEvents array

  useEffect(() => {
    socket.connect();

    socket.on('connect', onConnect);
    socket.on('unauthorized', console.error);
    socket.on('disconnect', onDisconnect);

    customEvents.forEach((event) => {
      socket.on(event.name, event.callback);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('unauthorized', console.error);
      socket.off('disconnect', onDisconnect);

      customEvents.forEach((event) => {
        socket.off(event.name, event.callback);
      });
      socket.disconnect();
    };
  }, [jwtToken, onConnect, onDisconnect, customEvents]);

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
    isLoading,
  };
};

export default useBackendSocket;
