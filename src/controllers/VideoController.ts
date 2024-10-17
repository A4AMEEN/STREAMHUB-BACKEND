import { Request, Response, NextFunction } from "express";
import { IVideoInteractor } from "../providers/interfaces/IVideoInterator";
import { uploadS3Video } from "../utils/s3Uploader";
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { uploadS3Image } from "../utils/imageS3Upload";
import { ResponseStatus } from "../contrants/statusCodesEnus";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export class VideoController {
    private _interactor: IVideoInteractor;

    constructor(interactor: IVideoInteractor) {
        this._interactor = interactor;
    }

    async showVideos(req: Request, res: Response) {
        try {
            //console.log("just got in");
            const userId = req.query.userId as string | undefined;
            const videos = await this._interactor.getVideos(userId);
            res.status(ResponseStatus.OK).json({ videos });
        } catch (error) {
            console.error("Error in getVideos controller:", error);
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }
    async showShorts(req: Request, res: Response) {
        try {
            //console.log("just got int");

            const videos = await this._interactor.getShorts();

            res.status(ResponseStatus.OK).json({ videos });
        } catch (error) {
            console.error("Error in getVideos controller:", error);
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async getVideoById(req: Request, res: Response) {
        try {
            const videoId = req.params.id
            //console.log("videos for id", videoId);

            if (!videoId) {
                return res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
            }

            const video = await this._interactor.findVideoById(videoId);
            //console.log("videos for id", video);

            if (!video) {
                return res.status(ResponseStatus.BadRequest).json({ message: "video not found" })
            }

            return res.status(ResponseStatus.OK).json({ video })

        } catch (error) {

        }
    }

    async addToWatchHistory(req: Request, res: Response) {
        try {
            const { videoId, userId } = req.body;
            //console.log("videos for id histry", videoId, userId);

            if (!videoId || !userId) {
                return res.status(ResponseStatus.BadRequest).json({ message: "Video ID and User ID are required" });
            }

            const result = await this._interactor.addToWatchHistory(videoId, userId);

            if (result) {
                res.status(ResponseStatus.OK).json({ message: "Added to watch history" });
            } else {
                res.status(404).json({ message: "Video or user not found" });
            }
        } catch (error) {
            console.error("Error in addToWatchHistory controller:", error);
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async getWatchHistory(req: Request, res: Response) {
        try {
            const userId = req.params.id; // Assuming you have user authentication middleware
            //console.log("whatc user", userId)

            if (!userId) {
                return res.status(401).json({ message: "User not authenticated" });
            }

            const watchHistory = await this._interactor.getWatchHistory(userId);

            res.status(ResponseStatus.OK).json({ watchHistory });
        } catch (error) {
            console.error("Error in getWatchHistory controller:", error);
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async getRecommendedVideos(req: Request, res: Response) {
        try {
            const categoryId = req.params.categoryId;
            //console.log("Category ID in controller:", categoryId);

            if (!categoryId) {
                return res.status(ResponseStatus.BadRequest).json({ message: "Missing categoryId" });
            }

            const videos = await this._interactor.getRecommendedVideos(categoryId);
            res.status(ResponseStatus.OK).json(videos);
        } catch (error) {
            console.error("Error in getRecommendedVideos controller:", error);
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async onListUnlist(req: Request, res: Response) {
        try {
            const videoId = req.body.videoId



            const list = await this._interactor.listUnlist(videoId)



            //console.log("list is also done")
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
                return res.status(404).json({ message: 'Video not found or not authorized' });
            }
            //console.log("update is also done")
            return res.status(ResponseStatus.OK).json({ message: "Video updated successfully", video: updatedVideo });


        } catch (error) {

        }
    }
    async updateShorts(req: Request, res: Response) {
        try {
            const { videoId, title, category } = req.body;
            //console.log("Updating video:", videoId, title, category);

            if (!videoId || !title || !category) {
                return res.status(ResponseStatus.BadRequest).json({ message: 'Missing required fields' });
            }

            const updatedVideo = await this._interactor.updateShorts(videoId, title, category);
            if (!updatedVideo) {
                return res.status(404).json({ message: 'Video not found or not authorized' });
            }
            //console.log("update is also done")
            return res.status(ResponseStatus.OK).json({ message: "Video updated successfully", video: updatedVideo });


        } catch (error) {

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

            const { name, description, category, channelId, thumbnail } = req.body;

            //console.log("Video details:", { name, description, category, channelId, thumbnail });

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
            //console.log("object", savedVideo);


            if (savedVideo) {
                return res.status(ResponseStatus.OK).json({ message: "Video uploaded successfully", video: savedVideo });
            } else {
                return res.status(ResponseStatus.BadRequest).json({ message: "Error while saving video to database" });
            }
        } catch (error) {
            console.error("Server error in uploadVideo:", error);
            next(error);
        }
    }
    async uploadShorts(req: Request, res: Response, next: NextFunction) {
        try {
            //console.log("File is:", req.file);

            if (!req.file || !req.file.mimetype.startsWith("video/")) {
                return res
                    .status(ResponseStatus.BadRequest)
                    .json({ message: "Invalid file type. Please upload a video file." });
            }

            const { name, description, category, channelId, thumbnail } = req.body;

            //console.log("Video details:", { name, description, category, channelId, thumbnail });

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

            const savedVideo = await this._interactor.saveShort(videoData);
            //console.log("object", savedVideo);


            if (savedVideo) {
                return res.status(ResponseStatus.OK).json({ message: "Video uploaded successfully", video: savedVideo });
            } else {
                return res.status(ResponseStatus.BadRequest).json({ message: "Error while saving video to database" });
            }
        } catch (error) {
            console.error("Server error in uploadVideo:", error);
            next(error);
        }
    }
    async uploadVideoToPlaylist(req: Request, res: Response, next: NextFunction) {
        try {
            //console.log("File is:", req.file);

            if (!req.file || !req.file.mimetype.startsWith("video/")) {
                return res
                    .status(ResponseStatus.BadRequest)
                    .json({ message: "Invalid file type. Please upload a video file." });
            }

            const { name, description, channelId, playlistId } = req.body;

            //console.log("Video details:", { name, description, channelId, playlistId });

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

            // Save video details to database and add to playlist
            const videoData = {
                url: uploadResult.success,
                name,
                description,
                channelId,
                playlistId
            };

            const savedVideo = await this._interactor.saveVideoToPlaylist(videoData);
            //console.log("Saved video:", savedVideo);

            if (savedVideo) {
                return res.status(ResponseStatus.OK).json({ message: "Video uploaded and added to playlist successfully", video: savedVideo });
            } else {
                return res.status(ResponseStatus.BadRequest).json({ message: "Error while saving video to database or adding to playlist" });
            }
        } catch (error) {
            console.error("Server error in uploadVideoToPlaylist:", error);
            next(error);
        }
    }

    async getAllPlaylists(req: Request, res: Response) {
        try {
            const playlists = await this._interactor.getAllPlaylists();
            res.status(ResponseStatus.OK).json({ playlists });
        } catch (error) {
            console.error("Error in getAllPlaylists controller:", error);
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async getPlaylistVideos(req: Request, res: Response, next: NextFunction) {
        try {
            const playlistId = req.params.playlistId;
            const channelId = req.query.channelId;

            // Validate playlistId
            if (!playlistId || typeof playlistId !== 'string') {
                return res.status(ResponseStatus.BadRequest).json({ message: "Invalid playlistId" });
            }

            // Validate channelId
            if (!channelId || typeof channelId !== 'string') {
                return res.status(ResponseStatus.BadRequest).json({ message: "Invalid channelId" });
            }

            console.log("Playlist Id", playlistId);
            console.log("Channel Id", channelId);

            const videos = await this._interactor.getPlaylistVideos(playlistId, channelId);

            if (videos && videos.length > 0) {
                return res.status(ResponseStatus.OK).json({ videos });
            } else {
                return res.status(404).json({ message: "Playlist not found or has no videos" });
            }
        } catch (error) {
            console.error("Server error in getPlaylistVideos:", error);
            next(error);
        }
    }

    async togglePlaylistVisibility(req: Request, res: Response, next: NextFunction) {
        try {
            const { playlistId } = req.params;
            const result = await this._interactor.togglePlaylistVisibility(playlistId);
            return res.status(ResponseStatus.OK).json(result);
        } catch (error) {
            console.error("Server error in togglePlaylistVisibility:", error);
            next(error);
        }
    }





    createPlaylist = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, description, isPublic, channelId, category } = req.body;
            const file = req.file as Express.Multer.File | undefined;

            // Validate input
            if (!name || !channelId) {
                return res.status(ResponseStatus.BadRequest).json({ message: "Name and channelId are required" });
            }

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
            //console.log("beofre crate palyist ", category)
            const newPlaylist = await this._interactor.createPlaylist(
                name,
                description,
                isPublic === 'true',
                channelId,
                uploadResult.success,
                category
            );

            return res.status(ResponseStatus.OK).json({
                message: "Playlist created successfully",
                playlist: newPlaylist
            });

        } catch (error) {
            console.error("Server error in createPlaylist:", error);
            next(error);
        }
    }
    async updatePlaylist(req: Request, res: Response, next: NextFunction) {
        try {
            const { playlistId, name, description } = req.body;
            const file = req.file;

            let thumbnailUrl;
            if (file) {
                const uploadResult = await uploadS3Image(file);
                if (uploadResult.error) {
                    return res.status(ResponseStatus.BadRequest).json({ message: "Error uploading to S3", error: uploadResult.msg });
                }
                thumbnailUrl = uploadResult.success;
            }

            const updatedPlaylist = await this._interactor.updatePlaylist(
                playlistId,
                name,
                description,
                thumbnailUrl
            );

            return res.status(ResponseStatus.OK).json({
                message: "Playlist updated successfully",
                playlist: updatedPlaylist
            });

        } catch (error) {
            console.error("Server error in updatePlaylist:", error);
            next(error);
        }
    }

    async deletePlaylist(req: Request, res: Response, next: NextFunction) {
        try {
            const { playlistId } = req.params;

            await this._interactor.deletePlaylist(playlistId);

            return res.status(ResponseStatus.OK).json({
                message: "Playlist deleted successfully"
            });

        } catch (error) {
            console.error("Server error in deletePlaylist:", error);
            next(error);
        }
    }

    async deleteVideo(req: Request, res: Response) {
        const videoId = req.params.id;
        if (!videoId) {
            return res.status(ResponseStatus.BadRequest).json({ message: "Invalid Id " })
        }

        const video = await this._interactor.findVideoById(videoId)
        const deleteVideo = await this._interactor.findVideoAndDelete(videoId)

        if (!deleteVideo) {
            return res.status(ResponseStatus.BadRequest).json({ message: "Erro while deletion" });
        }

        return res.status(ResponseStatus.OK).json({ message: "deletion Successfull" })

    }
    async deleteShorts(req: Request, res: Response) {
        const shortsId = req.params.id;
        if (!shortsId) {
            return res.status(ResponseStatus.BadRequest).json({ message: "Invalid Id " })
        }

        const video = await this._interactor.findVideoById(shortsId)
        const deleteVideo = await this._interactor.findShortAndDelete(shortsId)

        if (!deleteVideo) {
            return res.status(ResponseStatus.BadRequest).json({ message: "Erro while deletion" });
        }

        return res.status(ResponseStatus.OK).json({ message: "deletion Successfull" })

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

    async likeVideo(req: Request, res: Response) {
        try {
            const videoId = req.body.videoId
            const userId = req.body.userId; // Assuming your authMiddleware attaches the user to the 

            //console.log("videoIdss", videoId, userId);
            const result = await this._interactor.likeVideo(videoId, userId);
            //console.log("ikeVideo", result);
            res.status(ResponseStatus.OK).json(result);
        } catch (error) {
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }
    // similar methods for unlike, dislike, undis


    async getLikeStatus(req: Request, res: Response) {
        try {
            const { videoId, userId } = req.query;
            //console.log("status ", videoId, userId);

            if (!videoId || !userId) {
                return res.status(ResponseStatus.BadRequest).json({ message: "Video ID and User ID are required" });
            }

            const status = await this._interactor.getLikeStatus(videoId as string, userId as string);
            //console.log("unlVideo", status);
            res.status(ResponseStatus.OK).json(status);
        } catch (error: any) {
            console.error("Error in getLikeStatus controller:", error);
            if (error.message === 'Video not found') {
                res.status(404).json({ message: "Video not found" });
            } else {
                res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
            }
        }
    }
    async unlikeVideo(req: Request, res: Response) {
        try {
            const videoId = req.body.videoId;
            const userId = req.body.userId;
            //console.log("unlikeVideo", videoId, userId);
            const result = await this._interactor.unlikeVideo(videoId, userId);
            //console.log("unlikeVideo", result);
            res.status(ResponseStatus.OK).json(result);
        } catch (error) {
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async dislikeVideo(req: Request, res: Response) {
        try {
            const videoId = req.body.videoId;
            const userId = req.body.userId;
            //console.log("dislikeVideo", videoId, userId);
            const result = await this._interactor.dislikeVideo(videoId, userId);
            res.status(ResponseStatus.OK).json(result);
            //console.log("dislikeVideo", result);
        } catch (error) {
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async undislikeVideo(req: Request, res: Response) {
        try {
            const videoId = req.body.videoId;
            const userId = req.body.userId;
            //console.log("undislikeVideo", videoId, userId);
            const result = await this._interactor.undislikeVideo(videoId, userId);
            res.status(ResponseStatus.OK).json(result);
            //console.log("disun", result);
        } catch (error) {
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async incrementView(req: Request, res: Response) {
        try {
            const videoId = req.body.id;
            //console.log("forviwews", videoId);

            const result = await this._interactor.incrementView(videoId);
            res.status(ResponseStatus.OK).json(result);
        } catch (error) {
            console.error("Error in incrementView controller:", error);
            res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
    }

    async addComment(req: Request, res: Response) {
        try {
          const { videoId,  comment,userId } = req.body;
          const result = await this._interactor.addComment(videoId, userId, comment);
          res.status(ResponseStatus.OK).json(result);
        } catch (error) {
          console.error("Error in addComment controller:", error);
          res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
      }
    async deleteComment(req: Request, res: Response) {
        try {
          const videoId=req.body.videoId
          const commentId=req.body.commentId
          console.log("for deletion videoId",videoId);
          console.log("for deletion commentId",commentId);
          
          const result = await this._interactor.deleteComment(videoId, commentId);
          res.status(ResponseStatus.OK).json(result);
        } catch (error) {
          console.error("Error in addComment controller:", error);
          res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
      }
    
      async getComments(req: Request, res: Response) {
        try {
          const videoId  = req.params.videoId;
          console.log("loading comms",videoId)
          const comments = await this._interactor.getComments(videoId);
          res.status(ResponseStatus.OK).json(comments);
        } catch (error) {
          console.error("Error in getComments controller:", error);
          res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
        }
      }



}
