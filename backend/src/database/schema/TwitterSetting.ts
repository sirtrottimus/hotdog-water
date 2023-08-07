import mongoose, { Document, Schema } from 'mongoose';

interface TwitterSettingsInt extends Document {
  _id: string;
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

const twitterSettingsSchema: Schema = new Schema({
  consumerKey: { type: String, required: true },
  consumerSecret: { type: String, required: true },
  accessToken: { type: String, required: true },
  accessTokenSecret: { type: String, required: true },
});

const TwitterSettings = mongoose.model<TwitterSettingsInt>(
  'twitter-settings',
  twitterSettingsSchema
);

export default TwitterSettings;
