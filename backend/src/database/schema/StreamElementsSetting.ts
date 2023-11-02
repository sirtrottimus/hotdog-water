import mongoose, { Document, Schema } from 'mongoose';

interface StreamElementsSettingsInt extends Document {
  _id: string;
  streamElementsYTToken: string;
  streamElementsYTChannelID: string;
  streamElementsTwitchToken: string;
  streamElementsTwitchChannelID: string;
}

const streamElementsSettingsSchema: Schema = new Schema({
  streamElementsToken: { type: String, required: true },
  streamElementsChannelID: { type: String, required: true },
  streamElementsTwitchToken: { type: String, required: true },
  streamElementsTwitchChannelID: { type: String, required: true },
});

const StreamElementsSettings = mongoose.model<StreamElementsSettingsInt>(
  'stream-elements-settings',
  streamElementsSettingsSchema
);

export default StreamElementsSettings;
