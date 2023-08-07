// Services for Permission handling

import { Permission as PermissionSchema } from '../../database/schema';
import { validateUserPerms } from '../../utils/helpers';
import { Options } from '../helpers';

export class PermissionService {
  async getAllPermissions({ userId }: Options) {
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'VIEW_PERMISSIONS_PAGE',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const permissions = await PermissionSchema.find({});

    return { success: true, data: permissions, error: null, msg: null };
  }

  async getPermissionById({ userId, id: permissionId }: Options) {
    if (!userId) {
      throw new Error('No ID Parameter');
    }
    if (!permissionId) {
      throw new Error('No EID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'VIEW_PERMISSIONS_PAGE',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const permission = await PermissionSchema.findById(permissionId);

    return { success: true, data: permission, error: null, msg: null };
  }

  async createPermission({ userId, body: permission }: Options) {
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const validationResult = await validateUserPerms(userId, ['SUPERADMIN']);

    if (!validationResult.success) {
      return validationResult;
    }

    // Check if permission already exists
    const existingPermission = await PermissionSchema.findOne({
      name: permission.name,
    });

    if (existingPermission) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Permission already exists',
      };
    }

    const newPermission = await PermissionSchema.create(permission);

    return { success: true, data: newPermission, error: null, msg: null };
  }

  async updatePermission({ userId, body: permission }: Options) {
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const validationResult = await validateUserPerms(userId, ['SUPERADMIN']);

    if (!validationResult.success) {
      return validationResult;
    }

    const newPermission = await PermissionSchema.findByIdAndUpdate(
      permission._id,
      permission,
      { new: true }
    );

    if (!newPermission) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Permission not found',
      };
    }

    return { success: true, data: newPermission, error: null, msg: null };
  }

  async deletePermission({ userId, id: permissionId }: Options) {
    if (!userId) {
      throw new Error('No ID Parameter');
    }
    if (!permissionId) {
      throw new Error('No EID Parameter');
    }

    const validationResult = await validateUserPerms(userId, ['SUPERADMIN']);

    if (!validationResult.success) {
      return validationResult;
    }

    const permission = await PermissionSchema.findById(permissionId);

    if (!permission) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Permission not found',
      };
    }

    await permission.remove();

    return { success: true, data: permission, error: null, msg: null };
  }
}
