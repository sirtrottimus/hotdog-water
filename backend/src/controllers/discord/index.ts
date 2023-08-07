/**
 * Controller for discordSettings endpoints
 * @module controllers/discordSettings
 * @category Controllers
 * @subcategory DiscordSettings
 * @requires express
 * @requires ../../database/schema/discordSettings
 * @requires ../../services/discordSettings
 * @requires ../helpers
 *
 * @see {@link module:routes/discordSettings}
 * @see {@link module:services/discordSettings}
 */

import { Request, Response } from 'express';

import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';
import { DiscordSettingsService } from '../../services/discord';
import { validateUserPerms } from '../../utils/helpers';

const discordSettingsController = {
  async get(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_DISCORD_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      DiscordSettingsService.get,
      user,
      {},
      'discordSettings'
    );
  },

  async getAll(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_DISCORD_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      DiscordSettingsService.getAll,
      user,
      {},
      'discordSettings'
    );
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'CREATE_DISCORD_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      DiscordSettingsService.create,
      user,
      {
        body: req.body,
      },
      'discordSettings'
    );
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_DISCORD_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      DiscordSettingsService.update,
      user,
      {
        body: req.body,
      },
      'discordSettings'
    );
  },

  async delete(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'DELETE_DISCORD_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      DiscordSettingsService.delete,
      user,
      {
        id: req.params.id,
      },
      'discordSettings'
    );
  },
};

export default discordSettingsController;
