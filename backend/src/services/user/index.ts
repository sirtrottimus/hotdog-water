import {
  Permission,
  User as UserSchema,
  Role as RoleSchema,
} from '../../database/schema';

import { validateUserPerms } from '../../utils/helpers';
import { Options } from '../helpers';

export class UserService {
  async getCurrent(options: Options) {
    const { userId } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const user = await UserSchema.findById(userId)
      .populate({
        path: 'roles',
        populate: {
          path: 'assignables',
          model: RoleSchema,
        },
      })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: Permission,
        },
      })
      .exec();
    if (!user)
      return { success: false, data: null, error: null, msg: 'User not found' };

    return { success: true, data: user, error: null, msg: null };
  }

  async getById(options: Options) {
    const { userId, id: extId } = options;
    if (!extId) {
      throw new Error('No EID Parameter');
    }

    if (!userId) {
      throw new Error('No UID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'VIEW_USER',
    ]);
    if (!validationResult.success) return validationResult;

    const extUser = await UserSchema.findById(extId)
      .select(['-accessToken', '-refreshToken'])
      .populate('roles')
      .lean()
      .exec();
    if (!extUser)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'External User not found',
      };

    return { success: true, data: extUser, error: null, msg: null };
  }

  async getAll(options: Options) {
    const { userId } = options;
    if (!userId) {
      throw new Error('No UID Parameter');
    }

    const user = await UserSchema.findById(userId).populate('roles');
    if (!user)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User not found',
      };

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'VIEW_USERS',
    ]);
    if (!validationResult.success) return validationResult;

    const users = await UserSchema.find()
      .populate('roles')
      .select(['-accessToken', '-refreshToken'])
      .lean()
      .exec();
    if (!users)
      return { success: false, data: null, error: null, msg: 'No Users found' };

    return { success: true, data: users, error: null, msg: null };
  }

  async updateRoles(options: Options) {
    const {
      userId,
      id: extId,
      body: {
        roles: { roles: roleIds },
        action,
      },
    } = options;

    if (!userId) {
      throw new Error('No UID Parameter');
    }

    if (!extId) {
      throw new Error('No EID Parameter');
    }

    if (!roleIds) {
      throw new Error('No RIDs Parameter');
    }

    const roles = await RoleSchema.find({ _id: { $in: roleIds } });

    if (!roles)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Roles not found',
      };

    const cUser = await UserSchema.findById(userId).populate('roles');
    if (!cUser)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User not found',
      };

    const validationResult = await validateUserPerms(userId, ['SUPERADMIN']);
    if (!validationResult.success) {
      //check if the user has a role that can assign the role

      const userRoles = cUser.roles.map((role) => role.name);

      const canAssign = userRoles.some((r) => {
        return roles.some((role) => {
          return role.assignables.find((a) => a.name === r);
        });
      });

      if (!canAssign)
        return {
          success: false,
          data: null,
          error: null,
          msg: 'Current User cannot assign this role',
        };
    }

    const user = await UserSchema.findById(extId).populate('roles');

    if (!user)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'External User not found',
      };

    if (action === 'add') {
      user.roles.push(...roles);
    } else if (action === 'remove') {
      user.roles = user.roles.filter((role) => !roleIds.includes(role._id));
    } else {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Invalid Action',
      };
    }

    await user.save();

    return { success: true, data: user, error: null, msg: null };
  }

  async update(options: Options) {
    const { userId, id: extId, body: data } = options;
    if (!userId) {
      throw new Error('No UID Parameter');
    }

    if (!extId) {
      throw new Error('No EID Parameter');
    }

    if (!data) {
      throw new Error('No Data Parameter');
    }

    const cUser = await UserSchema.findById(userId).populate('roles');
    if (!cUser)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User not found',
      };

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_USER',
    ]);
    if (!validationResult.success) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User cannot update this user',
      };
    }

    const user = await UserSchema.findByIdAndUpdate(extId, data, {
      new: true,
    })
      .populate('roles')
      .lean()
      .exec();

    if (!user)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'External User not found',
      };

    return { success: true, data: user, error: null, msg: null };
  }
  async getByRole(options: Options) {
    const { userId, name } = options;
    if (!userId) {
      throw new Error('No UID Parameter');
    }

    if (!name) {
      throw new Error('No name Parameter');
    }
    const role = await RoleSchema.find({ name }).populate('assignables');

    if (!role)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Role not found',
      };

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'READ_ALL_USERS',
    ]);
    if (!validationResult.success) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User cannot read this user',
      };
    }

    const users = await UserSchema.find({ roles: { $in: role } })
      .populate('roles')
      .lean()
      .exec();

    if (!users)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'No Users found',
      };

    return { success: true, data: users, error: null, msg: null };
  }

  async getByRoles(options: Options) {
    const { userId, body: names } = options;
    if (!userId) {
      throw new Error('No UID Parameter');
    }

    if (!names) {
      throw new Error('No name Parameter');
    }

    const roles = await RoleSchema.find({ name: { $in: names } }).populate(
      'assignables'
    );

    if (!roles)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Roles not found',
      };

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'READ_ALL_USERS',
    ]);
    if (!validationResult.success) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User cannot read this user',
      };
    }

    const users = await UserSchema.find({ roles: { $in: roles } })
      .populate('roles')
      .lean()
      .exec();

    if (!users)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'No Users found',
      };

    return { success: true, data: users, error: null, msg: null };
  }

  async create(options: Options) {
    const { userId, body: newUser } = options;
    if (!userId) {
      throw new Error('No UID Parameter');
    }

    const cUser = await UserSchema.findById(userId).populate('roles');
    if (!cUser)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User not found',
      };

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_USER',
    ]);
    if (!validationResult.success) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Current User cannot create this user',
      };
    }

    const user = await UserSchema.findOne({
      discordId: newUser.discordId,
    })
      .lean()
      .exec();

    if (user)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'User already exists',
      };

    const createdUser = await UserSchema.create({
      ...newUser,
      username: 'Unconfirmed User',
      avatar: 'https://i.imgur.com/3GKMJnO.png',
      roles: [],
    });

    if (!createdUser)
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating User',
      };

    return { success: true, data: createdUser, error: null, msg: null };
  }
}
