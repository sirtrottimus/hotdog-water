import { io } from 'socket.io-client';

export const socket = io('https://realtime.streamelements.com', {
  transports: ['websocket'],
  autoConnect: false,
});
