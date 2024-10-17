import { ChannelDocument, Playlist, Shorts, Video } from "../../model/channelModel";

export interface IVideoInteractor {
    togglePlaylistVisibility(playlistId: string): Promise<any>;
    updatePlaylist(playlistId: any, name: any, description: any, thumbnailUrl: string | undefined): Promise<any>;
    deletePlaylist(playlistId: string): unknown;
    saveVideoToPlaylist(videoData: { url: string; name: any; description: any;channelId: any; playlistId: any; }): Promise<any>;
    createPlaylist(name: any, description: any, isPublic: boolean, channelId: any, fileUrl: string,category:string): Promise<any>;
    listUnlist(videoId: string): Promise<Boolean>;
    unlistList(videoId: string): Promise<Boolean>;
    getAllPlaylists(): Promise<Playlist[]>
    saveVideo(videoData: any): Promise<any>
    saveShort(videoData: any): Promise<any>
    savePlaylist(playlistData: any): Promise<any>;
    getVideos(userId?: string): Promise<Video[]>
    addComment(videoId: string, userId: string, comment: string): boolean | Promise<boolean>;
    deleteComment(videoId: string,commentId:string): boolean | Promise<boolean>;
    getComments(videoId: string): any[] | Promise<any[]>;
    getShorts(): Promise<Shorts[]>
    updateVideo(videoId:string,title:string,description:string,category:string):Promise<Boolean>
    updateShorts(videoId:string,title:string,category:string):Promise<Boolean>
    findVideoById(videoId:string):Promise<Video|null>
    findVideoAndDelete(videoId:string):Promise<Boolean|null>
    findShortAndDelete(shortsId:string):Promise<Boolean|null>
    likeVideo(videoId: string, userId: string): Promise<boolean>
    getPlaylistVideos(playlistId: string,channelId:string): Promise<any>
    unlikeVideo(videoId: string, userId: string): Promise<boolean>
    getLikeStatus(videoId: string, userId: string): Promise<{ isLiked: boolean, isDisliked: boolean, likeCount: number, dislikeCount: number }>    
    dislikeVideo(videoId: string, userId: string): Promise<boolean>
    undislikeVideo(videoId: string, userId: string): Promise<boolean>
    incrementView(videoId: string): Promise<boolean>
    getRecommendedVideos(categoryId: string): Promise<Video[]>
    getWatchHistory(userId: string): Promise<any[]>
    addToWatchHistory(videoId: string, userId: string): Promise<boolean>


    
  }
  