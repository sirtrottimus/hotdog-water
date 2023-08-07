// Services for handling roles

import {
  Permission as PermissionSchema,
  Role as RoleSchema,
  User as UserSchema,
} from '../../database/schema';
import { validateUserPerms } from '../../utils/helpers';
import { Options } from '../helpers';

export class RoleService {
  async getAll(options: Options) {
    const { userId } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'VIEW_ROLES',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const roles = await RoleSchema.find({})
      .populate('permissions')
      .populate('assignables');

    return { success: true, data: roles, error: null, msg: null };
  }

  async getAllAssignable(options: Options) {
    const { userId } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
    ]);

    if (!validationResult.success) {
      // check the users roles, and match them to the assignable roles
      const user = await UserSchema.findById(userId).populate('roles');

      if (!user) {
        return {
          success: false,
          data: null,
          error: null,
          msg: 'User not found',
        };
      }

      const roles = await RoleSchema.find({ assignable: true }).populate(
        'roles'
      );

      const assignableRoles = roles.filter((role) => {
        const userRoles = user.roles.map((role) => role.name);
        return userRoles.includes(role.name);
      });

      return { success: true, data: assignableRoles, error: null, msg: null };
    }

    const roles = await RoleSchema.find({});

    return { success: true, data: roles, error: null, msg: null };
  }

  async getById(options: Options) {
    const { userId, id: roleId } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }
    if (!roleId) {
      throw new Error('No EID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'VIEW_ROLES',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const role = await RoleSchema.findById(roleId).populate('permissions');

    return { success: true, data: role, error: null, msg: null };
  }

  async create(options: Options) {
    const { userId, body: role } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }
    if (!role) {
      throw new Error('No role parameter');
    }
    if (!role.permissions) {
      throw new Error('No permissions parameter');
    }
    if (role.permissions.includes('' as any)) {
      throw new Error('Permissions cannot be empty');
    }
    if (role._id) {
      throw new Error('Cannot create a role with an ID');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'CREATE_ROLE',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    //Check if the role already exists

    const existingRole = await RoleSchema.findOne({ name: role.name });

    if (existingRole) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Role already exists',
      };
    }

    if (role.assignables.includes('' as any)) {
      const anyRoles = await RoleSchema.find({});

      if (anyRoles) {
        role.assignables = anyRoles.map((role) => role);
      } else {
        role.assignables = null as any;
      }
    }

    const newRole = await RoleSchema.create({
      ...role,
    });

    if (!role.permissions.includes('' as any)) {
      await PermissionSchema.updateMany(
        { _id: { $in: role.permissions } },
        { $push: { roles: newRole._id } }
      ).populate('roles');
    }

    return { success: true, data: newRole, error: null, msg: null };
  }

  async update(options: Options) {
    const { userId, body: role } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }
    if (!role) {
      throw new Error('No role parameter');
    }
    if (role.permissions.includes('' as any)) {
      throw new Error('Permissions cannot be empty');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'UPDATE_ROLE',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const updatedRole = await RoleSchema.findByIdAndUpdate(
      role._id,
      { ...role },
      { new: true }
    ).populate('permissions');

    if (!updatedRole) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Role not found',
      };
    }

    return { success: true, data: updatedRole, error: null, msg: null };
  }

  async delete(options: Options) {
    const { userId, id: roleId } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }
    if (!roleId) {
      throw new Error('No EID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'DELETE_ROLE',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const role = await RoleSchema.findByIdAndDelete(roleId).populate(
      'permissions'
    );

    if (!role) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Role not found',
      };
    }

    await PermissionSchema.updateMany(
      { _id: { $in: role?.permissions } },
      { $pull: { roles: role?._id } },
      { multi: true }
    ).populate('roles');

    const users = await UserSchema.find({ roles: role?._id });

    await UserSchema.updateMany(
      { _id: { $in: users } },
      { $pull: { roles: role?._id } },
      { multi: true }
    ).populate('roles');

    return { success: true, data: role, error: null, msg: null };
  }

  toString() {
    return 'Role Service';
  }

  [key: string]: (...args: any[]) => string | Promise<any>;
}
