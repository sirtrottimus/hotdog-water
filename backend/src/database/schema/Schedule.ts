// Schedule schema

import { model, Schema } from 'mongoose';

export interface ScheduleInt {
  _id: string;
  title: string;
  date?: Date | null;
  description: string;
  type: 'stream' | 'event' | 'video' | 'announcement' | 'bored' | 'podcast';
  startTime: string;
  endTime?: string;
  link?: string;
  isRecurring: boolean;
  recurringDays?: string[];
  overridesRecurring?: boolean;
  membersOnly?: boolean;
}

const ScheduleSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: false },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['stream', 'event', 'video', 'announcement', 'bored', 'podcast'],
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: false },
  link: { type: String, required: false },
  isRecurring: { type: Boolean, required: true },
  recurringDays: [{ type: String, required: false }],
  overridesRecurring: { type: Boolean, required: false },
  membersOnly: { type: Boolean, required: false },
});

export default model<ScheduleInt>('schedules', ScheduleSchema);
