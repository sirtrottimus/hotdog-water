import { Router } from 'express';

import passport from 'passport';
import jwt from 'jsonwebtoken';
import { getEnv } from '../../utils/helpers';

const { cookie, clientUrl } = getEnv();
const router = Router();

// Route for authenticating with Discord
router.get(
  '/',
  passport.authenticate('discord', {
    scope: ['identify', 'guilds', 'guilds.members.read'],
  })
);

// Route for handling the callback from Discord
router.get('/callback', (req, res, next) => {
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

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.SESSION_SECRET!
    );

    res.cookie('token', token, cookie);

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
