// Routes for audit related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';

import auditController from '../../controllers/audit';

// Create router
const router = Router();

// Route for getting all audits
router.get('/', isAuthenticated, auditController.getAllAudits);

// Route for getting an audit by ID
router.get('/audit/:id', isAuthenticated, auditController.getAuditById);

// Export router
export default router;
