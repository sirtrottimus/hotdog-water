// socket.ts

import { Server as ServerIO } from 'socket.io';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(__dirname, '.env') });
// Destructure environment variables
const {
  NODE_ENV,

  DEV_DISCORD_SERVER_URL,
  PROD_DISCORD_SERVER_URL,
  DEV_DISCORD_CLIENT_URL,
  PROD_DISCORD_CLIENT_URL,
} = process.env;

let clientUrl: string;

// Set up server URL based on environment
if (NODE_ENV === 'production') {
  if (!PROD_DISCORD_SERVER_URL || !PROD_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for production');
  }

  clientUrl = PROD_DISCORD_CLIENT_URL;
} else {
  if (!DEV_DISCORD_SERVER_URL || !DEV_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for development');
  }
  clientUrl = DEV_DISCORD_CLIENT_URL;
}

let io: ServerIO;

export const initSocket = (httpServer: any) => {
  io = new ServerIO(httpServer, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
    },
  });
};

export { io };
