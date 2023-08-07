import mongoose, { Document, Schema } from 'mongoose';

interface DiscordSettingsInt extends Document {
  _id: string;
  webhookURL: string;
  botName: string;
  identifier: string;
  isLivePostWebhook: boolean;
  isAnnouncementWebhook: boolean;
  isMemberOnlyWebhook: boolean;
}

const discordSettingsSchema: Schema = new Schema({
  webhookURL: { type: String, required: true },
  botName: { type: String, required: true },
  identifier: { type: String, required: true },
  isLivePostWebhook: { type: Boolean, required: true, default: false },
  isAnnouncementWebhook: { type: Boolean, required: true, default: false },
  isMemberOnlyWebhook: { type: Boolean, required: true, default: false },
});

const DiscordSettings = mongoose.model<DiscordSettingsInt>(
  'discord-settings',
  discordSettingsSchema
);

export default DiscordSettings;
