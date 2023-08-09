/**
 * Controller for streamElementsSettings endpoints
 * @module controllers/streamElementsSettings
 * @category Controllers
 * @subcategory StreamElementsSettings
 * @requires express
 * @requires ../../database/schema/streamElementsSettings
 * @requires ../../services/streamElementsSettings
 * @requires ../helpers
 *
 * @see {@link module:routes/streamElementsSettings}
 * @see {@link module:services/streamElementsSettings}
 */

import { Request, Response } from 'express';

import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';
import { StreamElementsSettingsService } from '../../services/streamElements';
import { validateUserPerms } from '../../utils/helpers';

const streamElementsSettingsController = {
  async get(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_STREAMELEMENTS_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      StreamElementsSettingsService.get,
      user,
      {},
      'streamElementsSettings'
    );
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'CREATE_STREAMELEMENTS_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      StreamElementsSettingsService.create,
      user,
      {
        body: req.body,
      },
      'streamElementsSettings'
    );
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_STREAMELEMENTS_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      StreamElementsSettingsService.update,
      user,
      {
        body: req.body,
      },
      'streamElementsSettings'
    );
  },
};

export default streamElementsSettingsController;
