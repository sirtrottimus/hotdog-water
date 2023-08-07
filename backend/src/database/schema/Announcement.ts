import mongoose, { Document, Schema } from 'mongoose';

export type AnnouncementType = 'public' | 'membersOnly';

interface AnnouncementInt extends Document {
  _id: string;
  announcementType: AnnouncementType;
  text: string;
  postTo: string[];
  postedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema: Schema = new Schema(
  {
    announcementType: { type: String, required: true },
    text: { type: String, required: true },
    postTo: { type: [String], required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'users' },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model<AnnouncementInt>(
  'announcements',
  announcementSchema
);

export default Announcement;
