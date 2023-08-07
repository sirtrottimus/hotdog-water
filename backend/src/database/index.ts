import mongoose, { ConnectOptions } from 'mongoose';
import { populateDatabase } from '../utils/helpers';

// This is a workaround for updates coming to Mongoose 7.0.0
mongoose.set('strictQuery', false);

const dbName = process.env.NODE_ENV === 'production' ? 'prod' : 'test';

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    appName: 'VikingPMC',
    dbName: dbName,
  } as ConnectOptions)
  .then(() => {
    return populateDatabase();
  })
  .then(() => {
    console.log(
      `[DATABASE]: Connected to MongoDB [OK] DB: ${dbName} | MongoVersion: ${mongoose.version}`
    );
  })
  .catch((err) => {
    console.log('[DATABASE]:', err);
  });
