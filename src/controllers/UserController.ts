import { NextFunction, Request, Response } from 'express';
import { IuserInteractor } from '../providers/interfaces/IUserInteractor';
import { ResponseStatus } from '../contrants/statusCodesEnus';
import { comparePassword, hashPassword } from '../utils/validPassword';
interface OtpData {
  otp: string;
  expiry: number;
}

const otpStore: { [email: string]: OtpData } = {};
const tempUserStore: { [email: string]: { name: string, email: string, password: string } } = {};


export class UserController {
  bind(controller: UserController): import("express-serve-static-core").RequestHandler<{}, any, any, import("qs").ParsedQs, Record<string, any>> {
    throw new Error('Method not implemented.');
  }
  private userInteractor: IuserInteractor
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }



  constructor(private _interactor: IuserInteractor) {
    this.userInteractor = _interactor
  }

  async signup(req: Request, res: Response) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!req.body) {
        return res.status(ResponseStatus.BadRequest).json({ message: "No User Data Provided" });
      }

      const user = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
      };

      if (!user.password || !user.email) {
        return res.status(ResponseStatus.BadRequest).json({ message: "password or email is required" });
      }

      const isMailExist = await this._interactor.mailExist(user.email);

      if (isMailExist) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Mail already Exists please Login" });
      } else {
        // Generate and send OTP
        const hashedPassword = await hashPassword(user.password)
        const otp = this.generateOTP();
        otpStore[email] = {
          otp,
          expiry: Date.now() + 60 * 1000 // OTP valid for 60 seconds
        };

        await this._interactor.sendOtpEmail(email, otp);

        // Store user details temporarily
        tempUserStore[email] = { name, email, password:hashedPassword };
        console.log('hashword',tempUserStore[email])
        console.log('hashwords',password)
        

        res.status(ResponseStatus.OK).json({ message: "OTP sent successfully", email });
      }
    } catch (error) {
      res.status(ResponseStatus.BadRequest).json({ error });
    }
  }
  async verifyOtpAndCreateUser(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      console.log("otp store and otp", otpStore[email], otp);

      const otpData = otpStore[email];
      if (!otpData || otpData.otp !== otp) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Invalid OTP" });
      }

      if (Date.now() > otpData.expiry) {
        delete otpStore[email];
        return res.status(ResponseStatus.BadRequest).json({ message: "OTP has expired" });
      }

      const userData = tempUserStore[email];
      if (!userData) {
        return res.status(ResponseStatus.BadRequest).json({ message: "User data not found" });
      }

      const createUser = await this._interactor.createUser(userData.name, userData.email, userData.password);

      if (!createUser) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Error while insertion" });
      }

      const userdata = await this._interactor.userData(email);
      const createServer = await this._interactor.createChannel(userdata);

      // Clean up temporary storage
      delete otpStore[email];
      delete tempUserStore[email];

      res.status(ResponseStatus.OK).json({ userdata, message: "User created successfully" });
    } catch (error) {
      res.status(ResponseStatus.BadRequest).json({ error });
    }
  }


  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(ResponseStatus.BadRequest).json({ message: 'Email and password are required' });
      }

      console.log("uszzzzzzzzzzzz",email);
      const userdata = await this._interactor.userData(email);
     
      
      if (!userdata) {
        return res.status(ResponseStatus.Unauthorized).json({ message: "Invalid email or password" });
      }

      if (userdata.isblocked) {
        return res.status(ResponseStatus.Unauthorized).json({ message: "This user is blocked. Please contact @Admin" });
      }

      let isPasswordValid;
      const isAdmin = await this._interactor.isAdmin(email,password);

      if (isAdmin && password === "admin@123") {
        isPasswordValid = true;
      } else if (userdata.password.startsWith('$2b$') || userdata.password.startsWith('$2a$')) {
        // Password is already hashed
        isPasswordValid = await comparePassword(password, userdata.password);
      } else {
        // Password is still in plain text
        isPasswordValid = password === userdata.password;
        if (isPasswordValid) {
          // If login is successful, hash the password and update the user record
          const hashedPassword = await hashPassword(password);
          userdata.password=hashedPassword
          console.log("userdata",userdata);
          
          await this._interactor.updateUser(userdata);
        }
      }

      if (!isPasswordValid) {
        return res.status(ResponseStatus.Unauthorized).json({ message: "Invalid email or password" });
      }
