/**
 * Controller for youtubeSettings endpoints
 * @module controllers/youtubeSettings
 * @category Controllers
 * @subcategory YoutubeSettings
 * @requires express
 * @requires ../../database/schema/youtubeSettings
 * @requires ../../services/youtubeSettings
 * @requires ../helpers
 *
 * @see {@link module:routes/youtubeSettings}
 * @see {@link module:services/youtubeSettings}
 */

import { Request, Response } from 'express';

import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';
import { YoutubeSettingsService } from '../../services/youtube';
import { validateUserPerms } from '../../utils/helpers';

const youtubeSettingsController = {
  async get(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'VIEW_YOUTUBE_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.get,
      user,
      {},
      'youtubeSettings'
    );
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'CREATE_YOUTUBE_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.create,
      user,
      {
        body: req.body,
      },
      'youtubeSettings'
    );
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_YOUTUBE_SETTINGS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.update,
      user,
      {
        body: req.body,
      },
      'youtubeSettings'
    );
  },

  async testGet(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'TEST_YOUTUBE_SETTINGS_GET',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.testGet,
      user,
      {},
      'youtubeSettings'
    );
  },

  async testPost(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'TEST_YOUTUBE_SETTINGS_POST',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.testPost,
      user,
      {},
      'youtubeSettings'
    );
  },

  async getChannelDetails(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'GET_YOUTUBE_CHANNEL_DETAILS',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.getChannelDetails,
      user,
      {},
      'youtubeSettings'
    );
  },

  async getMemberships(req: Request, res: Response) {
    const memberId = req.query.memberId;
    await handleRequest(
      res,
      YoutubeSettingsService.getMemberships,
      null,
      {
        body: {
          memberId,
        },
      },
      'youtubeSettings'
    );
  },

  async isChannelLive(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'CHECK_YOUTUBE_CHANNEL_LIVE',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.isChannelLive,
      user,
      {},
      'youtubeSettings'
    );
  },

  async updateLiveStream(req: Request, res: Response) {
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, [
      'SUPERADMIN',
      'ADMIN',
      'MODERATOR',
      'UPDATE_YOUTUBE_LIVE_STREAM',
    ]);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(
      res,
      YoutubeSettingsService.updateLiveStream,
      user,
      {
        body: req.body,
      },
      'youtubeSettings'
    );
  },
};

export default youtubeSettingsController;
