import mongoose, { Document, Schema } from 'mongoose';

interface JWTAuthInt extends Document {
  _id: string;
  createdAt: Date;
  read: boolean;
  status: 'active' | 'inactive';
  provider: 'twitch' | 'youtube';
}

const jwtAuthSchema: Schema = new Schema({
  createdAt: { type: Date, required: true },
  read: { type: Boolean, required: true, default: false },
  status: { type: String, required: true, default: 'active' },
  provider: { type: String, required: true },
});

const JWTAuth = mongoose.model<JWTAuthInt>('jwt-auth', jwtAuthSchema);

export default JWTAuth;
