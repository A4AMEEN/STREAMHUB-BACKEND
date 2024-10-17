import { ChannelDocument, Playlist, Shorts, Video } from "../model/channelModel";
import { IVideoInteractor } from "../providers/interfaces/IVideoInterator";
import { IVideoRepository } from "../providers/interfaces/IVideoRepositry";
import { uploadS3Video } from "../utils/s3Uploader";

export class VideoInteractor implements IVideoInteractor {
    private _repository: IVideoRepository;
  
    constructor(repository: IVideoRepository) {
      this._repository = repository;
    }
  savePlaylist(playlistData: any): Promise<any> {
    throw new Error("Method not implemented.");
  }
   
    listUnlist=async(videoId: string): Promise<Boolean> =>{
        try {
          return await this._repository.listUnlist(videoId)
        } catch (error) {
          return false
        }
    }
    unlistList=async(videoId: string): Promise<Boolean> =>{
        try {
          return await this._repository.unlistList(videoId)
        } catch (error) {
          return false
        }
    }
  
    updateVideo=async(videoId:string,title:string,description:string,category:string):Promise<Boolean>=>{
      try {
  
        return await this._repository.updateVideo(videoId,title,description,category)
        return true
      } catch (error) {
        return false
      }
    }
    
    updateShorts=async(videoId:string,title:string,category:string):Promise<Boolean>=>{
      try {
  
        return await this._repository.updateShorts(videoId,title,category)
        return true
      } catch (error) {
        return false
      }
    }
    
  createPlaylist = async (
    name: string,
    description: string,
    isPublic: boolean,
    channelId: string,
    fileUrl: any,
    category:string
  ): Promise<any> => {
    try {
      

      const playlistData = {
        name,
        description,
        isPublic,
        channelId,
        thumbnail: fileUrl,
        category,
        videos: [],
        createdAt: new Date()
      };

      const newPlaylist = await this._repository.savePlaylist(playlistData);
      return newPlaylist;
    } catch (error) {
      console.error("Error in createPlaylist interactor:", error);
      throw error;
    }
  }

    uploadShort = async (file: Express.Multer.File): Promise<string> => {
        try {
          const s3bucket = await uploadS3Video(file);
          if ("success" in s3bucket) {
            return s3bucket.success as string;
          } else {
            return "";
          }
        } catch (err) {
          console.error("Error during upload", err);
          throw err;
        }
      };

      getAllPlaylists = async (): Promise<Playlist[]> => {
        try {
          return await this._repository.getAllPlaylists();
        } catch (error) {
          console.error("Error in getAllPlaylists interactor:", error);
          throw error;
        }
      }
    
      saveVideo = async (videoData: any): Promise<any> => {
        try {
          return await this._repository.saveVideo(videoData);
        } catch (error) {
          console.error("Error in saveVideo interactor:", error);
          throw error;
        }
      }
      saveShort = async (videoData: any): Promise<any> => {
        try {
          return await this._repository.saveShort(videoData);
        } catch (error) {
          console.error("Error in saveVideo interactor:", error);
          throw error;
        }
      }

      saveVideoToPlaylist = async (videoData: any): Promise<any> => {
        try {
            return await this._repository.saveVideoToPlaylist(videoData);
        } catch (error) {
            console.error("Error in saveVideoToPlaylist interactor:", error);
            throw error;
        }
    }

    
    getPlaylistVideos = async (playlistId: string,channelId:string): Promise<any> => {
      try {
          return await this._repository.getPlaylistVideos(playlistId,channelId);
      } catch (error) {
          console.error("Error in getPlaylistVideos interactor:", error);
          throw error;
      }
  }

  updatePlaylist = async (playlistId: any, name: any, description: any, thumbnailUrl: string | undefined): Promise<any> => {
    try {
      const updateData: any = { name, description };
      if (thumbnailUrl) {
        updateData.thumbnail = thumbnailUrl;
      }
      return await this._repository.updatePlaylist(playlistId, updateData);
    } catch (error) {
      console.error("Error in updatePlaylist interactor:", error);
      throw error;
    }
  }

