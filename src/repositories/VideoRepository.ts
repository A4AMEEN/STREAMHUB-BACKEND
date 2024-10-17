import mongoose from "mongoose";
import { ChannelDocument, ChannelModel, Playlist, Shorts, Video } from "../model/channelModel";
import { IVideoRepository } from "../providers/interfaces/IVideoRepositry";
import { CategoryModel } from "../model/categoryModel";
import { ObjectId } from "mongodb";


export class VideoRepository implements IVideoRepository {

  async saveVideo(videoData: any): Promise<any> {
    try {
      const channel = await ChannelModel.findById(videoData.channelId);

      if (!channel) {
        throw new Error("Channel not found");
      }

      const newVideo: Video = {
        url: videoData.url,
        category: new ObjectId(videoData.category),
        views: 0,
        likes: [],
        dislikes: [],
        comments: [],
        name: videoData.name,
        description: videoData.description,
        thumbnail: "",
        isPrivate: false,
        isListed: true,
        createdAt: new Date(),
        toObject: function () {
          return this;
        },
        _id: new ObjectId()
      };

      // Clean up existing videos
      channel.videos = channel.videos.map(video => ({
        ...video,
        likes: Array.isArray(video.likes) ? video.likes : [],
        dislikes: Array.isArray(video.dislikes) ? video.dislikes : []
      }));

      channel.videos.push(newVideo);
      //console.log("Before saving:", JSON.stringify(newVideo, null, 2));

      //console.log("Channel before save:", JSON.stringify(channel, null, 2));
      
      try {
        await channel.save();
      } catch (saveError) {
        console.error("Error saving channel:", saveError);
        throw saveError;
      }

      //console.log("After saving:", JSON.stringify(newVideo, null, 2));

      return newVideo;
    } catch (error) {
      console.error("Error in saveVideo repository:", error);
      throw error;
    }
  }
  async saveShort(videoData: any): Promise<any> {
    try {
      const channel = await ChannelModel.findById(videoData.channelId);

      if (!channel) {
        throw new Error("Channel not found");
      }

      const newVideo: Shorts = {
        url: videoData.url,
        category: new ObjectId(videoData.category),
        views: 0,
        likes: [],
        dislikes: [],
        comments: [],
        name: videoData.name,
        thumbnail: "",
        isPrivate: false,
        isListed: true,
        createdAt: new Date(),
        toObject: function () {
          return this;
        },
        _id: new ObjectId()
      };

      // Clean up existing videos
      channel.shorts = channel.shorts.map(video => ({
        ...video,
        likes: Array.isArray(video.likes) ? video.likes : [],
        dislikes: Array.isArray(video.dislikes) ? video.dislikes : []
      }));

      channel.shorts.push(newVideo);
      
      //console.log("Channel before save:", JSON.stringify(channel, null, 2));
      
      await channel.save();
      
      //console.log("Before saving:",  channel.shorts);

      //console.log("After saving:", JSON.stringify(newVideo, null, 2));

      return newVideo;
    } catch (error) {
      console.error("Error in saveVideo repository:", error);
      throw error;
    }
  }

