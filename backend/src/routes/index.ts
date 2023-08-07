/*
 * This file is for managing the routes for the API
 * It imports the routes from the routes directory and registers them automatically.
 * Any route that is added to the routes directory will be automatically registered.
 * The route must be in a subdirectory and must have an index.js or index.ts file.
 * The index.js or index.ts file must export a default function that takes an Express Router as an argument.
 * The function must then register the route with the router.
 *
 * The route will be registered at the path /api/<subdirectory name> so if the route is in a subdirectory called auth, it will be registered at /api/auth
 *
 * Example:
 * // Path: backend\src\routes\auth\index.ts
 *  import { Router } from 'express';
 * const router = Router();
 *  router.get('/', (req, res) => {
 *  res.send('Hello World');
 * });
 *  export default router;
 *
 *
 * Author: Shagger
 * Date: 21/12/2022
 * Version: 1.0.0
 * License: MIT
 *
 */
import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs';

// Function for debugging
const logIfDebugging = (message: string) => {
  if (process.env.DEBUG === 'true') console.log(message);
};

//Function for importing routes
const importRoutes = (
  path: path.PlatformPath,
  filePath: string,
  file: string
) => {
  // Check if file exists
  if (
    !fs.existsSync(path.join(filePath, file, 'index.ts')) &&
    !fs.existsSync(path.join(filePath, file, 'index.js'))
  ) {
    // Debugging
    logIfDebugging('[SERVER/ROUTING]: index file does not exist');
    return;
  }

  // Import the route
  const route = require(path.join(filePath, file, 'index')).default;

  // check if the returned value is a function
  if (typeof route !== 'function') {
    // Debugging
    logIfDebugging('[SERVER/ROUTING]: index file does not export a function');
    return;
  }

  return route;
};

const router = Router();

/**
 * Register All Routes
 * @param dir The directory to search for routes
 * @returns A promise that resolves when all routes have been registered
 */
async function registerRoutes({
  dir = '',
}: { dir?: string } = {}): Promise<void> {
  const filePath = path.join(__dirname, dir);
  const files = await fs.promises.readdir(filePath);

  files.forEach(async (file) => {
    const stat = await fs.promises.stat(path.join(filePath, file));

    if (!stat.isDirectory()) {
      // Debugging
      logIfDebugging('[SERVER/ROUTING]: not a directory');
      return;
    }

    // Get files in subdirectory
    const subDirFiles = await fs.promises.readdir(path.join(filePath, file));

    if (subDirFiles.length === 0) {
      // Debugging
      logIfDebugging('[SERVER/ROUTING]: No routes found');
      return;
    }

    // If there are files in the subdirectory, register the route
    try {
      const route = importRoutes(path, filePath, file);

      // Register the route
      router.use(`/${file}`, route);

      // Debugging
      logIfDebugging(`[SERVER/ROUTING]: Registered route: /${file}`);
    } catch (error) {
      // Catch any errors and log them
      console.error(
        `[SERVER/ROUTING]: Failed to register route: /${file}\n`,
        error
      );
    }
  });
}

registerRoutes();

export default router;
