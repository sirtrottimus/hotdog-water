// Routes for jwtAuth related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import jwtAuthController from '../../controllers/jwtAuth';

// Create router
const router = Router();

// Route for getting all notifications
router.get('/', isAuthenticated, jwtAuthController.get);

// Route for getting all active notifications
router.get('/active', isAuthenticated, jwtAuthController.getActive);

// Route for creating a notification
router.post('/', isAuthenticated, jwtAuthController.create);

// Route for updating a notification
router.put('/', isAuthenticated, jwtAuthController.update);

// Export router
export default router;
