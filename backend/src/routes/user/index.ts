/**
 * Routes for user related requests
 * @module routes/user
 * @category Routes
 * @subcategory User
 * @requires express
 * @requires ../../controllers/user
 * @requires ../../utils/middleware
 *
 * @see {@link module:controllers/user}
 * @see {@link module:utils/middleware}
 */

import { Router } from 'express';

import { isAuthenticated } from '../../utils/middleware';
import userController from '../../controllers/user';

// Create router
const router = Router();

// Router for getting all users
router.get('/', isAuthenticated, userController.getAll);

// Route for getting the current user
router.get('/current', isAuthenticated, userController.getCurrent);

// Route for getting all users with specific roles
router.get('/roles', isAuthenticated, userController.getByRoles);

// Route for logging out
router.post('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.sendStatus(200);
  });
});

// Route for creating a new user
router.post('/', isAuthenticated, userController.create);

// Route for getting a user by internal id
router.get('/:id', isAuthenticated, userController.getById);

// Route for updating a user
router.put('/:id', isAuthenticated, userController.update);

// Route for removing a role from a user
router.put('/:id/roles', isAuthenticated, userController.updateRoles);

// Export router
export default router;
