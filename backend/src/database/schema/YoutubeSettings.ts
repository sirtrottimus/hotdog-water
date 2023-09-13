import mongoose, { Document, Schema } from 'mongoose';

interface YoutubeSettingsInt extends Document {
  _id: string;
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

const youtubeSettingsSchema: Schema = new Schema({
  consumerKey: { type: String, required: true },
  consumerSecret: { type: String, required: true },
  accessToken: { type: String, required: true },
  accessTokenSecret: { type: String, required: true },
});

const YoutubeSettings = mongoose.model<YoutubeSettingsInt>(
  'youtube-settings',
  youtubeSettingsSchema
);

export default YoutubeSettings;
