import mongoose from "mongoose";
import { Channel } from "../entities/channel";
import { ChannelDocument, ChannelModel, Video ,Playlist, Shorts} from "../model/channelModel";
import { IChannelRepository } from "../providers/interfaces/IChannelRepository";
import { UserModel } from "../model/userModel";
import { ObjectId } from "mongodb";
import { CategoryModel } from "../model/categoryModel";

export class channelRepository implements IChannelRepository {
  


  async showChannels(): Promise<ChannelDocument[] | string> {

    try {
      const channels = await ChannelModel.find()
      if (!channels) {
        return "No channel found"
      }
      return channels
    } catch (error) {
      return "error"
    }
  }

  async getChannelById(channelId: string): Promise<ChannelDocument | null> {
    try {
      console.log("im in chac");

      const channel = await ChannelModel.findById(channelId);
    

      return channel;
    } catch (error) {
      console.error("Error in getChannelById repository:", error);
      return null;
    }
  }

  async getChannelData(userId: string): Promise<ChannelDocument | null> {
    try {
      const channel = await ChannelModel.findOne({ user: userId });
      return channel;
    } catch (error) {
      console.error("Error in getChannelData repository:", error);
      return null;
    }
  }

  async addSubscriber(channelId: string, userId: string): Promise<ChannelDocument | null> {
    const channel = await ChannelModel.findById(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    if (!channel.subscribers.includes(userId)) {
      channel.subscribers.push(userId);
      await channel.save();
    }
    return channel;
  }

  async isUserSubscribed(channelId: string, userId: string): Promise<boolean> {
    const channel = await ChannelModel.findById(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
    return channel.subscribers.includes(userId);
  }

  async removeSubscriber(channelId: string, userId: string): Promise<ChannelDocument | null> {
    try {
      const channel = await ChannelModel.findById(channelId);
      if (!channel) {
        throw new Error("Channel not found");
      }

      const subscriberIndex = channel.subscribers.indexOf(userId);
      if (subscriberIndex > -1) {
        channel.subscribers.splice(subscriberIndex, 1);
        await channel.save();
      }

      return channel;
    } catch (error) {
      console.error("Error in removeSubscriber repository:", error);
      throw error;
    }
  }

  async addSuperUserSubscription(
    channelId: string,
    userId: string,
    plan: 'weekly' | 'monthly',
    expiryDate: Date
  ): Promise<ChannelDocument | null> {
    console.log("Received params:", { channelId, userId, plan, expiryDate });
  
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      throw new Error(`Invalid channelId: ${channelId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }
    if (plan !== 'weekly' && plan !== 'monthly') {
      throw new Error(`Invalid plan: ${plan}`);
    }
    if (!(expiryDate instanceof Date)) {
      throw new Error(`Invalid expiryDate: ${expiryDate}`);
    }
  
    const channel = await ChannelModel.findById(channelId);
    if (!channel) {
      throw new Error(`Channel not found for id: ${channelId}`);
    }
    
  
    // Remove any existing subscription for this user
    channel.subscriptions = channel.subscriptions.filter(
      (sub) => sub.user.toString() !== userId
    );
  
    // Add the new subscription
    channel.subscriptions.push({
      user: new mongoose.Types.ObjectId(userId),
      plan: plan,
      expiryDate: expiryDate
    });
  
    await channel.save();
    
  
    return channel;
  }

  async updateChannelName(channelId: string, newName: string): Promise<ChannelDocument | boolean> {
    try {
      const channel = await ChannelModel.findById(channelId)
      if (!channel) {
        return false
      }
      console.log("updated onfe", channel);

      channel.channelName = newName

      await channel.save()
      console.log("updated one", channel);


      return channel
    } catch (error) {
      return false
    }
  }

 async updateProfilePic(channelId: string, fileUrl: string): Promise<ChannelDocument | null> {
  try {
    const channel = await ChannelModel.findById(channelId);
    console.log("Found channel:", channel);

    if (!channel) {
      return null;
    }

    channel.profilePic = fileUrl;
    console.log("Updated channel before save:", channel);

    const updatedChannel = await channel.save();
    console.log("Updated channel after save:", updatedChannel);

    return updatedChannel;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
}


 async startLive(channelId: string, link: string): Promise<ChannelDocument | boolean> {
  try {
    const channel = await ChannelModel.findById(channelId);
    console.log("Found channel:", channel);
    if (!channel) {
      return false;
    }

    channel.liveId = link;
    console.log("Updated channel before save:", channel.liveId);
    console.log("Updated channel before save:",link);

    console.log("Updated channel after save:",channel);
    await channel.save();

    return true;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
}
 async stopLive(channelId: string): Promise<ChannelDocument | boolean> {
  try {
    const channel = await ChannelModel.findById(channelId);
    console.log("Found channel:", channel);
    if (!channel) {
      return false;
    }

    channel.liveId = '';
    console.log("Updated channel before save:", channel.liveId);

    const updatedChannel = await channel.save();
    console.log("Updated channel after save:", updatedChannel);

    return true;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
}
async updateBanner(channelId: string, fileUrl: string): Promise<ChannelDocument | null> {
  try {
    const channel = await ChannelModel.findById(channelId);
    console.log("Found channel:", channel);

    if (!channel) {
      return null;
    }

    channel.banner = fileUrl;
    console.log("Updated channel before save:", channel);

    const updatedChannel = await channel.save();
    console.log("Updated channel after save:", updatedChannel);

    return updatedChannel;
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
}
  async saveVideo(videoData: any): Promise<any> {
    try {
      const channel = await ChannelModel.findById(videoData.channelId);

      if (!channel) {
        throw new Error("Channel not found");
      }

      const newVideo: Video = {
        url: videoData.url,
        category: videoData.category,
        views: 0,
        likes: [], // Initialize as empty array
        dislikes: [],
        comments: [],
        name: videoData.name,
        description: videoData.description,
        thumbnail: "", // You might want to generate a thumbnail
        isPrivate: false,
        isListed: true,
        createdAt: new Date(),
        toObject: function () {
          throw new Error("Function not implemented.");
        },
        _id: new ObjectId
      };

      channel.videos.push(newVideo);
      console.log("succssszzzzz", newVideo);

      await channel.save();

      return newVideo;
    } catch (error) {
      console.error("Error in saveVideo repository:", error);
      throw error;
    }
  }

  async updateVideo(videoId: string, title: string, description: string, category: string): Promise<Boolean> {
    try {
      console.log("Updating video:", videoId);
  
      const categoryDoc = await CategoryModel.findById(category);
      if (!categoryDoc) {
        console.log("Category not found");
        return false;
      }
  
      const result = await ChannelModel.findOneAndUpdate(
        { 'videos._id': videoId },
        {
          $set: {
            'videos.$.name': title,
            'videos.$.description': description,
            'videos.$.category': categoryDoc._id  // Use the category ID, not the name
          }
        },
        { new: true }
      );
  
      if (!result) {
        console.log(`Video with id ${videoId} not found`);
        return false;
      }
  
      console.log(`Video ${videoId} updated successfully`);
      console.log("Updated video data:", result.videos.find(v => v._id.toString() === videoId));
      return true;
    } catch (error) {
      console.error("Error in updateVideo repository:", error);
      return false;
    }
  }
  async getVideos(): Promise<Video[]> {
    try {
      const channels = await ChannelModel.find()
        .populate('user', 'username')
        .populate('videos.category', 'name');

      const allVideos = channels.flatMap(channel =>
        channel.videos.map(video => ({
          ...video.toObject(),
          channelName: channel.channelName,
          channelId: channel._id,
          userName: (channel.user as any).username
        }))
      );

      return allVideos.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error("Error in getVideos repository:", error);
      throw error;
    }
  }

  async getChannelVideos(channelId: string): Promise<Video[]> {
    try {
      const channel = await ChannelModel.findById(channelId)
        .populate('user', 'username')
        .populate('videos.category', 'name');

      if (!channel) {
        throw new Error('Channel not found');
      }

      return channel.videos.map(video => ({
        ...video.toObject(),
        channelName: channel.channelName,
        channelId: channel._id,
        userName: (channel.user as any).username
      })).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error("Error in getChannelVideos repository:", error);
      throw error;
    }
  }
  async getChannelShorts(channelId: string): Promise<Shorts[]> {
    try {
      const channel = await ChannelModel.findById(channelId)
        .populate('user', 'username')
        .populate('videos.category', 'name');

      if (!channel) {
        throw new Error('Channel not found');
      }

      return channel.shorts.map(video => ({
        ...video.toObject(),
        channelName: channel.channelName,
        channelId: channel._id,
        userName: (channel.user as any).username
      })).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error("Error in getChannelVideos repository:", error);
      throw error;
    }
  }

  async getChannelPlaylists(channelId: string): Promise<Playlist[]> {
    try {
      const channel = await ChannelModel.findById(channelId);
      if (!channel) {
        throw new Error('Channel not found');
      }
      console.log("listPlaylit",channel.playlists)
      return channel.playlists;

    } catch (error) {
      console.error("Error in getChannelPlaylists repository:", error);
      throw error;
    }
  }

  async listUnlist(videoId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': videoId });

      if (!channel) {
        throw new Error('Video not found');
      }

      const videoIndex = channel.videos.findIndex(video => video._id.toString() === videoId);
      if (videoIndex === -1) {
        throw new Error('Video not found in channel');
      }

      // Toggle the isListed status
      channel.videos[videoIndex].isListed = !channel.videos[videoIndex].isListed;

      console.log(`Video ${videoId} is now ${channel.videos[videoIndex].isListed ? 'listed' : 'unlisted'}`);

      await channel.save();
      return true;
    } catch (error) {
      console.error("Error in listUnlist repository:", error);
      throw error;
    }
  }
  async unlistList(videoId: string): Promise<boolean> {
    try {

      const channel = await ChannelModel.findOneAndUpdate(
        { 'videos._id': videoId },
        { $set: { 'videos.$.isListed': true } }, 
        { new: true }
      );

      if (!channel) {
        throw new Error('Video not found');
      }
      console.log("listed", channel);

      await channel.save()
      return true;
    } catch (error) {
      console.error("Error in listUnlist repository:", error);
      throw error;
    }
  }




}