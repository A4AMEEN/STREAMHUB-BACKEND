import { Router } from "express";
import { VideoController } from "../controllers/VideoController";
import { VideoRepository } from "../repositories/VideoRepository";
import { VideoInteractor } from "../interactors/VideoInerator";
import { upload } from "../utils/multer";
import singleVideoUpload from "../utils/videoMulter";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const repository = new VideoRepository();
const interactor = new VideoInteractor(repository);
const controller = new VideoController(interactor);

router.post('/uploadVideo', singleVideoUpload.single('video'), controller.uploadVideo.bind(controller)
);
router.post('/uploadShort', singleVideoUpload.single('video'), controller.uploadShorts.bind(controller)
);
router.post('/create', upload.single('thumbnail'), controller.createPlaylist.bind(controller));
router.put('/togglePlaylistVisibility/:playlistId', controller.togglePlaylistVisibility.bind(controller));
router.post('/uploadVideoToPlaylist', singleVideoUpload.single('video'), controller.uploadVideoToPlaylist.bind(controller));
router.put('/updatePlaylist', upload.single('thumbnail'), controller.updatePlaylist.bind(controller));
router.delete('/deletePlaylist/:playlistId', controller.deletePlaylist.bind(controller));
router.get('/playlistVideo/:playlistId/', controller.getPlaylistVideos.bind(controller));
router.get('/playlists', controller.getAllPlaylists.bind(controller));
router.get('/all', controller.showVideos.bind(controller))
router.get('/allShorts', controller.showShorts.bind(controller))
router.get('/video/:id', controller.getVideoById.bind(controller))
router.get('/recommended/:categoryId', controller.getRecommendedVideos.bind(controller));
router.put('/listUnlist', controller.onListUnlist.bind(controller))
router.put('/updateVideo', controller.updateVideo.bind(controller))
router.put('/updateShorts', controller.updateShorts.bind(controller))
router.delete('/delete/:id', controller.deleteVideo.bind(controller))
router.delete('/deleteShorts/:id', controller.deleteShorts.bind(controller))
router.post(':id', authMiddleware, controller.likeVideo.bind(controller));
router.post('/like', authMiddleware, controller.likeVideo.bind(controller));
router.get('/likeStatus', authMiddleware, controller.getLikeStatus.bind(controller))
router.post('/unlike', authMiddleware, controller.unlikeVideo.bind(controller));
router.post('/dislike', authMiddleware, controller.dislikeVideo.bind(controller));
router.post('/undislike', authMiddleware, controller.undislikeVideo.bind(controller));
router.post('/view', controller.incrementView.bind(controller));
router.post('/watch-history', controller.addToWatchHistory.bind(controller));
router.post('/comment', authMiddleware, controller.addComment.bind(controller));
router.post('/deleteComment', authMiddleware, controller.deleteComment.bind(controller));
router.get('/getComments/:videoId', controller.getComments.bind(controller));
router.get('/watch-History/:id', controller.getWatchHistory.bind(controller));
//  router.post('/unlike/:id', authMiddleware, controller.unlikeVideo.bind(controller));
//  router.post('/dislike/:id', authMiddleware, controller.dislikeVideo.bind(controller));
//  router.post('/undislike/:id', authMiddleware, controller.undislikeVideo.bind(controller));
//  router.get('/likeStatus/:id', authMiddleware, controller.getLikeStatus.bind(controller));



export default router;
