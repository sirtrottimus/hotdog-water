/**
 * Controller for twitchSettings endpoints
 * @module controllers/twitchSettings
 * @category Controllers
 * @subcategory TwitchSettings
 * @requires express
 * @requires ../../database/schema/twitchSettings
 * @requires ../../services/twitchSettings
 * @requires ../helpers
 *
 * @see {@link module:routes/twitchSettings}
 * @see {@link module:services/twitchSettings}
 */

import { Request, Response } from 'express';

import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';
import { TwitchSettingsService } from '../../services/twitch';
import { validateUserPerms } from '../../utils/helpers';

const twitchSettingsController = {
  async get(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_TWITCH_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitchSettingsService.get,
      user,
      {},
      'twitchSettings'
    );
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'CREATE_TWITCH_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitchSettingsService.create,
      user,
      {
        body: req.body,
      },
      'twitchSettings'
    );
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_TWITCH_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitchSettingsService.update,
      user,
      {
        body: req.body,
      },
      'twitchSettings'
    );
  },

  async runAd(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'RUN_TWITCH_AD',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      TwitchSettingsService.runAd,
      user,
      {},
      'twitchSettings'
    );
  },
};

export default twitchSettingsController;
