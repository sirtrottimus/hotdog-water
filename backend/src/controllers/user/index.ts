/**
 * Controllers for user routes
 * @module controllers/user
 * @category Controllers
 * @subcategory User
 * @requires express
 * @requires ../../database/schema/User
 * @requires ../../services/user
 *
 * @see {@link module:routes/user}
 * @see {@link module:services/user}
 */

import { Request, Response } from 'express';
import { UserInt } from '../../database/schema/User';
import { UserService } from '../../services/user';
import { handleRequest } from '../helpers';

const userService = new UserService();

const userController = {
  async getCurrent(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(res, userService.getCurrent, user, {}, 'user');
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;

    await handleRequest(res, userService.getById, user, { id }, 'user');
  },

  async getAll(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(res, userService.getAll, user, {}, 'user');
  },

  async getByRole(req: Request, res: Response) {
    const { name } = req.params;
    const user = req.user as UserInt;

    await handleRequest(res, userService.getByRole, user, { name }, 'user');
  },

  async getByRoles(req: Request, res: Response) {
    const user = req.user as UserInt;
    await handleRequest(
      res,
      userService.getByRoles,
      user,
      {
        body: req.query.names,
      },
      'user'
    );
  },

  async updateRoles(req: Request, res: Response) {
    const { id } = req.params;

    const user = req.user as UserInt;

    await handleRequest(
      res,
      userService.updateRoles,
      user,
      {
        id,
        body: req.body,
      },
      'user'
    );
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(
      res,
      userService.create,
      user,
      { body: req.body },
      'user'
    );
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;

    await handleRequest(
      res,
      userService.update,
      user,
      { body: req.body, id },
      'user'
    );
  },
};

export default userController;
