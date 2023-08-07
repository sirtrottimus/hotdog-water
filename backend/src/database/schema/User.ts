import { Schema, model } from 'mongoose';
import { RoleInt } from './Role';

export interface UserInt {
  _id: string;
  discordId: string;
  accessToken?: string;
  username: string;
  roles: RoleInt[];
  avatar?: string;
}

const UserSchema = new Schema({
  discordId: { type: String, required: true },
  accessToken: { type: String },
  username: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
  avatar: { type: String },
});

export default model<UserInt>('users', UserSchema);
