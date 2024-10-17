import { channel } from "diagnostics_channel";
import { Channel } from "../entities/channel";
import { ChannelDocument, Playlist, Shorts, Video } from "../model/channelModel";
import { IChannelInteractor } from "../providers/interfaces/IChannelInteractor";
import { IChannelRepository } from "../providers/interfaces/IChannelRepository";
import { uploadS3Video } from "../utils/s3Uploader";
import Razorpay from "razorpay";

export class channelInteractor implements IChannelInteractor {
  private razorpay: Razorpay;

  private _repository: IChannelRepository;
  constructor(private repository: IChannelRepository) {
    this._repository = repository;
    this.razorpay = new Razorpay({
      key_id: "rzp_test_U3wApGAM5gGpOR",
      key_secret: "HyCBL2HkQVecOmAEi44gUonh"
    });
  }
 
  
 
  

  showChannels = async():Promise<ChannelDocument[] | string> =>{
    try {
      return await this._repository.showChannels()
      
    } catch (error) {
      return "error "
    }
  }

  getChannelById = async (channelId: string): Promise<ChannelDocument | null> => {
    try {
      return await this._repository.getChannelById(channelId);
    } catch (error) {
      console.error("Error in getChannelById interactor:", error);
      return null;
    }
  }

  getChannelData = async (userId: string): Promise<ChannelDocument | null> => {
    try {
      return await this._repository.getChannelData(userId);
    } catch (error) {
      console.error("Error in getChannelData interactor:", error);
      return null;
    }
  }

  addSubscriber = async (userId: string, channelId: string): Promise<ChannelDocument | null> => {
    try {
      return await this._repository.addSubscriber(channelId, userId);
    } catch (error) {
      console.error("Error in subscribeToChannel interactor:", error);
      return null;
    }
  }
  async isUserSubscribed(channelId: string, userId: string): Promise<boolean> {
    return this._repository.isUserSubscribed(channelId, userId);
  }

  async unsubscribeFromChannel(userId: string, channelId: string) {
    try {
      return await this._repository.removeSubscriber(channelId, userId);
    } catch (error) {
      console.error("Error in unsubscribeFromChannel interactor:", error);
      throw error;
    }
  }

  async verifyRazorpayPayment(paymentId: string): Promise<boolean> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      console.log("paymentResponse, plan, channelId,userId",paymentId);
      console.log("paymentResponse, plan, channelId,userId",payment);

      return payment.status === 'authorized';
    } catch (error) {
      console.error("Error verifying Razorpay payment:", error);
      return false;
    }
  }

  async addSuperUserSubscription(userId: string, channelId: string, plan: 'weekly' | 'monthly'): Promise<ChannelDocument | null> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (plan === 'weekly' ? 7 : 30));
      console.log("superuser interactor channelId",channelId);
      console.log("superuser interactor userId",userId);
      console.log("superuser interactor plan", plan);
      console.log("superuser interactor expiryDate",expiryDate);
      
      return await this._repository.addSuperUserSubscription(channelId, userId, plan, expiryDate);
    } catch (error) {
      console.error("Error in addSuperUserSubscription interactor:", error);
      return null;
    }
  }

  updateChannelName=async(channelId:string,newName:string):Promise<ChannelDocument|boolean>=>{
    try {
      return await this._repository.updateChannelName(channelId,newName)
    } catch (error) {
      return false
    }
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

  updateProfilePic = async (channelId: string, fileUrl: string): Promise<ChannelDocument | null> => {
    try {
      const result = await this._repository.updateProfilePic(channelId, fileUrl);
      return result;
    } catch (error) {
      console.error("Error in updateProfilePic interactor:", error);
      return null;
    }
  }
  startLive = async (channelId: string, link: string): Promise<ChannelDocument | boolean> => {
    try {
      const result = await this._repository.startLive(channelId, link);
      return true;
    } catch (error) {
      console.error("Error in updateProfilePic interactor:", error);
      return false  ;
    }
  }
  stopLive = async (channelId: string): Promise<ChannelDocument | boolean> => {
    try {
      const result = await this._repository.stopLive(channelId);
      return true;
    } catch (error) {
      console.error("Error in updateProfilePic interactor:", error);
      return false  ;
    }
  }

  async updateBanner(channelId: string, fileUrl: string): Promise<ChannelDocument | null> {
    return this.repository.updateBanner(channelId, fileUrl);
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

  saveVideo = async (videoData: any): Promise<any> => {
    try {
      return await this._repository.saveVideo(videoData);
    } catch (error) {
      console.error("Error in saveVideo interactor:", error);
      throw error;
    }
  }

  getVideos=async(): Promise<Video[]> =>{
    try {
      return await this._repository.getVideos();
    } catch (error) {
      console.error("Error in getVideos interactor:", error);
      throw error;
    }
  }

  getChannelVideos = async (channelId: string): Promise<Video[]> => {
    try {
      return await this._repository.getChannelVideos(channelId);
    } catch (error) {
      console.error("Error in getChannelVideos interactor:", error);
      throw error;
    }
  }
  getChannelShorts = async (channelId: string): Promise<Shorts[]> => {
    try {
      return await this._repository.getChannelShorts(channelId);
    } catch (error) {
      console.error("Error in getChannelVideos interactor:", error);
      throw error;
    }
  }

  getChannelPlaylists = async (channelId: string): Promise<Playlist[]> => {
    try {
      return await this._repository.getChannelPlaylists(channelId);
    } catch (error) {
      console.error("Error in getChannelPlaylists interactor:", error);
      throw error;
    }
  }

  

  


}