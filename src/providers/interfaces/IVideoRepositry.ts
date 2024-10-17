import { ChannelDocument, Playlist, Shorts, Video } from "../../model/channelModel";

export interface IVideoRepository {
    addComment(videoId: string, userId: string, comment: string): boolean | Promise<boolean>;
    deleteComment(videoId: string,commentId:string): boolean | Promise<boolean>;
    getComments(videoId: string): any[] | Promise<any[]>;
    togglePlaylistVisibility(playlistId: string): Promise<any>;
    deletePlaylist(playlistId: string): Promise<any>;
    updatePlaylist(playlistId: string,playlistData:any):Promise<any>;
    getAllPlaylists(): Promise<Playlist[]>
    saveVideoToPlaylist(videoData: any): any;
    savePlaylist(playlistData: any): Promise<any>;
    saveVideoToPlaylist(videoData: { url: string; name: any; description: any; category: any; channelId: any; playlistId: any; }): Promise<any>;
    getLikeStatus(videoId: string, userId: string): Promise<{ isLiked: boolean, isDisliked: boolean, likeCount: number, dislikeCount: number }>
    listUnlist(videoId: string): Boolean | PromiseLike<Boolean>;
    unlistList(videoId: string): Promise<Boolean>;
    saveVideo(videoData: any): Promise<any>
    saveShort(videoData: any): Promise<any>
    getVideos(userId?: string): Promise<Video[]>
    getShorts(): Promise<Shorts[]>
    updateVideo(videoId: string, title: string, description: string, category: string): Promise<Boolean>;
    updateShorts(videoId:string,title:string,category:string):Promise<Boolean>
    findVideo(videoId: string): Promise<Video | null>
    deleteVideo(videoId: string): Promise<Boolean | null>
    deleteShort(shortsId: string): Promise<Boolean | null>
    likeVideo(videoId: string, userId: string): Promise<boolean>
    unlikeVideo(videoId: string, userId: string): Promise<boolean>
    dislikeVideo(videoId: string, userId: string): Promise<boolean>
    getPlaylistVideos(playlistId: string, channelId: string): Promise<any>
    undislikeVideo(videoId: string, userId: string): Promise<boolean>
    incrementView(videoId: string): Promise<boolean>
    getRecommendedVideos(categoryId: string): Promise<Video[]>;
    getWatchHistory(userId: string): Promise<any[]>
    addToWatchHistory(videoId: string, userId: string): Promise<boolean>
}
