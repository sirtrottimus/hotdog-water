import mongoose, { Document, Schema } from 'mongoose';

interface TwitchSettingsInt extends Document {
  _id: string;
  twitchClientID: string;
  twitchClientSecret: string;
  twitchUsername: string;
  twitchAccessToken?: string;
  twitchRefreshToken?: string;
  twitchTokenExpires?: Date;
}

const twitchSettingsSchema: Schema = new Schema({
  twitchClientID: { type: String, required: true },
  twitchClientSecret: { type: String, required: true },
  twitchUsername: { type: String, required: true },
  twitchAccessToken: { type: String },
  twitchRefreshToken: { type: String },
  twitchTokenExpires: { type: Date },
});

const TwitchSettings = mongoose.model<TwitchSettingsInt>(
  'twitch-settings',
  twitchSettingsSchema
);

export default TwitchSettings;