    async saveVideoToPlaylist(videoData: any): Promise<any> {
      try {
          const channel = await ChannelModel.findById(videoData.channelId);

          if (!channel) {
              throw new Error("Channel not found");
          }

          const playlist = channel.playlists.find(v => v._id.toString() ===  videoData.playlistId);
          //console.log("Before saving: got playlist",playlist);


          if (!playlist) {
              throw new Error("Playlist not found");
          }

          const newVideo: Video = {
              url: videoData.url,
              category: new ObjectId(playlist.category),
              views: 0,
              likes: [],
              dislikes: [],
              comments: [],
              name: videoData.name,
              description: videoData.description,
              thumbnail: "",
              isPrivate: playlist.isPublic,
              isListed: true,
              createdAt: new Date(),
              toObject: function () {
                  return this;
              },
              _id: new ObjectId()
          };

          // Add the video to the channel's videos array
          channel.videos.push(newVideo);

          // Add the video reference to the playlist
          playlist.videos.push(newVideo._id);

          //console.log("Before saving:",playlist.videos);
          await channel.save()
          .then(x=>{console.log('inseted',x)}).catch(e=>{console.log('not inseted',e);})


          return newVideo;
      } catch (error) {
          console.error("Error in saveVideoToPlaylist repository:", error);
          throw error;
      }
  }

async getPlaylistVideos(playlistId: string, channelId: string): Promise<Video[]> {
  try {
    // Step 1: Find the channel by its ID
    const channel = await ChannelModel.findById(channelId);
    console.log("channelId",channelId);
    console.log("playlistId",playlistId);
    


    if (!channel) {
      throw new Error("Channel not found");
    }

    // Step 2: Find the specific playlist by its ID within the channel
    const playlist = channel.playlists.find(p => p._id.toString() === playlistId);
      console.log("has the pallyist",playlist);
      
    if (!playlist) {
      throw new Error("Playlist not found");
    }

    // Step 3: Use Promise.all to fetch all video details concurrently
    const videos = await Promise.all(playlist.videos.map(async (videoId: mongoose.Types.ObjectId) => {
      // Find the channel that contains the video by its ID
      const videoChannel = await ChannelModel.findOne(
        { 'videos._id': videoId },
        { 'videos.$': 1 }
      ).lean();

      if (!videoChannel || !videoChannel.videos || videoChannel.videos.length === 0) {
        console.log(`Video not found for ID: ${videoId}`);
        return null;
      }

      const video = videoChannel.videos[0];
      return {
        _id: video._id,
        title: video.name,
        url: video.url,
        thumbnail: video.thumbnail,
        views: video.views,
        likes: video.likes,
        dislikes: video.dislikes,
        category: video.category,
        channelId: videoChannel._id,
        createdAt:video.createdAt
      } as any;
    }));

    // Step 4: Filter out any null values (videos that weren't found)
    const filteredVideos = videos.filter(item => item !== null) as Video[];
    console.log("pallisting",filteredVideos);
    

    return filteredVideos;
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    throw error;
  }
}

async getAllPlaylists(): Promise<Playlist[]> {
  try {
    const channels = await ChannelModel.find().populate('playlists');
    return channels.flatMap(channel => 
      channel.playlists.map(playlist => ({
        ...playlist.toObject(),
        channelName: channel.channelName, // Add the channel name to each playlist
        channelId: channel._id // Add the channel ID to each playlist
      }))
    );
  }catch (error) {
    console.error("Error in getAllPlaylists repository:", error);
    throw error;
  }
}
async updatePlaylist(playlistId: string, updateData: any): Promise<Playlist> {
  try {
    const channel = await ChannelModel.findOne({ "playlists._id": playlistId });

    if (!channel) {
      throw new Error("Playlist not found");
    }

    const playlistIndex = channel.playlists.findIndex(
      (playlist) => playlist._id.toString() === playlistId
    );

    if (playlistIndex === -1) {
      throw new Error("Playlist not found in channel");
    }

    // Update the playlist
    Object.assign(channel.playlists[playlistIndex], updateData);

    await channel.save();
    console.log("updated the playlist",channel.playlists)

    return channel.playlists[playlistIndex];
  } catch (error) {
    console.error("Error in updatePlaylist repository:", error);
    throw error;
  }
}

async deletePlaylist(playlistId: string): Promise<void> {
  try {
    const channel = await ChannelModel.findOne({ "playlists._id": playlistId });

    if (!channel) {
      throw new Error("Playlist not found");
    }

    const playlistToDelete = channel.playlists.find(
      (playlist) => playlist._id.toString() === playlistId
    );

    if (!playlistToDelete) {
      throw new Error("Playlist not found in channel");
    }

    // Get the video IDs from the playlist
    const videoIdsToDelete = playlistToDelete.videos;

   
    channel.playlists = channel.playlists.filter(
      (playlist) => playlist._id.toString() !== playlistId
    );


    channel.videos = channel.videos.filter((video) => {
      const videoId = video._id.toString();
      const isInDeletedPlaylist = videoIdsToDelete.some(id => id.toString() === videoId);
      const isInOtherPlaylists = channel.playlists.some(playlist => 
        playlist.videos.some(id => id.toString() === videoId)
      );

    
      return !isInDeletedPlaylist || isInOtherPlaylists;
    });

    await channel.save();

    console.log(`Playlist ${playlistId} and its exclusive videos have been deleted.`);
  } catch (error) {
    console.error("Error in deletePlaylist repository:", error);
    throw error;
  }
}

async togglePlaylistVisibility(playlistId: string): Promise<Playlist> {
  try {
    const channel = await ChannelModel.findOne({ "playlists._id": playlistId });

    if (!channel) {
      throw new Error("Playlist not found");
    }

    const playlist = channel.playlists.find(p => p._id.toString() === playlistId);

    if (!playlist) {
      throw new Error("Playlist not found in channel");
    }

    // Toggle the playlist's visibility
    playlist.isPublic = !playlist.isPublic;

    // Update the visibility of all videos in the playlist
    channel.videos = channel.videos.map(video => {
      if (playlist.videos.some(v => v.toString() === video._id.toString())) {
        video.isPrivate = !playlist.isPublic;
      }
      return video;
    });

    await channel.save();

    return playlist;
  } catch (error) {
    console.error("Error in togglePlaylistVisibility repository:", error);
    throw error;
  }
}

async savePlaylist(playlistData: any): Promise<Playlist> {
  try {
    const channel = await ChannelModel.findById(playlistData.channelId);

    if (!channel) {
      throw new Error("Channel not found");
    }

    const newPlaylist: Playlist = {
      _id: new ObjectId(),
      name: playlistData.name,
      description: playlistData.description,
      isPublic: playlistData.isPublic,
      thumbnail: playlistData.thumbnail,
      videos: [],
      category: new ObjectId(playlistData.category),
      createdAt: new Date(),
      toObject: function () {
        throw new Error("Function not implemented.");
      }
    };

    channel.playlists.push(newPlaylist);
    console.log(`plalist has beenm created `,newPlaylist);

    await channel.save();

    return newPlaylist;
  } catch (error) {
    console.error("Error in savePlaylist repository:", error);
    throw error;
  }
}

