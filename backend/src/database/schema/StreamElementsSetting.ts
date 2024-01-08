import mongoose, { Document, Schema } from 'mongoose';

interface StreamElementsSettingsInt extends Document {
  _id: string;
  streamElementsYTToken: string;
  streamElementsYTChannelID: string;
  streamElementsTwitchToken: string;
  streamElementsTwitchChannelID: string;
  streamElementsTwitchFilters: string[];
  streamElementsYTFilters: string[];
}

const streamElementsSettingsSchema: Schema = new Schema({
  streamElementsYTToken: { type: String, required: true },
  streamElementsYTChannelID: { type: String, required: true },
  streamElementsTwitchToken: { type: String, required: true },
  streamElementsTwitchChannelID: { type: String, required: true },
  streamElementsTwitchFilters: { type: [String], required: true },
  streamElementsYTFilters: { type: [String], required: true },
});

const StreamElementsSettings = mongoose.model<StreamElementsSettingsInt>(
  'stream-elements-settings',
  streamElementsSettingsSchema
);

export default StreamElementsSettings;
