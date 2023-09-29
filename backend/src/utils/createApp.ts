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

// Destructure environment variables
const { DEV_DISCORD_CLIENT_URL, PROD_DISCORD_CLIENT_URL, NODE_ENV } =
  process.env;

let clientUrl = '';
let cookie = {};

// Set client and server url based on environment
if (NODE_ENV === 'production') {
  if (!PROD_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for production');
  }

  clientUrl = PROD_DISCORD_CLIENT_URL!;
  cookie = {
    sameSite: 'strict',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: false,
    domain: '.hatfilms.co.uk',
  };
} else {
  if (!DEV_DISCORD_CLIENT_URL) {
    throw new Error('[SERVER]: Missing environment variables for development');
  }

  clientUrl = DEV_DISCORD_CLIENT_URL!;
  cookie = {
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: false,
    domain: 'localhost',
  };
}

/**
 * Creates an Express app with middleware and routes
 * @returns {express.Application} The Express app
 */
export const createApp = (): express.Application => {
  // Create Express app
  const app = express();

  app.set('port', process.env.PORT ?? 3002);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());

  // Enable CORS
  app.use(
    cors({
      origin: [clientUrl],
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
      // deepcode ignore WebCookieSecureDisabledExplicitly: <please specify a reason of ignoring this>
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
