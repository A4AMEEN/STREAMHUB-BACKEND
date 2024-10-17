import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { UserDocument } from './userModel';
import { CategoryDocument } from './categoryModel'; // Ensure this is the correct path to your category model

// Define the structure of a comment directly within the Video interface
export interface Comment {
  user: UserDocument['_id'];
  comment: string;
  createdAt: Date;
  isPinned:false;
  likes:UserDocument['_id'][]
}

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
  createdAt: Date;
}
export interface Shorts {
  _id: mongoose.Types.ObjectId;
  toObject(): any;
  url: string;
  category: mongoose.Types.ObjectId;
    views: number;
  likes: UserDocument['_id'][]; 
  dislikes: UserDocument['_id'][]; 
  name: string; 
  thumbnail: string;
  isPrivate: boolean;
  isListed: boolean;
  comments: Comment[];
  createdAt: Date;
}
export interface ChannelDocument extends Document {
  _id: mongoose.Types.ObjectId;
  user: UserDocument['_id'];
  channelName: string;
  subscribers: UserDocument['_id'][];
  profilePic: string;
  banner: string;
  subscriptions: {
    user: mongoose.Types.ObjectId;
    plan: 'weekly' | 'monthly';
    expiryDate: Date;
  }[];
  isRestricted: boolean;
  liveId:string;
  videos: Video[];
  shorts: Shorts[];
  playlists: Playlist[];
  watchHistory: mongoose.Types.ObjectId[]; 
}
export interface Playlist {
  toObject(): any;
  _id: mongoose.Types.ObjectId;
  thumbnail:string,
  name: string;
  description: string;
  videos: mongoose.Types.ObjectId[];
  createdAt: Date;
  isPublic: boolean;
  category: mongoose.Types.ObjectId;
  channelName?: string;
}


// Update the Video schema
const VideoSchema: Schema = new Schema({
  url: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  views: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dislikes:[{ type: Schema.Types.ObjectId, ref: 'User' }],
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
  createdAt: { type: Date, default: Date.now }
});
const ShortsSchema: Schema = new Schema({
  url: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  views: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dislikes:[{ type: Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true },
  thumbnail: { type: String },
  isPrivate: { type: Boolean, default: false },
  isListed: { type: Boolean, default: true },
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    isPinned: { type: Boolean, default:false },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],                                                                                                                                     
  createdAt: { type: Date, default: Date.now }
});

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
export interface ShortsDocument extends Document {
  url: string;
  category: CategoryDocument['_id'];
  views: number;
  likes: UserDocument['_id'][];
  dislikes: UserDocument['_id'][];
  name: string;
  thumbnail: string;
  isPrivate: boolean;
  isListed: boolean;
  comments: {
    user: UserDocument['_id'];
    comment: string;
    createdAt: Date;
  }[];
}

const PlaylistSchema = new mongoose.Schema({
  name: String,
  description: String,
  isPublic: Boolean,
  thumbnail: String,
  videos: [VideoSchema],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  createdAt: { type: Date, default: Date.now }
});



// Update the Channel schema
const ChannelSchema: Schema<ChannelDocument> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  channelName: { type: String, required: true },
  subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  profilePic: { type: String },
  banner: { type: String },
  subscriptions: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    plan: { type: String, enum: ['weekly', 'monthly'] },
    expiryDate: { type: Date }
  }],
  isRestricted: { type: Boolean, default: false },
  liveId: { type:String },
  videos: { type: [VideoSchema], default: [] } ,
  shorts: { type: [ShortsSchema], default: [] } ,
  watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  playlists: [{ // Add this block
    thumbnail: { type: String},
    name: { type: String},
    description: { type: String },
    videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    createdAt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category'},

  }]
});
export const VideoModel = mongoose.model<VideoDocument>('Video', VideoSchema);
export const ShortsModel = mongoose.model<VideoDocument>('Shorts', ShortsSchema);
export const ChannelModel = mongoose.model<ChannelDocument>('Channel', ChannelSchema);
