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
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.disconnect();
      socket.off('connect', onConnect);
      socket.off('authenticated', onAuthenticated);
      socket.off('disconnect', onDisconnect);
    };
  }, [jwtToken]);

  return { socket, isConnected };
};

export default useSocket;
