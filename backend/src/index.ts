/*
 * This file is the entry point for the server
 * It imports the createApp() function from utils/createApp.ts
 * It also imports the database connection from database/index.ts
 *
 * Author: DMS
 * Date: 27/07/2023
 * Version: 1.0.0
 * License: Closed-Source
 */

import { createApp } from './utils/createApp';
import './database/index';
import { createServer as createServerDev } from 'http';

import { join } from 'path';
import dotenv from 'dotenv';
import startFetchStreamActivity from './utils/tasks/fetchStreamActivity';
import handleClientConnections from './utils/sockets/clientSocketHandler';
import { initSocket, io } from './utils/sockets/socket';
import startAnnouncement from './utils/tasks/SEAnnouncement';

dotenv.config({ path: join(__dirname, '.env') });
// Destructure environment variables
const {
  PORT,
  NODE_ENV,
  DEBUG,
  DEV_DISCORD_SERVER_URL,
  PROD_DISCORD_SERVER_URL,
  DEV_DISCORD_CLIENT_URL,
  PROD_DISCORD_CLIENT_URL,
} = process.env;

let serverUrl: string;
let clientUrl: string;

// Set up server URL based on environment
if (NODE_ENV === 'production') {
  if (!PROD_DISCORD_SERVER_URL || !PROD_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for production');
  }

  serverUrl = PROD_DISCORD_SERVER_URL;
  clientUrl = PROD_DISCORD_CLIENT_URL;
} else {
  if (!DEV_DISCORD_SERVER_URL || !DEV_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for development');
  }

  serverUrl = DEV_DISCORD_SERVER_URL;
  clientUrl = DEV_DISCORD_CLIENT_URL;
}

// Set up server and socket.io events
const main = async () => {
  try {
    // Create Express app by calling createApp()
    const app = createApp();

    const httpServer = createServerDev(app);
    initSocket(httpServer);

    //Handle Client Connections
    handleClientConnections(io);

    //Start any tasks that need to run in the background
    startFetchStreamActivity(io);
    startAnnouncement();

    // Start server
    httpServer.listen(app.get('port'), () => {
      // TODO: Add logging library
      console.log(`[SERVER]: Server running at ${serverUrl}`);
      console.log(`[SERVER]: Client running at ${clientUrl}`);
      console.log(`[SERVER]: Port: ${PORT}`);
      console.log(`[SERVER]: Environment: ${NODE_ENV}`);
      console.log(
        `[SERVER]: ${DEBUG ? 'Debugging enabled' : 'Debugging disabled'}`
      );
      console.log('[SERVER]: Press CTRL-C to stop server');
    });
  } catch (error) {
    console.log(error);
  }
};

// Start server
main();

export default main;
