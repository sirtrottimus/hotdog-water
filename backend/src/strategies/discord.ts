import { Profile, Strategy } from 'passport-discord';
import passport from 'passport';
import User from '../database/schema/User';
import { getEnv } from '../utils/helpers';

const { serverUrl, clientUrl, clientID, clientSecret } = getEnv();
const strategyOptions: any = {
  clientID,
  clientSecret,
  callbackURL: `${serverUrl}/api/auth/discord/callback`,
};
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
        done(null, existingUser);
      } else {
        // Call the 'done' function with the error and additional info
        done(null, undefined, {
          message: 'No user found with that Discord ID, No Access Granted',
          redirectUrl: `${clientUrl}/dashboard?error=NOUSER`,
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
