/**
 * Controller for twitterSettings endpoints
 * @module controllers/twitterSettings
 * @category Controllers
 * @subcategory TwitterSettings
 * @requires express
 * @requires ../../database/schema/twitterSettings
 * @requires ../../services/twitterSettings
 * @requires ../helpers
 *
 * @see {@link module:routes/twitterSettings}
 * @see {@link module:services/twitterSettings}
 */

import { Request, Response } from 'express';

import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';
import { TwitterSettingsService } from '../../services/twitter';
import { validateUserPerms } from '../../utils/helpers';

const twitterSettingsController = {
  async get(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_TWITTER_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitterSettingsService.get,
      user,
      {},
      'twitterSettings'
    );
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'CREATE_TWITTER_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitterSettingsService.create,
      user,
      {
        body: req.body,
      },
      'twitterSettings'
    );
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_TWITTER_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitterSettingsService.update,
      user,
      {
        body: req.body,
      },
      'twitterSettings'
    );
  },

  async testGet(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'TEST_TWITTER_SETTINGS_GET',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitterSettingsService.testGet,
      user,
      {},
      'twitterSettings'
    );
  },

  async testPost(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'TEST_TWITTER_SETTINGS_POST',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitterSettingsService.testPost,
      user,
      {},
      'twitterSettings'
    );
  },
};

export default twitterSettingsController;
