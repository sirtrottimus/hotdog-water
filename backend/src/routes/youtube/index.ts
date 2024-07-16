// Routes for youtube related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import youtubeSettingsController from '../../controllers/youtube';

// Create router
const router = Router();

// Route for getting all roles
router.get('/one', isAuthenticated, youtubeSettingsController.get);

// Route for creating a role
router.post('/', isAuthenticated, youtubeSettingsController.create);

// Route for updating a role
router.put('/', isAuthenticated, youtubeSettingsController.update);

// Route for testing youtube connection with a get request
router.get('/test/get', isAuthenticated, youtubeSettingsController.testGet);

// Route for testing youtube connection with a post request
router.get('/test/post', isAuthenticated, youtubeSettingsController.testPost);

//Route for getting channel Details
router.get(
  '/channel',
  isAuthenticated,
  youtubeSettingsController.getChannelDetails
);

router.get('/live', isAuthenticated, youtubeSettingsController.isChannelLive);

router.put(
  '/live',
  isAuthenticated,
  youtubeSettingsController.updateLiveStream
);

// Export router
export default router;
