// Permissions Schema

import { Schema, model } from 'mongoose';
import { RoleInt } from './Role';

export interface PermissionInt {
  _id: string;
  name: string;
  description?: string;
  roles: RoleInt[];
}

const PermissionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
});

export default model<PermissionInt>('permissions', PermissionSchema);
