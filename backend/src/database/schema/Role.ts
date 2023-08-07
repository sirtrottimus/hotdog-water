//Discord Role Schema

import { Schema, model } from 'mongoose';
import { PermissionInt } from './Permission';

export interface RoleInt {
  _id: string;
  name: string;
  description: string;
  permissions: PermissionInt[];
  assignables: RoleInt[];
  color: string;
}

const RoleSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'permissions' }],
  assignables: [{ type: Schema.Types.ObjectId, ref: 'roles', required: false }],
  color: { type: String, required: true },
});

export default model<RoleInt>('roles', RoleSchema);
