// Routes for discord related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import discordSettingsController from '../../controllers/discord';

// Create router
const router = Router();

// Route for getting all roles
router.get('/one', isAuthenticated, discordSettingsController.get);

// Route for getting all roles
router.get('/', isAuthenticated, discordSettingsController.getAll);

// Route for creating a role
router.post('/', isAuthenticated, discordSettingsController.create);

// Route for updating a role
router.put('/:id', isAuthenticated, discordSettingsController.update);

// Route for deleting a role
router.delete('/:id', isAuthenticated, discordSettingsController.delete);

// Export router
export default router;
