/**
 * Controller for role endpoints
 * @module controllers/role
 * @category Controllers
 * @subcategory Role
 * @requires express
 * @requires ../../database/schema/Role
 * @requires ../../services/role
 * @requires ../helpers
 *
 * @see {@link module:routes/role}
 * @see {@link module:services/role}
 */

import { Request, Response } from 'express';

import { RoleService } from '../../services/role';
import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';

const roleService = new RoleService();

const roleController = {
  async getAll(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(res, roleService.getAll, user, {}, 'role');
  },

  async getAllAssignable(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(res, roleService.getAllAssignable, user, {}, 'role');
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;

    await handleRequest(res, roleService.getById, user, { id }, 'role');
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(
      res,
      roleService.create,
      user,
      {
        body: req.body,
      },
      'role'
    );
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;

    await handleRequest(res, roleService.delete, user, { id }, 'role');
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(
      res,
      roleService.update,
      user,
      { body: req.body },
      'role'
    );
  },
};

export default roleController;
