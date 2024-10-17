import { ChannelDocument, Playlist, Shorts, Video } from "../../model/channelModel";

export interface IChannelInteractor{
    getChannelPlaylists(channelId: string): Promise<Playlist[]>;
    showChannels():Promise<ChannelDocument[] | string>;
    getChannelById(channelId: string): Promise<ChannelDocument | null>
    getChannelData(userId: string): Promise<ChannelDocument | null>
    addSubscriber(userId: string, channelId: string):Promise<ChannelDocument | null>
    isUserSubscribed(channelId: string, userId: string): Promise<boolean>
    unsubscribeFromChannel(userId: string, channelId: string): Promise<ChannelDocument | null>;
    updateChannelName(channelId:string,newName:string):Promise<ChannelDocument|boolean>
    startLive(channelId:string,link:string):Promise<ChannelDocument|boolean>
    stopLive(channelId:string):Promise<ChannelDocument|boolean>
    updateProfilePic(channelId: string, fileUrl: string): Promise<ChannelDocument | null>
    updateBanner(channelId: string, fileUrl: string): Promise<ChannelDocument | null>
    listUnlist(videoId: string): Promise<Boolean>;
    unlistList(videoId: string): Promise<Boolean>;
    saveVideo(videoData: any): Promise<any>
    getVideos(): Promise<Video[]>
    getChannelVideos(channelId:string):Promise<Video[]>
    getChannelShorts(channelId:string):Promise<Shorts[]>
    updateVideo(videoId:string,title:string,description:string,category:string):Promise<Boolean>
    verifyRazorpayPayment(paymentId: string): Promise<boolean>
    addSuperUserSubscription(userId: string, channelId: string, plan: 'weekly' | 'monthly',): Promise<ChannelDocument | null>

    
    
}