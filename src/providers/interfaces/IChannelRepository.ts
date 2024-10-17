import { ChannelDocument, Shorts, Video } from "../../model/channelModel";


export interface IChannelRepository{
    showChannels():Promise<ChannelDocument[] | string>;
    getChannelById(channelId: string): Promise<ChannelDocument | null>
    getChannelData(userId: string): Promise<ChannelDocument | null>
    addSubscriber(userId: string, channelId: string):Promise<ChannelDocument | null>
    isUserSubscribed(channelId: string, userId: string): Promise<boolean>
    removeSubscriber(channelId: string, userId: string): Promise<ChannelDocument | null>;
    updateChannelName(channelId:string,newName:string):Promise<ChannelDocument|boolean>
    updateProfilePic(channelId: string, fileUrl: string): Promise<ChannelDocument | null>
    startLive(channelId:string,link:string):Promise<ChannelDocument|boolean>
    stopLive(channelId:string):Promise<ChannelDocument|boolean>
    updateBanner(channelId: string, filePath: string): Promise<ChannelDocument | null>
    listUnlist(videoId: string): Boolean | PromiseLike<Boolean>;
    unlistList(videoId: string): Promise<Boolean>;
    saveVideo(videoData: any): Promise<any>
    getVideos(): Promise<Video[]>
    getChannelShorts(channelId:string):Promise<Shorts[]>
    getChannelPlaylists(channelId: string): Promise<any[]>;
    getChannelVideos(channelId:string):Promise<Video[]>
    updateVideo(videoId:string,title:string,description:string,category:string):Promise<Boolean>
    // verifyRazorpayPayment(paymentId: string): Promise<boolean>
    addSuperUserSubscription(userId: string, channelId: string, plan: 'weekly' | 'monthly',expiryDate:Date): Promise<ChannelDocument | null>





}