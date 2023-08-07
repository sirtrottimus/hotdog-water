/*
 * This file contains helper functions that are used throughout the application.
 * Any helper functions that are used in multiple places should be added here.
 * If a helper function is only used in one place, it should be added to the file where it is used.
 *
 * Author: Shagger
 * Date: 21/12/2022
 * Version: 1.0.0
 * License: MIT
 *
 */
import { User } from '../database/schema';

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
