/**
 * Controller for schedule endpoints
 * @module controllers/schedule
 * @category Controllers
 * @subcategory Schedule
 * @requires express
 * @requires ../../database/schema/Schedule
 * @requires ../../services/schedule
 * @requires ../helpers
 *
 * @see {@link module:routes/schedule}
 * @see {@link module:services/schedule}
 */

import { Request, Response } from 'express';

import { UserInt } from '../../database/schema/User';
import { handleRequest } from '../helpers';
import { ScheduleService } from '../../services/schedule';
import { validateUserPerms } from '../../utils/helpers';

const scheduleService = new ScheduleService();

const scheduleController = {
  async getAll(req: Request, res: Response) {
    await handleRequest(res, scheduleService.getAll, null, {}, 'schedule');
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;

    const validationResult = await validateUserPerms(user._id, ['SUPERADMIN']);

    if (!validationResult.success) {
      return validationResult;
    }

    await handleRequest(res, scheduleService.getById, user, { id }, 'schedule');
  },

  async create(req: Request, res: Response) {
    const user = req.user as UserInt;
    const validationResult = await validateUserPerms(user._id, ['SUPERADMIN']);
    if (!validationResult.success) {
      return validationResult;
    }
    await handleRequest(
      res,
      scheduleService.create,
      user,
      {
        body: req.body,
      },
      'schedule'
    );
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;
    const validationResult = await validateUserPerms(user._id, ['SUPERADMIN']);

    if (!validationResult.success) {
      return validationResult;
    }
    await handleRequest(res, scheduleService.delete, user, { id }, 'schedule');
  },

  async update(req: Request, res: Response) {
    const user = req.user as UserInt;
    const validationResult = await validateUserPerms(user._id, ['SUPERADMIN']);

    if (!validationResult.success) {
      return validationResult;
    }
    await handleRequest(
      res,
      scheduleService.update,
      user,
      { body: req.body },
      'schedule'
    );
  },
};

export default scheduleController;
