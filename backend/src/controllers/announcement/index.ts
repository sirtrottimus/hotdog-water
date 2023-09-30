/**
 * Controller for discordSettings endpoints
 * @module controllers/discordSettings
 * @category Controllers
 * @subcategory Announcements
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
import { AnnouncementsService } from '../../services/announcement';
import { validateUserPerms } from '../../utils/helpers';

const announcementController = {
  async post(req: Request, res: Response) {
    const user = req.user as UserInt;
    const postTo = req.body.postTo;

    if (!postTo) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'No postTo provided',
      };
    }

    if (postTo === 'discord') {
      const res = await validateUserPerms(user._id, [
        'SUPERADMIN',
        'POST_ANNOUNCEMENT_DISCORD',
      ]);

      if (!res.success) {
        return res;
      }
    }

    if (postTo === 'twitter') {
      const res = await validateUserPerms(user._id, [
        'SUPERADMIN',
        'POST_ANNOUNCEMENT_TWITTER',
      ]);

      if (!res.success) {
        return res;
      }
    }

    if (postTo === 'Twitch (StreamElements)') {
      const res = await validateUserPerms(user._id, [
        'SUPERADMIN',
        'POST_ANNOUNCEMENT_TWITCH',
      ]);

      if (!res.success) {
        return res;
      }
    }

    await handleRequest(
      res,
      AnnouncementsService.post,
      user,
      { body: req.body },
      'announcement'
    );
  },

  async getPaginated(req: Request, res: Response) {
    const user = req.user as UserInt;
    const offset = req.query.offset;
    const limit = req.query.limit;

    if (!offset || !limit) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'No offset or limit provided',
      };
    }

    await handleRequest(
      res,
      AnnouncementsService.getPaginated,
      user,
      { query: req.query },
      'announcement'
    );
  },
};

export default announcementController;
