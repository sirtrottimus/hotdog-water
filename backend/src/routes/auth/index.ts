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
import youtubeRouter from './youtube';
import twitchRouter from './twitch';
import discordRouter from './discord';

// Create router
const router = Router();

router.use('/youtube', youtubeRouter);
router.use('/twitch', twitchRouter);
router.use('/discord', discordRouter);

export default router;
