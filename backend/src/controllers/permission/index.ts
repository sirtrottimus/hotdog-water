/**
 * Controller for permission endpoints.
 * @module controllers/permission
 * @category Controllers
 * @subcategory Permission
 * @requires express
 * @requires ../../database/schema/Permission
 * @requires ../../services/permission
 * @requires ../helpers
 *
 * @see {@link module:routes/permission}
 * @see {@link module:services/permission}
 */
import { Request, Response } from 'express';
import { PermissionInt } from '../../database/schema/Permission';
import { PermissionService } from '../../services/permission';
import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';

const permissionService = new PermissionService();

const permissionController = {
  async getAllPermissions(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(
      res,
      permissionService.getAllPermissions,
      user,
      {},
      'permission'
    );
  },

  async getPermissionById(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;

    await handleRequest(
      res,
      permissionService.getPermissionById,
      user,
      { id },
      'permission'
    );
  },

  async createPermission(req: Request, res: Response) {
    const user = req.user as UserInt;
    const permission = req.body as PermissionInt;

    await handleRequest(
      res,
      permissionService.createPermission,
      user,
      { body: permission },
      'permission'
    );
  },

  async updatePermission(req: Request, res: Response) {
    const user = req.user as UserInt;
    const permission = req.body as PermissionInt;

    await handleRequest(
      res,
      permissionService.updatePermission,
      user,
      { body: permission },
      'permission'
    );
  },

  async deletePermission(req: Request, res: Response) {
    const user = req.user as UserInt;
    const { id } = req.params;

    await handleRequest(
      res,
      permissionService.deletePermission,
      user,
      { id },
      'permission'
    );
  },
};

export default permissionController;
