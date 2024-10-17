    import { Router } from "express";

    import { ChannelController } from "../controllers/ChannelController";
    import { channelRepository } from "../repositories/ChannelRepository";
    import { channelInteractor } from "../interactors/ChannelInteractor";
    import { upload } from "../utils/multer";
    import singleVideoUpload from "../utils/videoMulter";

    const router = Router();

    const repository = new channelRepository();
    const interactor = new channelInteractor(repository);
    const controller = new ChannelController(interactor);

    router.get('/getChannels',controller.getChannels.bind(controller))
    router.get('/getChannelById/:id',controller.getChannelById.bind(controller))
    router.post('/subscribe', controller.subscribeToChannel.bind(controller));
    router.get('/videos/:channelId', controller.getChannelVideos.bind(controller));
    router.get('/shorts/:channelId', controller.getChannelShorts.bind(controller));
    router.get('/playlists/:channelId', controller.getChannelPlaylists.bind(controller));
    router.get('/checkSubscription/:channelId/:userId', controller.checkSubscriptionStatus.bind(controller));
    router.post('/unsubscribe', controller.unsubscribeFromChannel.bind(controller));
    router.post('/verifySuperUserPayment', controller.verifySuperUserPayment.bind(controller));
    router.put('/updateName/:id',controller.updateChannelName.bind(controller));
    router.put('/updateProfilePic/:id', upload.single('profilePic'), controller.updateProfilePic.bind(controller));
    router.put('/updateBanner/:id', upload.single('banner'), controller.updateBanner.bind(controller));
    router.get('/getChannelData/:userId', controller.getChannelData.bind(controller));
    router.post('/startLive', controller.startLive.bind(controller));
    router.post('/stopLive', controller.stopLive.bind(controller));
    



export default router