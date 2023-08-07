// Routes for rank related requests

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import permissionController from '../../controllers/permission';

// Create router
const router = Router();

// Route for getting all permissions
router.get('/', isAuthenticated, permissionController.getAllPermissions);

// Route for getting a permission by ID
router.get('/:id', isAuthenticated, permissionController.getPermissionById);

// Route for creating a permission
router.post('/', isAuthenticated, permissionController.createPermission);

// Route for updating a permission
router.put('/:id', isAuthenticated, permissionController.updatePermission);

// Route for deleting a permission
router.delete('/:id', isAuthenticated, permissionController.deletePermission);

// Export router
export default router;