console.log("tilll here");

      const token = await this._interactor.jwt(userdata);
      const refreshToken = await this._interactor.refresh(userdata);
      const channel = await this._interactor.showChannel(userdata);

      if (isAdmin) {
        return res.status(ResponseStatus.OK).json({ message: "Admin", token, userdata, channel });
      }

      res.status(ResponseStatus.OK).json({ message: "Login Successful", token, refreshToken, userdata, channel });
    } catch (error) {
      res.status(ResponseStatus.BadRequest).json({ message: "An error occurred during login", error });
    }
  }
  
    // ... other methods remain the same
  

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Refresh token is missing" });
      }
      const newAccessToken = refreshToken;
      console.log("token changed", newAccessToken);
      res.status(ResponseStatus.OK).json({
        accessToken: newAccessToken,
        message: "Token refreshed",
      });
    } catch (error) {
      next(error);
    }
  };

  
  async sendOtp(req: Request, res: Response) {

    try {
      console.log("get it insiddde");

      const email = req.body.email;
      console.log("eemail", email);

      const isMailExist = await this._interactor.mailExist(email)
      console.log("MailingExist", isMailExist);

      if (!isMailExist) {
        return res.status(ResponseStatus.Unauthorized).json({ Message: "Entered Email is either not valid or Dosent Exists" })
      }
      const otp = this.generateOTP();
      otpStore[email] = {
        otp: this.generateOTP(),
        expiry: Date.now() + 60 * 1000 
      };
      console.log("login", otp);
      console.log("login", otpStore);

      const otpSend = await this._interactor.sendOtpEmail(email, otp)
      console.log("sendWith", otpSend);
      return res.status(ResponseStatus.OK).json({ message: "Otp Send Successfully", email, otp })

    } catch (error) {

    }
  }

  async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      console.log("Resending OTP for email:", email);
  
      const isMailExist = await this._interactor.mailExist(email);
      if (!tempUserStore[email]) {
        return res.status(ResponseStatus.BadRequest).json({ message: "No pending signup found for this email. Please start the signup process again." });
      }
  
      const otp = this.generateOTP();
      otpStore[email] = {
        otp: otp,
        expiry: Date.now() + 60 * 1000 
      };
  
      const otpSend = await this._interactor.sendOtpEmail(email, otp);
      console.log("Resent OTP:", otpSend);
  
      return res.status(ResponseStatus.OK).json({ message: "OTP resent successfully", email });
    } catch (error) {
      console.error("Error resending OTP:", error);
      return res.status(ResponseStatus.BadRequest).json({ message: "Failed to resend OTP" });
    }
  }


  

  async verify(req: Request, res: Response) {
    console.log("insdddie");

    try {
      const { email, otp } = req.body;
      const storedOtp = otpStore[email];
      console.log("from user", email, otp);


      if (!storedOtp || storedOtp.otp !== otp) {
        console.log("Invalid OTP", storedOtp);
        return res.status(ResponseStatus.Unauthorized).json({ message: "Invalid OTP" });
      }
      console.log("successss");


      delete otpStore[email]; // Clear OTP after verification
      res.status(ResponseStatus.OK).json({ message: "OTP verified successfully" });
    } catch (error) {
      res.status(ResponseStatus.BadRequest).json({ message: "Error verifying OTP", error });
    }
  }

  resetPassword = async (req: Request, res: Response) => {
    const { userId, oldPassword, newPassword } = req.body;
    console.log("User ID:", userId);
    console.log("Old Password:", oldPassword);
    console.log("New Password:", newPassword);

    try {
        const user = await this._interactor.getUserById(userId);
        console.log("User:", user);
        if (!user) {
            return res.status(ResponseStatus.NotFound).json({ message: 'User not found' });
        }

        // Check if the old password is valid
        let isOldPasswordValid;
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            // Old password is hashed
            isOldPasswordValid = await comparePassword(oldPassword, user.password);
        } else {
            // Old password is in plain text (not recommended for production)
            isOldPasswordValid = oldPassword === user.password;
        }

        if (!isOldPasswordValid) {
            return res.status(ResponseStatus.BadRequest).json({ message: 'Old password is incorrect' });
        }

        // Hash the new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update the user's password
        user.password = hashedNewPassword;

        await this._interactor.updateUser(user);

        return res.status(ResponseStatus.OK).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(ResponseStatus.BadRequest).json({ message: 'An error occurred while changing the password' });
    }
};


  async forgotPassword(req: Request, res: Response) {
    const { email, newPassword } = req.body;
    console.log("emailsss", email, newPassword);

    try {
      const hashedNewPassword = await hashPassword(newPassword);
      await this._interactor.forgotPassword(email, hashedNewPassword);
      res.status(ResponseStatus.OK).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.log("error");
      // Pass error to error handling middleware
    }
  }

  // googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     console.log("user data");
  //     if (req.user) {
  //       const message = "Google Authentication Success";
  //       const user = JSON.stringify(req.user);
  //       const { googleId, username, email } = JSON.parse(user);

  //       const token = await this._interactor.googleUserToken(
  //         googleId,
  //         username,
  //         email
  //       );
  //       console.log("token", token);
  //       res.cookie("authResponse", JSON.stringify({ message, user, token }));
  //      return res.redirect("http://localhost:4200/login");
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // };




}
