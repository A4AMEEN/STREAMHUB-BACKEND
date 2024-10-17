import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserRepository } from '../repositories/UserRepository';
import { userInteractor } from '../interactors/UserInteractor';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import passport from 'passport';

const router = Router();

const repository=new UserRepository()
const interactor=new userInteractor(repository)
const controller=new UserController(interactor)

router.get("/google",    passport.authenticate("google", { scope: ["profile", "email"] })
  );

router.post('/signup', controller.signup.bind(controller));
router.post('/login', controller.login.bind(controller));
router.post('/send-otp',controller.sendOtp.bind(controller))
router.post('/resend-otp', controller.resendOtp.bind(controller));
router.post('/otpSignup', controller.verifyOtpAndCreateUser.bind(controller));
router.post('/refresh-token', controller.refreshToken.bind(controller));
router.post('/verify-otp',controller.verify.bind(controller))
router.post('/reset-password', authMiddleware,controller.resetPassword.bind(controller));
router.post('/forgot-password',controller.forgotPassword.bind(controller)); 




export default router;
