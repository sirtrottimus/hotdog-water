/**
 * Routes for authentication related requests
 * @module routes/auth
 * @category Routes
 * @subcategory Auth
 * @requires express
 * @requires passport
 *
 * @see {@link module:utils/middleware}
 */

import { Router } from 'express';
import passport from 'passport';

// Destructure environment variables
const { DEV_DISCORD_CLIENT_URL, PROD_DISCORD_CLIENT_URL } = process.env;

let clientUrl = '';

// Set client and server url based on environment
if (process.env.NODE_ENV === 'production') {
  if (!PROD_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for production');
  }

  clientUrl = PROD_DISCORD_CLIENT_URL;
} else {
  if (!DEV_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for development');
  }

  clientUrl = DEV_DISCORD_CLIENT_URL;
}
// Create router
const router = Router();

// Route for authenticating with Discord
router.get(
  '/discord',
  passport.authenticate('discord', {
    scope: ['identify', 'guilds', 'guilds.members.read'],
  })
);

// Route for handling the callback from Discord
router.get('/discord/callback', (req, res, next) => {
  passport.authenticate('discord', (err, user, info) => {
    if (err) {
      return res.redirect(`${clientUrl}/?error=${encodeURIComponent(err)}`);
    }

    if (!user) {
      const error = info?.message || 'Unknown error';
      return res.redirect(
        `${clientUrl}/?error=${encodeURIComponent(error.toString())}`
      );
    }

    // If authentication is successful, continue with the successRedirect
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(`${clientUrl}/dashboard`);
    });
  })(req, res, next);
});

export default router;
