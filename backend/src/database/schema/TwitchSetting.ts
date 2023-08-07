import mongoose, { Document, Schema } from 'mongoose';

interface TwitchSettingsInt extends Document {
  _id: string;
  twitchClientID: string;
  twitchClientSecret: string;
  twitchUsername: string;
}

const twitchSettingsSchema: Schema = new Schema({
  twitchClientID: { type: String, required: true },
  twitchClientSecret: { type: String, required: true },
  twitchUsername: { type: String, required: true },
});

const TwitchSettings = mongoose.model<TwitchSettingsInt>(
  'twitch-settings',
  twitchSettingsSchema
);

export default TwitchSettings;
