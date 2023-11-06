import mongoose, { Document, Schema } from 'mongoose';

type DataInt = {
  username: string;
  amount: number;
  message?: string;
  tier: string;
  avatar: string;
};

type ActivityTypeInt =
  | 'follow'
  | 'tip'
  | 'sponsor'
  | 'superchat'
  | 'host'
  | 'raid'
  | 'subscriber'
  | 'cheer'
  | 'redemption'
  | 'merch';
interface ActivityInt extends Document {
  _id: string;
  type: ActivityTypeInt;
  Data: DataInt;
  createdAt: Date;
  SE_ID: string;
  flagged: boolean;
  read: boolean;
  feedSource: 'schedule' | 'websocket' | 'manual';
  provider: 'twitch' | 'youtube';
}

const activitySchema: Schema = new Schema({
  type: { type: String, required: true },
  data: { type: Object, required: true },
  feedSource: { type: String, required: true },
  SE_ID: { type: String, required: true },
  createdAt: { type: Date, required: true },
  flagged: { type: Boolean, required: true },
  read: { type: Boolean, required: true, default: false },
  provider: { type: String, required: true },
});

const Activity = mongoose.model<ActivityInt>('activities', activitySchema);

export default Activity;
