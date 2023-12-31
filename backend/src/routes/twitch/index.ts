// Routes for twitch related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import twitchSettingsController from '../../controllers/twitch';

// Create router
const router = Router();

// Route for getting all roles
router.get('/one', isAuthenticated, twitchSettingsController.get);

// Route for creating a role
router.post('/', isAuthenticated, twitchSettingsController.create);

// Route for updating a role
router.put('/', isAuthenticated, twitchSettingsController.update);

// Export router
export default router;
