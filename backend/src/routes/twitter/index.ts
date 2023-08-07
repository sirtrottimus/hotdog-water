// Routes for twitter related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import twitterSettingsController from '../../controllers/twitter';

// Create router
const router = Router();

// Route for getting all roles
router.get('/one', isAuthenticated, twitterSettingsController.get);

// Route for creating a role
router.post('/', isAuthenticated, twitterSettingsController.create);

// Route for updating a role
router.put('/', isAuthenticated, twitterSettingsController.update);

// Route for testing twitter connection with a get request
router.get('/test/get', isAuthenticated, twitterSettingsController.testGet);

// Route for testing twitter connection with a post request
router.get('/test/post', isAuthenticated, twitterSettingsController.testPost);

// Export router
export default router;
