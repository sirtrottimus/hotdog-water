import mongoose, { Document, Schema } from 'mongoose';

interface YoutubeSettingsInt extends Document {
  _id: string;
  youtubeClientID: string;
  youtubeClientSecret: string;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  youtubeTokenExpires?: Date;
}

const youtubeSettingsSchema: Schema = new Schema({
  youtubeClientID: { type: String, required: true },
  youtubeClientSecret: { type: String, required: true },
  youtubeAccessToken: { type: String },
  youtubeRefreshToken: { type: String },
  youtubeTokenExpires: { type: Date },
});

const YoutubeSettings = mongoose.model<YoutubeSettingsInt>(
  'youtube-settings',
  youtubeSettingsSchema
);

export default YoutubeSettings;
