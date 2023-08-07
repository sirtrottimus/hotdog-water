// Routes for role related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';

import roleController from '../../controllers/role';

// Create router
const router = Router();

// Route for getting all roles
router.get('/', isAuthenticated, roleController.getAll);

// Route for getting all assignable roles
router.get('/assignable', isAuthenticated, roleController.getAllAssignable);

// Route for getting a role by ID
router.get('/:id', isAuthenticated, roleController.getById);

// Route for creating a role
router.post('/', isAuthenticated, roleController.create);

// Route for updating a role
router.put('/:id', isAuthenticated, roleController.update);

// Route for deleting a role
router.delete('/:id', isAuthenticated, roleController.delete);

// Export router
export default router;
