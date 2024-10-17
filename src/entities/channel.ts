export class Channel {
  static findByIdAndUpdate(channelId: string, arg1: { profilePic: string; }, arg2: { new: boolean; }) {
    throw new Error("Method not implemented.");
  }
  constructor(
    public readonly user: string,
    public readonly channelName: string,
    public readonly subscribers: string[],
    public readonly profilePic: string,
    public readonly banner: string,
    public readonly subscriptions: string[],
    public readonly isRestricted: boolean,
    public readonly videos: Video[],
    public readonly _id?: string
  ) {}
}

export class Video {
  constructor(
    public readonly url: string,
    public readonly category: string,
    public readonly views: number,
    public readonly likes: number,
    public readonly name: string,
    public readonly description: string,
    public readonly thumbnail: string,
    public readonly isPrivate: boolean
  ) {}
}

export interface ChannelResponse {
  user: string;
  channelName: string;
  subscribers: string[];
  profilePic: string;
  banner: string;
  subscriptions: string[];
  isRestricted: boolean;
  videos: Video[];
  _id?: string;
}

export interface VideoResponse {
  url: string;
  category: string;
  views: number;
  likes: number;
  name: string;
  description: string;
  thumbnail: string;
  isPrivate: boolean;
}
