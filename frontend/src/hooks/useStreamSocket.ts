import { useEffect, useState } from 'react';
import { socket } from '../utils/sockets/StreamElementsSocket';

const useSocket = (jwtToken: string) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('authenticate', {
        method: 'jwt',
        token: jwtToken,
      });
    };

    const onAuthenticated = () => {
      console.log('Authenticated');
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('authenticated', onAuthenticated);
    socket.on('unauthorized', console.error);
    socket.on('disconnect', onDisconnect);
    socket.on('event:test', (data: any) => {
      console.log(data);
    });
  }, [jwtToken]);

  return { socket, isConnected };
};

export default useSocket;
