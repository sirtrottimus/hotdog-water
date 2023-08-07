import FunctionLog from '../../database/schema/FunctionLog';
import { validateUserPerms } from '../../utils/helpers';
import { Options } from '../helpers';

export class AuditService {
  static async getAll(options: Options) {
    const { userId } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'READ_ALL_AUDIT',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const audit = await FunctionLog.find({}).populate('user');

    return { success: true, data: audit, error: null, msg: null };
  }

  static async getById(options: Options) {
    const { userId, id } = options;
    if (!userId) {
      throw new Error('No ID Parameter');
    }

    const validationResult = await validateUserPerms(userId, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'READ_ALL_AUDIT',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    const audit = await FunctionLog.findById(id).populate('user');

    if (!audit) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Audit not found',
      };
    }

    return { success: true, data: audit, error: null, msg: null };
  }
}
