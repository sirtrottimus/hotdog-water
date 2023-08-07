/**
 * Middleware used across the application
 * @module utils/middleware
 * @category Utils
 * @subcategory Middleware
 * @requires express
 *
 * @see {@link module:routes}
 */
import { NextFunction, Request, Response } from 'express';

/**
 * Check if the user is authenticated
 * @param req - Express Request
 * @param res - Express Response
 * @param next - Express NextFunction
 * @returns => void
 * @throws => Error:
 * - 401: Unauthorised
 *
 * @see {@link module:routes}
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => (req.user ? next() : res.status(401).send({ msg: 'Unauthorised' }));
