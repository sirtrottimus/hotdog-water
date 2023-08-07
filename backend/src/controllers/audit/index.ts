/**
 * Controllers for the Audit model
 * @module controllers/audit
 * @category Controllers
 * @subcategory Audit
 * @requires express
 * @requires ../../database/schema/FunctionLog
 * @requires ../../services/audit
 * @requires ../helpers
 *
 * @see {@link module:routes/audit}
 * @see {@link module:services/audit}
 */

import { Request, Response } from 'express';
import { UserInt } from '../../database/schema/User';
import { AuditService } from '../../services/audit';
import { handleRequest } from '../helpers';

const auditController = {
  async getAllAudits(req: Request, res: Response) {
    const user = req.user as UserInt;

    await handleRequest(res, AuditService.getAll, user, {}, 'audit');
  },

  async getAuditById(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as UserInt;

    await handleRequest(res, AuditService.getById, user, { id }, 'audit');
  },
};

export default auditController;
