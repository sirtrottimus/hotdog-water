import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import store from 'connect-mongo';
import passport from 'passport';
import routes from '../routes';
import helmet from 'helmet';
import 'dotenv/config';

// require('../strategies/github'); // Uncomment when GitHub OAuth is implemented
import '../strategies/discord';
import { getEnv } from './helpers';

const { cookie, clientUrl } = getEnv();

/**
 * Creates an Express app with middleware and routes
 * @returns {express.Application} The Express app
 */
export const createApp = (): express.Application => {
  // Create Express app
  const app = express();

  app.set('port', process.env.PORT ?? 3002);
  app.set('trust proxy', 1);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());

  // Enable CORS
  app.use(
    cors({
      origin: [
        clientUrl,
        'http://localhost:5173',
        'https://schedule.hatfilms.co.uk',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Set up session
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie,
      store: store.create({ mongoUrl: process.env.MONGO_URI! }),
    })
  );

  //Enable Passport
  app.use(passport.initialize());
  app.use(passport.session());

  //Register Routes
  app.use('/api', routes);

  return app;
};
