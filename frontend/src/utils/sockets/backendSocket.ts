//Socket connection to the backend

import { io } from 'socket.io-client';
import { getAPIUrl } from '../helpers';

const api = getAPIUrl();

export const socket = io('http://api.hatfilms.co.uk', {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
