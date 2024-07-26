// Routes for schedule related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import scheduleController from '../../controllers/schedule';

// Create router
const router = Router();

// Route for getting all schedule events without authentication
router.get('/', scheduleController.getAll);

// Route for getting a schedule event by ID
router.get('/:id', isAuthenticated, scheduleController.getById);

// Route for creating a schedule event
router.post('/', isAuthenticated, scheduleController.create);

// Route for updating a schedule event
router.put('/:id', isAuthenticated, scheduleController.update);

// Route for deleting a schedule event
router.delete('/:id', isAuthenticated, scheduleController.delete);

// Export router
export default router;
