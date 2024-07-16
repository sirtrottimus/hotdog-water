/*
 * This file contains helper functions that are used throughout the application.
 * Any helper functions that are used in multiple places should be added here.
 * If a helper function is only used in one place, it should be added to the file where it is used.
 *
 * Author: DMS
 * Date: 21/12/2022
 * Version: 1.0.0
 *
 */
import mongoose from 'mongoose';
import { Permission, Role, User } from '../database/schema';
import fs from 'fs/promises';

/**
 * Helper function for logging messages if debugging is enabled.
 * @param message The message to log
 * @returns void
 * @example logIfDebugging('Hello World!');
 * // Logs 'Hello World!' to console if debugging is enabled (DEBUG=true)
 */
export function logIfDebugging(message: string): void {
  if (process.env.DEBUG === 'true') console.log(message);
}

// Interface for the validateUserPerms function
// Should be moved to a types file
// update return type to be more specific
export interface ValidateUserPerms {
  success: boolean;
  data: any;
  error: string | null;
  msg: string | null;
}

/**
 * Helper function to check if a user has one or more permissions needed to perform an action.
 * @param userId The id of the user to check
 * @param perms An array of permissions to check
 * @returns An object containing a success boolean, data, error, and msg
 * @example const result = await validateUserPerms('1234567890', ['ADMINISTRATOR']);
 * // output: { success: true, data: user, error: null, msg: 'Current User is authorized' }
 *
 */
export async function validateUserPerms(
  userId: string,
  perms: string[]
): Promise<ValidateUserPerms> {
  const user = await User.findById(userId).populate({
    path: 'roles',
    populate: {
      path: 'permissions',
    },
  });
  if (!user)
    return {
      success: false,
      data: null,
      error: 'User not found',
      msg: null,
    };

  const userPerms = user.roles.flatMap((role) =>
    role.permissions.map((perm) => perm.name)
  );
  const hasPerms = perms.some((perm) => userPerms.includes(perm));

  if (!hasPerms) {
    return {
      success: false,
      data: null,
      error: null,
      msg: `Current User is not authorized: ${perms.join(', ')}`,
    };
  }

  return {
    success: true,
    data: user,
    error: null,
    msg: 'Current User is authorized',
  };
}

/**
 * Helper function to populate the database with default data. This includes the permissions, roles, and a superadmin user.
 * @returns void
 * @example populateDatabase();
 *
 */
export async function populateDatabase(): Promise<void> {
  const path = __dirname;

  try {
    // Check if the 'permissions' collection already contains data
    const permissionsExist = await Permission.exists({});
    if (permissionsExist) {
      console.log(
        '[DATABASE]: Database already populated with default permission data'
      );
    } else {
      const permissionData = await fs.readFile(
        `${path}/json/permissions.json`,
        'utf-8'
      );

      const parsedPermissions = JSON.parse(permissionData);

      for (const permissionData of parsedPermissions) {
        // Extract and convert the $oid value to a proper ObjectId
        const id = new mongoose.Types.ObjectId(permissionData._id.$oid);
        const permissionFields = { ...permissionData, _id: id };
        await Permission.create(permissionFields);
      }
    }

    // Check if the 'roles' collection already contains data
    const rolesExist = await Role.exists({});
    if (rolesExist) {
      console.log(
        '[DATABASE]: Database already populated with default role data'
      );
    } else {
      const roleData = await fs.readFile(`${path}/json/roles.json`, 'utf-8');

      const parsedRoles = JSON.parse(roleData);

      for (const roleData of parsedRoles) {
        // Extract and convert the $oid value to a proper ObjectId
        const id = new mongoose.Types.ObjectId(roleData._id.$oid);
        const permissions = roleData.permissions.map(
          (permission: any) => permission.$oid
        );
        const assignables = roleData.assignables.map(
          (assignable: any) => assignable.$oid
        );
        const roleFields = { ...roleData, permissions, assignables, _id: id };
        await Role.create(roleFields);
      }
    }

    // Check if the 'users' collection already contains data
    const usersExist = await User.exists({});
    if (usersExist) {
      console.log(
        '[DATABASE]: Database already populated with default user data'
      );
    } else {
      const userData = await fs.readFile(`${path}/json/users.json`, 'utf-8');

      const parsedUsers = JSON.parse(userData);

      for (const userData of parsedUsers) {
        // Extract and convert the $oid value to a proper ObjectId
        const id = new mongoose.Types.ObjectId(userData._id.$oid);
        const roles = userData.roles?.map((role: any) => role.$oid);
        const userFields = { ...userData, roles, _id: id };
        await User.create(userFields);
      }
    }

    console.log('[DATABASE]: Database populated with default data');
  } catch (error) {
    // Handle the error here
    console.error('An error occurred:', error);
  }
}