  deletePlaylist = async (playlistId: string): Promise<void> => {
    try {
      await this._repository.deletePlaylist(playlistId);
    } catch (error) {
      console.error("Error in deletePlaylist repository:", error);
      throw error;
    }
  }

  togglePlaylistVisibility = async (playlistId: string): Promise<any> => {
    try {
      
      return await this._repository.togglePlaylistVisibility(playlistId)
    } catch (error) {
      console.error("Error in togglePlaylistVisibility interactor:", error);
      throw error;
    }
  }

    
    
  getVideos = async (userId?: string): Promise<Video[]> => {
    try {
        return await this._repository.getVideos(userId);
    } catch (error) {
        console.error("Error in getVideos interactor:", error);
        throw error;
    }
}
      getShorts=async(): Promise<Shorts[]> =>{
        try {
          return await this._repository.getShorts();
        } catch (error) {
          console.error("Error in getVideos interactor:", error);
          throw error;
        }
      }

      findVideoById=async(videoId:string):Promise<Video|null>=>{
        return await this._repository.findVideo(videoId)
      }

      getRecommendedVideos = async (categoryId: string): Promise<Video[]> => {
        try {
          return await this._repository.getRecommendedVideos(categoryId);
        } catch (error) {
          console.error("Error in getRecommendedVideos interactor:", error);
          throw error;
        }
      }

      addToWatchHistory = async (videoId: string, userId: string): Promise<boolean> => {
        try {
            return await this._repository.addToWatchHistory(videoId, userId);
        } catch (error) {
            console.error("Error in addToWatchHistory interactor:", error);
            throw error;
        }
    }

      findVideoAndDelete=async(videoId:string):Promise<Boolean|null>=>{
        try{

            return await this._repository.deleteVideo(videoId)
        } catch (error){
            console.error("Error in getVideos interactor:", error);
           return false
        }
      }
      findShortAndDelete=async(shortsId:string):Promise<Boolean|null>=>{
        try{

            return await this._repository.deleteVideo(shortsId)
        } catch (error){
            console.error("Error in getVideos interactor:", error);
           return false
        }
      }

      likeVideo = async (videoId: string, userId: string): Promise<boolean> => {
        return await this._repository.likeVideo(videoId, userId);
      }

      getLikeStatus = async (videoId: string, userId: string): Promise<{ isLiked: boolean, isDisliked: boolean, likeCount: number, dislikeCount: number }> => {
        return await this._repository.getLikeStatus(videoId, userId);
      }

      unlikeVideo = async (videoId: string, userId: string): Promise<boolean> => {
        return await this._repository.unlikeVideo(videoId, userId);
      }

      dislikeVideo = async (videoId: string, userId: string): Promise<boolean> => {
        return await this._repository.dislikeVideo(videoId, userId);
      }
      
      undislikeVideo = async (videoId: string, userId: string): Promise<boolean> => {
        return await this._repository.undislikeVideo(videoId, userId);
      }

      incrementView = async (videoId: string): Promise<boolean> => {
        return await this._repository.incrementView(videoId);
      }

      addComment = async (videoId: string, userId: string, comment: string): Promise<boolean> => {
        return await this._repository.addComment(videoId, userId, comment);
      }
      deleteComment = async (videoId: string, commentId: string): Promise<boolean> => {
        return await this._repository.deleteComment(videoId, commentId);
      }
    
      getComments = async (videoId: string): Promise<any[]> => {
        return await this._repository.getComments(videoId);
      }


  getWatchHistory = async (userId: string): Promise<any[]> => {
    try {
      return await this._repository.getWatchHistory(userId);
    } catch (error) {
      console.error("Error in getWatchHistory interactor:", error);
      throw error;
    }
  }
    
  }