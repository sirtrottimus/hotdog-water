// Routes for announcement related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';

import announcementController from '../../controllers/announcement';

// Create router
const router = Router();

// Route for posting an announcement
router.post('/', isAuthenticated, announcementController.post);

// Route for getting all announcements
router.get('/', isAuthenticated, announcementController.getPaginated);

// Export router
export default router;
