// videoModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { UserDocument } from './userModel';
import { CategoryDocument } from './categoryModel';

export interface VideoDocument extends Document {
  url: string;
  category: CategoryDocument['_id'];
  views: number;
  likes: UserDocument['_id'][];
  dislikes: UserDocument['_id'][];
  name: string;
  description: string;
  thumbnail: string;
  isPrivate: boolean;
  isListed: boolean;
  comments: {
    user: UserDocument['_id'];
    comment: string;
    createdAt: Date;
  }[];
}

const VideoSchema: Schema = new Schema({
  url: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  views: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  isPrivate: { type: Boolean, default: false },
  isListed: { type: Boolean, default: true },
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
});

export interface Video {
    _id: mongoose.Types.ObjectId;
    toObject(): any;
    url: string;
    category: mongoose.Types.ObjectId;
      views: number;
    likes: UserDocument['_id'][]; 
    dislikes: UserDocument['_id'][]; 
    name: string;
    description: string;
    thumbnail: string;
    isPrivate: boolean;
    isListed: boolean;
    comments: Comment[];
  }

export const VideoModel = mongoose.model<VideoDocument>('Video', VideoSchema);