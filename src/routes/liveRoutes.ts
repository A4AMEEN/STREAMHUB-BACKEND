import {Router} from 'express'
import { LiveController } from '../controllers/LiveController'
import { LiveRepository } from '../repositories/LiveRepositry'
import { LiveInteractor } from '../interactors/LiveInteractor'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const repository = new LiveRepository();
const interactor = new LiveInteractor(repository);
const controller = new LiveController(interactor)

// router.put('/updatestartliveinfo/:roomId',controller.onUpdateStartLiveInfo.bind(controller))
// router.put('/updatestopliveinfo',authMiddleware,controller.onUpdateStopLiveInfo.bind(controller))
export default router