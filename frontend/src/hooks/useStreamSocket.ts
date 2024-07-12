import { useEffect, useState } from 'react';
import { socket } from '../utils/sockets/StreamElementsSocket';

interface EventData {
  eventName: string;
}

const useSocket = (jwtToken: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [eventsData, setEventsData] = useState<EventData[]>([]);

  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('authenticate', {
        method: 'jwt',
        token: jwtToken,
      });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const customEvents = [
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
        name: 'event',
        callback: (data: any) => {
          setEventsData((prevData) => [
            ...prevData,
            { eventName: 'event', ...data },
          ]);
        },
      },
      // Add other events here with their respective callbacks
    ];

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
  }, [jwtToken]);

  return { socket, isConnected, eventsData };
};

export default useSocket;
