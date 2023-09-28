/*
 * This file is the entry point for the server
 * It imports the createApp() function from utils/createApp.ts
 * It also imports the database connection from database/index.ts
 *
 * Author: DetectiveMichaelScarn
 * Date: 27/07/2023
 * Version: 1.0.0
 * License: Closed-Source
 */

import { createApp } from './utils/createApp';
import './database/index'; // Connect to MongoDB
import { createServer as createServerDev } from 'http'; // Import from https in production
import { join } from 'path';
import dotenv from 'dotenv';
import startFetchStreamActivity from './utils/tasks/fetchStreamActivity';
import { Server as ServerIO } from 'socket.io';
import handleClientConnections from './utils/sockets/clientSocketHandler';

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

    // Create HTTP server
    // const httpServer =
    //   NODE_ENV === 'production' ? createServerProd(app) : createServerDev(app);

    const httpServer = createServerDev(app);
    const io = new ServerIO(httpServer);

    //Handle Client Connections
    handleClientConnections(io);

    //Start any tasks that need to run in the background
    startFetchStreamActivity();

    // Start server
    httpServer.listen(PORT, () => {
      // TODO: Add logging library
      console.log(`[SERVER]: Server running at ${serverUrl}`);
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