export type TwitchSettingsInt = {
  twitchUsername: string;
  twitchClientID: string;
  twitchClientSecret: string;
  twitchBroadcasterID: string;
  twitchAccessToken: string;
  twitchRefreshToken: string;
  twitchTokenExpires: Date;
};

export type YoutubeSettingsInt = {
  youtubeClientID: string;
  youtubeClientSecret: string;
  youtubeAccessToken: string;
  youtubeRefreshToken: string;
  youtubeTokenExpires: Date;
};

/**
 * Checks if a Twitch channel is live
 * @param twitchClientID - Twitch Client ID
 * @param twitchClientSecret - Twitch Client Secret
 * @param twitchUsername - Twitch Username
 * @returns Promise with success flag, data and error message (if any)
 *
 * Todo: Look into replacing with websocket connection. See https://dev.twitch.tv/docs/api/webhooks-reference
 */
export async function checkTwitchStatus({
  twitchClientID,
  twitchClientSecret,
  twitchUsername,
}: Partial<TwitchSettingsInt>) {
  // Set up Twitch API
  const twitchAuthUrl = 'https://id.twitch.tv/oauth2/token';
  const twitchStreamUrl = 'https://api.twitch.tv/helix/streams';

  const authResponse = await fetch(twitchAuthUrl, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: twitchClientID,
      client_secret: twitchClientSecret,
      grant_type: 'client_credentials',
    }),
  });

  type AuthData = {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  type StreamData = {
    data: {
      id: string;
      user_id: string;
      user_name: string;
      game_id: string;
      type: string;
      title: string;
      viewer_count: number;
      started_at: string;
      language: string;
      thumbnail_url: string;
      tag_ids: string[];
    }[];
  };

  const authData = (await authResponse.json()) as AuthData;
  const twitchToken = authData.access_token;

  const streamResponse = await fetch(
    `${twitchStreamUrl}?user_login=${twitchUsername}`,
    {
      headers: {
        'Client-ID': twitchClientID!,
        Authorization: `Bearer ${twitchToken}`,
      },
    }
  );

  const streamData = (await streamResponse.json()) as StreamData;
  return {
    isLive: streamData.data[0]?.type === 'live',
    streamData: streamData,
  };
}

export const getEnv = () => {
  const {
    DEV_DISCORD_CLIENT_URL,
    PROD_DISCORD_CLIENT_URL,
    PROD_DISCORD_SERVER_URL,
    PROD_DISCORD_CLIENT_ID,
    PROD_DISCORD_CLIENT_SECRET,
    DEV_DISCORD_CLIENT_ID,
    DEV_DISCORD_CLIENT_SECRET,
    DEV_DISCORD_SERVER_URL,
  } = process.env;

  let clientUrl = '';
  let serverUrl = '';
  let clientID = '';
  let clientSecret = '';
  let cookie = {};
  // Set client and server url based on environment
  if (process.env.NODE_ENV === 'production') {
    if (
      !PROD_DISCORD_CLIENT_URL ||
      !PROD_DISCORD_SERVER_URL ||
      !PROD_DISCORD_CLIENT_ID ||
      !PROD_DISCORD_CLIENT_SECRET
    ) {
      throw new Error('[SERVER]: Missing environment variables for production');
    }

    serverUrl = PROD_DISCORD_SERVER_URL;
    clientUrl = PROD_DISCORD_CLIENT_URL;
    clientID = PROD_DISCORD_CLIENT_ID;
    clientSecret = PROD_DISCORD_CLIENT_SECRET;
    cookie = {
      sameSite: 'strict',
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: false,
      domain: '.hatfilms.co.uk',
    };
  } else {
    if (
      !DEV_DISCORD_CLIENT_URL ||
      !DEV_DISCORD_SERVER_URL ||
      !DEV_DISCORD_CLIENT_ID ||
      !DEV_DISCORD_CLIENT_SECRET
    ) {
      throw new Error(
        '[SERVER]: Missing environment variables for development'
      );
    }

    serverUrl = DEV_DISCORD_SERVER_URL;
    clientUrl = DEV_DISCORD_CLIENT_URL;
    clientID = DEV_DISCORD_CLIENT_ID;
    clientSecret = DEV_DISCORD_CLIENT_SECRET;
    cookie = {
      sameSite: 'lax',
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: false,
      domain: 'localhost',
    };
  }
  return { clientUrl, cookie, serverUrl, clientID, clientSecret };
};
