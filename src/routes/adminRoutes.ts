import { Router } from 'express';
import { AdminRepository } from '../repositories/AdminRepository'; 
import { AdminInteractor } from '../interactors/AdminInteractor';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware';

const router=Router()

const repository= new AdminRepository()
const interactor =new AdminInteractor(repository)
const controller = new AdminController(interactor)
router.use(authMiddleware);
// router.use(adminAuthMiddleware);

router.get('/users',adminAuthMiddleware,controller.getUsers.bind(controller))
router.get('/getChannels',adminAuthMiddleware,controller.getChannels.bind(controller))
router.put('/restrictchannel/:id', adminAuthMiddleware, controller.onRestrictChannel.bind(controller))
router.put('/blockuser/:id',adminAuthMiddleware,controller.onBlockUser.bind(controller))
router.post('/addCategory',adminAuthMiddleware,controller.addCategory.bind(controller))
router.get('/categories',controller.getCategory.bind(controller))
router.put('/updateCategory/:id',adminAuthMiddleware,controller.updateCategory.bind(controller));
router.delete('/deleteCategory/:id',adminAuthMiddleware,controller.deleteCategory.bind(controller));



export default router