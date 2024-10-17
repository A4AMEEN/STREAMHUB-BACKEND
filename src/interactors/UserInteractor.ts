// import UserRepository from '../repositories/UserRepository'; // Assuming UserRepository is exported as a class
// import { validateEmail } from '../utils/validateEmail'; // Import email validation utility
import { Channel } from "../entities/channel";
import { User } from "../entities/Admin";
import { UserDocument } from "../model/userModel";
import { IuserInteractor } from "../providers/interfaces/IUserInteractor";
import { IuserRepository } from "../providers/interfaces/IUserRepository";
import jwt from "jsonwebtoken";
import { ChannelDocument } from "../model/channelModel";

// export class UserInteractor {
//   private userRepository: typeof UserRepository; // Use typeof for class type

//   constructor(userRepository:typeof UserRepository) { // Dependency injection (optional)
//     this.userRepository = userRepository;
//   }

//   async signup(user: any): Promise<User | string> {
//     if (!validateEmail(user.email)) {
//       return 'Invalid email format';
//     }

//     const existingUser = await this.userRepository.findUserByEmail(user.email);
//     if (existingUser) {
//       return 'User already exists';
//     }

//     // Remove confirmPassword from user data before saving (assuming it's not persisted)
//     delete user.confirmPassword;

//     return this.userRepository.createUser(user);
//   }
// }


export class userInteractor implements IuserInteractor{
  private repository:IuserRepository
  constructor(private _repository:IuserRepository) {
    this.repository=_repository
  }
  

  async isAdmin(email:string): Promise<string|Boolean>{
    try {
      
      return await this._repository.isAdmin(email)
    } catch (error) {
      throw new Error("Method not implemented.");
    }
    
  }
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      return await this._repository.sendOtpEmail(email,otp)
      
    } catch (error) {
      
    }
    throw new Error("Method not implemented.");
  }
  async verifyOtp(otp:number):Promise<string|Boolean>{
    return await this.repository.verifyOtp(otp)
  }
  mailCheck(email: string, password: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  isUser=async(email: string,password:string): Promise<string|Boolean> =>{
    try {
       return await this._repository.isUser(email,password);
    } catch (error) {
      throw error
    }
  }
  jwt = async (payload: User): Promise<string> => {
    try {
      return await this._repository.jwt(payload);
    } catch (error) {
      console.error("Error in jwt:", error);
      throw error;
    }
  };
  refresh = async (payload: User): Promise<string> => {
    try {
      return await this._repository.refresh(payload);
    } catch (error) {
      console.error("Error in jwt:", error);
      throw error;
    }
  };
  userData=async(email: string): Promise<User> =>{
    try {
      return await this._repository.userData(email)
    } catch (error) {
      throw error
    }
  }
  createUser=async(name:string,email:string,password:string): Promise<string|UserDocument> =>{
    try {
      return await this._repository.createUser(name,email,password)
    } catch (error) {
      throw error
      
    }
  }
  createChannel = async(data:User):Promise<ChannelDocument | string>=>{
    try {

      return await this._repository.createChannel(data)
      
    } catch (error) {
      console.log(error);
      return "false"
      
    }
  }

  showChannel = async(data:User):Promise<|String|ChannelDocument>=>{
    try{

      return await this._repository.showChannel(data)

    }
    catch{
      return "error "

    }
  }
  
  showChannels = async():Promise<ChannelDocument[] | string>=>{
    try {
      return await this._repository.showChannels()
      
    } catch (error) {
      return "error "
    }
  }
  mailExist=async(email: string): Promise<User|boolean> =>{
    try {
      return await this._repository.mailExist(email)
    } catch (error) {
      throw error
    }
  }

  async getUserById(userId: string): Promise<any> {
    return this._repository.getUserById(userId);
  }

  async updateUser(user: any): Promise<void> {
    await this._repository.updateUser(user);
  }

  async forgotPassword(email: string, newPassword: string): Promise<void> {
    try {
      console.log("gooing");
      
      await this._repository.forgotPassword(email, newPassword);
    } catch (error) {
      throw new Error('Error in user interactor while resetting password');
    }
  }
  


}