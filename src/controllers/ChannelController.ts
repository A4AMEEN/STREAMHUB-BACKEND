import { Request, Response, NextFunction } from "express";
import { IChannelInteractor } from "../providers/interfaces/IChannelInteractor";
import { ResponseStatus } from "../contrants/statusCodesEnus";
import { uploadS3Video } from "../utils/s3Uploader";
import { uploadS3Image } from "../utils/imageS3Upload";
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export class ChannelController {
  private _interactor: IChannelInteractor;

  constructor(interactor: IChannelInteractor) {
    this._interactor = interactor;
  }

  async getChannels(req: Request, res: Response) {



    try {
      const showChannels = await this._interactor.showChannels()
      if (!showChannels) {
        res.status(ResponseStatus.Unauthorized).json({ message: "no active Channels Now" })
      }


      res.status(ResponseStatus.OK).json({ showChannels })
    } catch (error) {

    }
  }

  async getChannelById(req: Request, res: Response) {
    try {
      //console.log("Backend received request for channel ID:", req.params.id);
      const channelId = req.params.id
      //console.log("channekds ", channelId);

      if (!channelId) {
        return res.status(ResponseStatus.Unauthorized).json({ message: "channel id is required" })
      }
      const channel = await this._interactor.getChannelById(channelId);

      if (!channel) {
        return res.status(ResponseStatus.Unauthorized).json({ message: "Channel dosent exists " })
      }




      return res.status(ResponseStatus.OK).json({ channel })

    } catch (error) {
      console.error("Error in getChannelById:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });

    }
  }

  async getChannelData(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      //console.log("im inn", userId);

      if (!userId) {
        return res.status(ResponseStatus.BadRequest).json({ message: "User ID is required" });
      }

      const channelData = await this._interactor.getChannelData(userId);

      if (!channelData) {
        return res.status(ResponseStatus.NotFound).json({ message: "Channel not found for this user" });
      }

      return res.status(ResponseStatus.OK).json({ channel: channelData });
    } catch (error) {
      console.error("Error in getChannelData:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
    }
  }

  async startLive(req:Request,res:Response){
    try{
      const channelId=req.body.channelId;
      const link = req.body.link;
      const channel = await this._interactor.startLive(channelId, link)
      if (!channel) {
        return res.status(ResponseStatus.NotFound).json({ message: "Channel not found for this user" });
      }

      return res.status(ResponseStatus.OK).json({ channel: channel });
      

    }
    catch(e){

    }
  }
  async stopLive(req:Request,res:Response){
    try{
      const channelId=req.body.channelId;
      const channel = await this._interactor.stopLive(channelId)
      

    }
    catch(e){

    }
  }
 
 

  async updateChannelName(req: Request, res: Response) {
    //console.log("object");
    try {
      const channelId = req.params.id
      const newName = req.body.newName;



      const channel = await this._interactor.updateChannelName(channelId, newName)
      if (!channel) {
        return res.status(ResponseStatus.BadRequest).json({ message: "error while udpating" })
      }


      return res.status(ResponseStatus.OK).json({ message: "updates successfully", channel })

    } catch (error) {
      throw error
    }
  }



  async updateProfilePic(req: Request, res: Response) {
    try {
      const channelId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(ResponseStatus.BadRequest).json({ message: "No file uploaded" });
      }

      const uploadResult = await uploadS3Image(file);
      if (uploadResult.error) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Error uploading to S3", error: uploadResult.msg });
      }
      if (!uploadResult.success) {
        res.status(ResponseStatus.BadRequest).json({ message: "Error uploading to S3", error: uploadResult.msg });
        return

      }
      const channel = await this._interactor.updateProfilePic(channelId, uploadResult.success);

      if (!channel) {
        return res.status(ResponseStatus.Unauthorized).json({ message: "Error while updating profile picture" });
      }

      return res.status(ResponseStatus.OK).json({ message: "Profile picture updated successfully", channel });
    } catch (error) {
      console.error("Error in updateProfilePic:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
    }
  }

  async updateBanner(req: Request, res: Response) {
    try {
      const channelId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(ResponseStatus.BadRequest).json({ message: "No file uploaded" });
      }

      const uploadResult = await uploadS3Image(file);
      if (uploadResult.error) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Error uploading to S3", error: uploadResult.msg });
      }

      if (!uploadResult.success) {
        res.status(ResponseStatus.BadRequest).json({ message: "Error uploading to S3", error: uploadResult.msg });
        return

      }

      const channel = await this._interactor.updateBanner(channelId, uploadResult.success);
      if (!channel) {
        return res.status(ResponseStatus.Unauthorized).json({ message: "Error while updating banner" });
      }

      return res.status(ResponseStatus.OK).json({ message: "Banner updated successfully", channel });
    } catch (error) {
      console.error("Error in updateBanner:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
    }
  }
  async uploadVideo(req: Request, res: Response, next: NextFunction) {
    try {
      //console.log("File is:", req.file);

      if (!req.file || !req.file.mimetype.startsWith("video/")) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Invalid file type. Please upload a video file." });
      }

      const { name, description, category, channelId } = req.body;

      //console.log("Video details:", { name, description, category, channelId });

      // Compress video
      const compressedVideoBuffer = await this.compressVideo(req.file.buffer);

      //console.log("Compressed file size:", compressedVideoBuffer.length, "bytes");

      // Calculate compression ratio
      const compressionRatio = (1 - (compressedVideoBuffer.length / req.file.size)) * 100;
      //console.log(`Compression ratio: ${compressionRatio.toFixed(2)}%`);

      // Upload compressed video to S3
      let uploadResult;
      try {
        uploadResult = await uploadS3Video({
          ...req.file,
          buffer: compressedVideoBuffer
        });
      } catch (uploadError) {
        console.error("Error in uploadS3Video:", uploadError);
        return res.status(ResponseStatus.BadRequest).json({ message: "Error uploading video to S3", error: uploadError });
      }

      if (uploadResult.error) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Error uploading video to S3", error: uploadResult.msg });
      }

      if (!uploadResult.success) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Error uploading video to S3: No URL returned" });
      }

      // Save video details to database
      const videoData = {
        url: uploadResult.success,
        name,
        description,
        category,
        channelId
      };

      const savedVideo = await this._interactor.saveVideo(videoData);


      if (savedVideo) {
        return res.status(202).json({ message: "Video uploaded successfully", video: savedVideo });
      } else {
        return res.status(ResponseStatus.BadRequest).json({ message: "Error while saving video to database" });
      }
    } catch (error) {
      console.error("Server error in uploadVideo:", error);
      next(error);
    }
  }
  private async compressVideo(inputBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const tempInput = path.join(os.tmpdir(), `input-${Date.now()}.mp4`);
      const tempOutput = path.join(os.tmpdir(), `output-${Date.now()}.mp4`);

      // Write buffer to temporary file
      fs.writeFileSync(tempInput, inputBuffer);

      const command = ffmpeg(tempInput)
        .outputOptions([
          '-c:v libx264',
          '-crf 23',
          '-preset medium',
          '-c:a aac',
          '-b:a 128k'
        ])
        .output(tempOutput);

      // Log the ffmpeg command
      //console.log("FFmpeg command:", command._getArguments().join(' '));

      command.on('end', () => {
        // Read the output file into a buffer
        const outputBuffer = fs.readFileSync(tempOutput);

        // Clean up temporary files
        fs.unlinkSync(tempInput);
        fs.unlinkSync(tempOutput);

        resolve(outputBuffer);
      })
        .on('error', (err) => {
          // Clean up temporary files in case of error
          if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
          if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);

          console.error("FFmpeg error:", err);
          reject(err);
        })
        .run();
    });
  }

  async showVideos(req: Request, res: Response) {
    try {
      //console.log("just got int");

      const videos = await this._interactor.getVideos();

      res.status(ResponseStatus.OK).json({ videos });
    } catch (error) {
      console.error("Error in getVideos controller:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
    }
  }

  async getChannelVideos(req: Request, res: Response) {
    try {
      const channelId = req.params.channelId;
      const videos = await this._interactor.getChannelVideos(channelId);

      res.status(ResponseStatus.OK).json({ videos });
    } catch (error) {
      console.error("Error in getChannelVideos controller:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
    }
  }

  async getChannelShorts(req: Request, res: Response) {
    try {
      const channelId = req.params.channelId;
      const videos = await this._interactor.getChannelShorts(channelId);

      res.status(ResponseStatus.OK).json({ videos });
      //console.log("for types videos ",videos)
    } catch (error) {
      console.error("Error in getChannelVideos controller:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
    }
  }

  async getChannelPlaylists(req: Request, res: Response) {
    try {
      const channelId = req.params.channelId;
      const playlists = await this._interactor.getChannelPlaylists(channelId);
      //console.log("listPlaylit",playlists)
      res.status(ResponseStatus.OK).json({ playlists });
      //console.log("for types playlists ",playlists)

    } catch (error) {
      console.error("Error in getChannelPlaylists controller:", error);
      res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
    }
  }

  async onListUnlist(req: Request, res: Response) {
    try {
      const videoId = req.body.videoId



      const list = await this._interactor.listUnlist(videoId)



      return res.status(ResponseStatus.OK).json({ message: "doen listedsunlist" });



    } catch (error) {
      throw error
    }
  }

  async updateVideo(req: Request, res: Response) {
    try {
      const { videoId, title, description, category } = req.body;
      //console.log("Updating video:", videoId, title, description, category);

      if (!videoId || !title || !description || !category) {
        return res.status(ResponseStatus.BadRequest).json({ message: 'Missing required fields' });
      }

      const updatedVideo = await this._interactor.updateVideo(videoId, title, description, category);
      if (!updatedVideo) {
        return res.status(ResponseStatus.NotFound).json({ message: 'Video not found or not authorized' });
      }

      return res.status(ResponseStatus.OK).json({ message: "Video updated successfully", video: updatedVideo });


    } catch (error) {

    }
  }

  async subscribeToChannel(req: Request, res: Response) {
    try {
      const { userId, channelId } = req.body;


      const result = await this._interactor.addSubscriber(userId, channelId);
      res.status(ResponseStatus.OK).json(result);
    } catch (error) {
      res.status(ResponseStatus.BadRequest).json({ error: 'An error occurred while subscribing to the channel' });
    }
  }


  async checkSubscriptionStatus(req: Request, res: Response) {
    try {
      const { channelId, userId } = req.params;
      const isSubscribed = await this._interactor.isUserSubscribed(channelId, userId);


      res.status(ResponseStatus.OK).json(isSubscribed);
    } catch (error) {
      res.status(ResponseStatus.BadRequest).json({ error: 'An error occurred while checking subscription status' });
    }
  }

  async unsubscribeFromChannel(req: Request, res: Response): Promise<void> {
    try {
      const { userId, channelId } = req.body;

      const result = await this._interactor.unsubscribeFromChannel(userId, channelId);
      res.status(ResponseStatus.OK).json({ message: "Unsubscribed successfully", channel: result });
    } catch (error) {
      console.error("Error in unsubscribeFromChannel:", error);
      res.status(ResponseStatus.BadRequest).json({ error: "An error occurred while unsubscribing from the channel" });
    }
  }
  async verifySuperUserPayment(req: Request, res: Response) {
    try {
      
      const paymentResponse=req.body.paymentResponse
      const plan=req.body.plan
      const channelId=req.body.channelId
      const userId=req.body.userId
      //console.log("paymentResponse, plan, channelId,userId", paymentResponse, plan, channelId, userId);


      // Verify the Razorpay payment
      
      const isPaymentValid = await this._interactor.verifyRazorpayPayment(paymentResponse.razorpay_payment_id);


      //console.log("paymentResponse, plan, channelId,userId", isPaymentValid);
      if (isPaymentValid) {
        //console.log("paymentResponse, plan, channelId,userId", isPaymentValid);

        // If payment is valid, add the user to the subscription list
        const result = await this._interactor.addSuperUserSubscription(userId, channelId, plan);
        res.status(ResponseStatus.OK).json(result);
      } else {
        res.status(ResponseStatus.BadRequest).json({ error: 'Payment verification failed' });
      }
    } catch (error) {
      console.error("Error in verifySuperUserPayment:", error);
      res.status(ResponseStatus.BadRequest).json({ error: 'An error occurred while processing the super user subscription' });
    }
  }




}

