import { Profile, Strategy } from 'passport-discord';
import passport from 'passport';
import User from '../database/schema/User';

// Destructure environment variables
const {
  PROD_DISCORD_CLIENT_ID,
  PROD_DISCORD_CLIENT_SECRET,
  PROD_DISCORD_SERVER_URL,
  DEV_DISCORD_CLIENT_ID,
  DEV_DISCORD_CLIENT_SECRET,
  DEV_DISCORD_SERVER_URL,
} = process.env;

const strategyOptions: any = {};

// Set up strategy options based on environment
if (process.env.NODE_ENV === 'production') {
  if (
    !PROD_DISCORD_CLIENT_ID ||
    !PROD_DISCORD_CLIENT_SECRET ||
    !PROD_DISCORD_SERVER_URL
  ) {
    throw new Error(
      `[DISCORD STRATEGY]: Missing environment variables for production ${PROD_DISCORD_CLIENT_ID}|${PROD_DISCORD_CLIENT_SECRET}|${PROD_DISCORD_SERVER_URL}`
    );
  }

  strategyOptions.clientID = PROD_DISCORD_CLIENT_ID;
  strategyOptions.clientSecret = PROD_DISCORD_CLIENT_SECRET;
  strategyOptions.callbackURL = `${PROD_DISCORD_SERVER_URL}/api/auth/discord/callback`;
} else {
  if (
    !DEV_DISCORD_CLIENT_ID ||
    !DEV_DISCORD_CLIENT_SECRET ||
    !DEV_DISCORD_SERVER_URL
  ) {
    throw new Error(
      '[DISCORD STRATEGY]: Missing environment variables for development'
    );
  }

  strategyOptions.clientID = DEV_DISCORD_CLIENT_ID;
  strategyOptions.clientSecret = DEV_DISCORD_CLIENT_SECRET;
  strategyOptions.callbackURL = `${DEV_DISCORD_SERVER_URL}/api/auth/discord/callback`;
}
passport.use(
  new Strategy(strategyOptions, async function (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) {
    const { id: discordId } = profile;
    try {
      const existingUser = await User.findOne({ discordId });

      if (existingUser) {
        await User.updateOne(
          { discordId },
          {
            accessToken,
            refreshToken,
            username: profile.username,
            avatar: profile.avatar,
          },
          {
            new: true,
            upsert: true,
          }
        );
        // Call the 'done' function with the existing user
        done(null, existingUser);
      } else {
        // Call the 'done' function with the error and additional info
        done(null, undefined, {
          message: 'No user found with that Discord ID, No Access Granted',
          redirectUrl: `${process.env.CLIENT_URL}/dashboard?error=NOUSER`,
        });
      }
    } catch (error) {
      console.log(error);
      done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  return done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-refreshToken').lean().exec();

    return user ? done(null, user) : done(null, null);
  } catch (error) {
    console.log(error);
    return done(error, null);
  }
});
