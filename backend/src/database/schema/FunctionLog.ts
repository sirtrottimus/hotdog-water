import mongoose, { Document, Schema } from 'mongoose';

interface IFunctionLog extends Document {
  user: mongoose.Types.ObjectId;
  controller: string;
  functionName: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
  params: { [key: string]: any };
  data: { [key: string]: any };
}

const functionLogSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  controller: { type: String, required: true },
  functionName: { type: String, required: true },
  success: { type: Boolean, required: true },
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  params: { type: Object },
  data: { type: Object },
});

const FunctionLog = mongoose.model<IFunctionLog>(
  'FunctionLog',
  functionLogSchema
);

export default FunctionLog;
