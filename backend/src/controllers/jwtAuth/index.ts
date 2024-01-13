/**
 * Controller for JWT Authentication endpoints
 * @module controllers/jwtAuth
 * @category Controllers
 * @subcategory JWTAuth
 * @requires express
 * @requires ../../database/schema/JWTAuth
 * @requires ../../services/JWTAuth
 * @requires ../helpers
 *
 * @see {@link module:routes/jwtAuth}
 * @see {@link module:services/JWTAuth}
 */

import { Request, Response } from 'express';

import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';
import { JWTAuthService } from '../../services/JWTAuth';
import { validateUserPerms } from '../../utils/helpers';

const jwtAuthController = {
  async get(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_JWT_AUTH',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(res, JWTAuthService.get, user, {}, 'jwtAuth');
  },

  async getActive(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_JWT_AUTH',
    ]);

    await handleRequest(res, JWTAuthService.getActive, user, {}, 'jwtAuth');

    if (!validationResult.success) {
      return validationResult;
    }
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'CREATE_JWT_AUTH',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(res, JWTAuthService.create, user, req.body, 'jwtAuth');
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_JWT_AUTH',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(res, JWTAuthService.update, user, req.body, 'jwtAuth');
  },
};

export default jwtAuthController;