  async findVideo(videoId: string): Promise<Video | null> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': videoId });
  
      if (!channel) {
        console.log(`Video with id ${videoId} not found`);
        return null;
      }
  

      // Find the specific video with the matching ID
      const video = channel.videos.find(v => v._id.toString() === videoId);
  
      if (!video) {
        console.log(`Video with id ${videoId} not found in the channel`);
        return null;
      }
  
      console.log("Found video:", video);
      return video;
    }
    catch (error) {
      console.error("Error in findVideo repository:", error);
      return null;
    }
  }

  async getRecommendedVideos(categoryId: string): Promise<Video[]> {
    try {
      console.log("Category ID in repository:", categoryId);
      
      // Convert categoryId to ObjectId
      const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
  
      const channels = await ChannelModel.find({ 'videos.category': categoryObjectId })
        .populate('user', 'username')
        .populate('videos.category', 'name');
      
      console.log("Found channels:", channels.length);
  
      let recommendedVideos = channels.flatMap(channel =>
        channel.videos
          .filter(video => {
            console.log("Video category:", video.category, "Comparing with:", categoryObjectId);
            return video.category.equals(categoryObjectId);
          })
          .map(video => ({
            ...video.toObject(),
            channelName: channel.channelName,
            profilePic: channel.profilePic,
            channelId: channel._id,
            userName: (channel.user as any).username
          }))
      );
  
      console.log("Recommended videos before shuffle:", recommendedVideos.length);
  
      // Shuffle the array to get random recommendations
      recommendedVideos = recommendedVideos.sort(() => 0.5 - Math.random());
  
      // Limit to 10 recommendations
      return recommendedVideos.slice(0, 10);
    } catch (error) {
      console.error("Error in getRecommendedVideos repository:", error);
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

      //console.log(`Video ${videoId} updated successfully`);
      //console.log("Updated video data:", result.videos.find(v => v._id.toString() === videoId));
      return true;
    } catch (error) {
      console.error("Error in updateVideo repository:", error);
      return false;
    }
  }
  async updateShorts(videoId: string, title: string, category: string): Promise<Boolean> {
    try {
      //console.log("Updating shorts:", videoId);
  
      const categoryDoc = await CategoryModel.findById(category);
      if (!categoryDoc) {
        //console.log("Category not found");
        return false;
      }
  
      const result = await ChannelModel.findOneAndUpdate(
        { 'shorts._id': videoId },
        {
          $set: {
            'shorts.$[short].name': title,
            'shorts.$[short].category': categoryDoc._id
          }
        },
        {
          arrayFilters: [{ 'short._id': videoId }],
          new: true
        }
      );
  
      if (!result) {
        //console.log(`Shorts with id ${videoId} not found`);
        return false;
      }
  
      const updatedShort = result.shorts.find(s => s._id.toString() === videoId);
      //console.log(`Shorts ${videoId} updated successfully`);
      //console.log("Updated shorts data:", updatedShort);
      return true;
    } catch (error) {
      console.error("Error in updateShorts repository:", error);
      return false;
    }
  }

  async deleteVideo(videoId: string): Promise<Boolean> {
    try {
      const result = await ChannelModel.findOneAndUpdate(
        { 'videos._id': videoId },
        {
          $pull: {
            videos: { _id: videoId },
            'playlists.$[].videos': videoId
          }
        },
        { new: true }
      );
  
      if (!result) {
        console.log(`Video with id ${videoId} not found`);
        return false;
      }
  
      console.log(`Video ${videoId} deleted successfully from videos and playlists`);
      return true;
    } catch (error) {
      console.error("Error in deleteVideo repository:", error);
      return false;
    }
  }
  async deleteShort(shortsId: string): Promise<Boolean> {
    try {
      //console.log("Deleting video:", shortsId);

      const result = await ChannelModel.findOneAndUpdate(
        { 'shorts._id': shortsId },
        { $pull: { videos: { _id: shortsId } } },
        { new: true }
      );

      if (!result) {
        //console.log(`Video with id ${shortsId} not found`);
        return false;
      }

      //console.log(`Video ${shortsId} deleted successfully`);
      return true;
    } catch (error) {
      console.error("Error in deleteVideo repository:", error);
      return false;
    }
  }
  async getVideos(userId?: string): Promise<Video[]> {
    try {
        const channels = await ChannelModel.find()
            .populate('user', 'username')
            .populate('videos.category', 'name');

        const allVideos = await Promise.all(channels.map(async channel => {
            const isPremiumSubscriber = userId 
                ? await this.isUserPremiumSubscriber(userId, channel._id.toString())
                : false;
            //console.log(`Channel: ${channel.channelName}, User: ${userId}, isPremiumSubscriber: ${isPremiumSubscriber}`);
            return channel.videos.map(video => ({
                ...video.toObject(),
                channelName: channel.channelName,
                profilePic: channel.profilePic,
                channelId: channel._id,
                userName: (channel.user as any).username,
                isPremiumSubscriber
            }));
        }));

        //console.log("All videos:", JSON.stringify(allVideos, null, 2));

        return allVideos.flat().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error("Error in getVideos repository:", error);
        throw error;
    }
}
async isUserPremiumSubscriber(userId: string, channelId: string): Promise<boolean> {
  try {
      const channel = await ChannelModel.findById(channelId);
      if (!channel) {
          return false;
      }

      const subscription = channel.subscriptions.find(sub => 
          sub.user.toString() === userId && 
          sub.expiryDate > new Date()
      );

      return !!subscription;
  } catch (error) {
      console.error("Error in isUserPremiumSubscriber:", error);
      return false;
  }
}
  async getShorts(): Promise<Shorts[]> {
    try {
      const channels = await ChannelModel.find()
        .populate('user', 'username')
        .populate('videos.category', 'name');

      const allVideos = channels.flatMap(channel =>
        channel.shorts.map(video => ({
          ...video.toObject(),
          channelName: channel.channelName,
          profilePic: channel.profilePic,
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

      //console.log(`Video ${videoId} is now ${channel.videos[videoIndex].isListed ? 'listed' : 'unlisted'}`);

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
    

      await channel.save()
      return true;
    } catch (error) {
      console.error("Error in listUnlist repository:", error);
      throw error;
    }
  }

  async likeVideo(videoId: string, userId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': new ObjectId(videoId) });
      if (!channel) {
       
        return false;
      }

      const video = channel.videos.find(video => video._id.toString() === videoId);

      if (!video) {
       
        return false;
      }

      const userObjectId = new ObjectId(userId);

      // Explicitly type the dislikes array and use type assertion
      video.dislikes = (video.dislikes as mongoose.Types.ObjectId[]).filter(
        (id) => !id.equals(userObjectId)
      );

      // Check if the user has already liked the video
      const userLiked = (video.likes as mongoose.Types.ObjectId[]).some(
        (id) => id.equals(userObjectId)
      );

      if (!userLiked) {
        video.likes.push(userObjectId);
      }

      channel.markModified('videos');
      await channel.save();
      return true;
    } catch (error) {
      console.error("Error in likeVideo repository:", error);
      throw error;
    }
  }

  async getLikeStatus(videoId: string, userId: string): Promise<{ isLiked: boolean, isDisliked: boolean, likeCount: number, dislikeCount: number }> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': new ObjectId(videoId) });
      
      if (!channel) {
         
        throw new Error('Video not found');
      }
  
      const video = channel.videos.find(video => video._id.toString() === videoId);
      if (!video) {
        console.error(`Video not found in channel for video ID: ${videoId}`);
        throw new Error('Video not found');
      }
      //console.log("`Channel not found for video ID: ${videoId}`",video);
  
      const userObjectId = new ObjectId(userId);
  
      const isLiked = (video.likes as mongoose.Types.ObjectId[]).some(
        (id) => id.equals(userObjectId)
      );
  
      const isDisliked = (video.dislikes as mongoose.Types.ObjectId[]).some(
        (id) => id.equals(userObjectId)
      );
  
      const likeCount = (video.likes as mongoose.Types.ObjectId[]).length;
      const dislikeCount = (video.dislikes as mongoose.Types.ObjectId[]).length;
   
  
      return {
        isLiked,
        isDisliked,
        likeCount,
        dislikeCount
      };
    } catch (error) {
      console.error("Error in getLikeStatus repository:", error);
      throw error;
    }
  }

  async unlikeVideo(videoId: string, userId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': new ObjectId(videoId) });
      //console.log("`Channel not found for video ID: ${videoId}`",channel);
      if (!channel) {
         
        return false;
      }
  
      const video = channel.videos.find(video => video._id.toString() === videoId);
      if (!video) {
        console.error(`Video not found in channel for video ID: ${videoId}`);
        return false;
      }
  
      const userObjectId = new ObjectId(userId);
  
      // Remove the user's ID from the likes array
      video.likes = (video.likes as mongoose.Types.ObjectId[]).filter(
        (id) => !id.equals(userObjectId)
      );
  
      channel.markModified('videos');
      await channel.save();
      return true;
    } catch (error) {
      console.error("Error in unlikeVideo repository:", error);
      throw error;
    }
  }

  async addToWatchHistory(videoId: string, userId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ user: new ObjectId(userId) });
  
      if (!channel) {
        console.error(`Channel not found for user ID: ${userId}`);
        return false;
      }
  
      const videoObjectId = new ObjectId(videoId);
  
      // Check if the video exists
      const videoChannel = await ChannelModel.findOne({ 'videos._id': videoObjectId });
      if (!videoChannel) {
        console.error(`Video not found for video ID: ${videoId}`);
        return false;
      }
  
      // Check if the video is already in the history and remove it
      channel.watchHistory = channel.watchHistory.filter(id => !id.equals(videoObjectId));
  
      // Add the video to the beginning of the history
      channel.watchHistory.unshift(videoObjectId);
  
      // Limit history to 100 items
      if (channel.watchHistory.length > 100) {
        channel.watchHistory = channel.watchHistory.slice(0, 100);
      }
  
      await channel.save();
  
    
  
      return true;
    } catch (error) {
      console.error("Error in addToWatchHistory repository:", error);
      throw error;
    }
  }
  
  async getWatchHistory(userId: string): Promise<any[]> {
    try {
      const channel = await ChannelModel.findOne({ user: new mongoose.Types.ObjectId(userId) }).lean();
  
      if (!channel) {
        console.error(`Channel not found for user ID: ${userId}`);
        return [];
      }
  
      //console.log("Channel found:", channel);
  
      // Transform the watch history
      const watchHistory = await Promise.all(channel.watchHistory.map(async (videoId: mongoose.Types.ObjectId) => {
        const videoChannel = await ChannelModel.findOne(
          { 'videos._id': videoId },
          { 'videos.$': 1, channelName: 1, profilePic: 1 }
        ).lean();
  
        if (!videoChannel || !videoChannel.videos[0]) {
          //console.log(`Video not found for ID: ${videoId}`);
          return null;
        }
  
        const video = videoChannel.videos[0];
        return {
          _id: video._id,
          title: video.name,
          url: video.url,
          thumbnail: video.thumbnail,
          views: video.views,
          channelName: videoChannel.channelName,
          channelId: videoChannel._id,
          likes:video.likes,
          disLikes:video.dislikes,
          category:video.category,
          channelProfilePic: videoChannel.profilePic
        };
      }));
  
      // Filter out any null values (videos that weren't found)
      const filteredWatchHistory = watchHistory.filter(item => item !== null);
  
    
  
      // No need to explicitly sort, as the videos are already in order based on how they were stored
      return filteredWatchHistory;
    } catch (error) {
      console.error("Error in getWatchHistory repository:", error);
      throw error;
    }
  }
  

  async dislikeVideo(videoId: string, userId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': new ObjectId(videoId) });
      if (!channel) {
         
        return false;
      }
  
      const video = channel.videos.find(video => video._id.toString() === videoId);
      //console.log("videodiss",video);
      if (!video) {
        console.error(`Video not found in channel for video ID: ${videoId}`);
        return false;
      }
  
      const userObjectId = new ObjectId(userId);
  
      // Remove the user's ID from the likes array if it exists
      video.likes = (video.likes as mongoose.Types.ObjectId[]).filter(
        (id) => !id.equals(userObjectId)
      );
  
      // Check if the user has already disliked the video
      const userDisliked = (video.dislikes as mongoose.Types.ObjectId[]).some(
        (id) => id.equals(userObjectId)
      );
  
      if (!userDisliked) {
        video.dislikes.push(userObjectId);
      }
  
      channel.markModified('videos');
      await channel.save();
      return true;
    } catch (error) {
      console.error("Error in dislikeVideo repository:", error);
      throw error;
    }
  }
  
  async undislikeVideo(videoId: string, userId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': new ObjectId(videoId) });
      if (!channel) {
         
        return false;
      }
  
      const video = channel.videos.find(video => video._id.toString() === videoId);
      //console.log("videodiss",video);
      
      if (!video) {
        console.error(`Video not found in channel for video ID: ${videoId}`);
        return false;
      }
  
      const userObjectId = new ObjectId(userId);
  
      // Remove the user's ID from the dislikes array
      video.dislikes = (video.dislikes as mongoose.Types.ObjectId[]).filter(
        (id) => !id.equals(userObjectId)
      );
  
      channel.markModified('videos');
      await channel.save();
      return true;
    } catch (error) {
      console.error("Error in undislikeVideo repository:", error);
      throw error;
    }
  }
  
  async incrementView(videoId: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': new ObjectId(videoId) });
      if (!channel) {
         
        return false;
      }
  
      const video = channel.videos.find(video => video._id.toString() === videoId);
      if (!video) {
        console.error(`Video not found in channel for video ID: ${videoId}`);
        return false;
      }
  
      video.views += 1;
      channel.markModified('videos');
      
      
      await channel.save();
    
      
      return true;
    } catch (error) {
      console.error("Error in incrementView repository:", error);
      throw error;
    }
  }

  async addComment(videoId: string, userId: string, comment: string): Promise<boolean> {
    try {
      const channel = await ChannelModel.findOne({ 'videos._id': new mongoose.Types.ObjectId(videoId) });
      if (!channel) {
        return false;
      }

      const video = channel.videos.find(video => video._id.toString() === videoId);
      if (!video) {
        console.error(`Video not found in channel for video ID: ${videoId}`);
        return false;
      }

      video.comments.push({
        user: new mongoose.Types.ObjectId(userId),
        comment: comment,
        isPinned:false,
        likes:[],
        createdAt: new Date()
      });

      channel.markModified('videos');
      await channel.save();
      console.log("videocomments",video);
      return true;
    } catch (error) {
      console.error("Error in addComment repository:", error);
      throw error;
    }
  }

  async deleteComment(videoId: string, commentId: string): Promise<boolean> {
    try {
      const result = await ChannelModel.updateOne(
        { 'videos._id': new mongoose.Types.ObjectId(videoId) },
        {
          $pull: {
            'videos.$.comments': { _id: new mongoose.Types.ObjectId(commentId) }
          }
        }
      );

      if (result.modifiedCount === 0) {
        console.error(`Comment not found or not deleted for video ID: ${videoId} and comment ID: ${commentId}`);
        return false;
      }

      console.log(`Comment deleted successfully for video ID: ${videoId} and comment ID: ${commentId}`);
      return true;
    } catch (error) {
      console.error("Error in deleteComment repository:", error);
      throw error;
    }
  }

  async getComments(videoId: string): Promise<any[]> {
    try {
      const videoChannel = await ChannelModel.findOne(
        { 'videos._id': new mongoose.Types.ObjectId(videoId) },
        { 'videos.$': 1 }
      ).lean();
  
      if (!videoChannel || !videoChannel.videos[0]) {
        console.error(`Video not found for video ID: ${videoId}`);
        return [];
      }
  
      const video = videoChannel.videos[0];
  
      // Populate user details for each comment
      const comments = await Promise.all(video.comments.map(async (comment: any) => {
        const userChannel = await ChannelModel.findOne(
          { user: comment.user },
          { channelName: 1, profilePic: 1 }
        ).lean();
  
        return {
          _id: comment._id,
          user: {
            _id: comment.user,
            name: userChannel ? userChannel.channelName : 'Anonymous',
            profilePic: userChannel ? userChannel.profilePic : '/assets/images/default-avatar.png'
          },
          comment: comment.comment,
          createdAt: comment.createdAt
        };
      }));
  
      console.log("Video comments:", comments);
      return comments;
    } catch (error) {
      console.error("Error in getComments repository:", error);
      throw error;
    }
  }



}
