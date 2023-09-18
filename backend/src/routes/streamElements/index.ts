// Routes for streamElements related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import {
  streamElementsController,
  streamElementsSettingsController,
} from '../../controllers/streamElements';

// Create router
const router = Router();

// Route for getting all roles
router.get('/one', isAuthenticated, streamElementsSettingsController.get);

// Route for creating a role
router.post('/', isAuthenticated, streamElementsSettingsController.create);

// Route for updating a role
router.put('/', isAuthenticated, streamElementsSettingsController.update);

//StreamElements Activity Endpoints
router.get(
  '/activity',
  isAuthenticated,
  streamElementsController.getStreamActivity
);

// Export router
export default router;
