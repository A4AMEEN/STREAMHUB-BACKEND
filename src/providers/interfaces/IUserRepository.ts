// import  {userSchema}  from '../../model/userModel';
// import { User } from '../../entities/User';

import { Channel } from "../../entities/channel";
import { User } from "../../entities/Admin"
import { UserDocument } from "../../model/userModel";
import { ChannelDocument } from "../../model/channelModel";

// class UserRepository {
//   async createUser(user: User): Promise<User> {
//     const newUser = new userSchema(user);
//     return await newUser.save();
//   }

//   async findUserByEmail(email: string): Promise<User | null> {
//     return await userSchema.findOne({ email }).exec();
//   }
 
// }

// export default new UserRepository();
export interface IuserRepository{
  authChannel(data: User): String | ChannelDocument | PromiseLike<String | ChannelDocument>;
    verifyOtp(otp: number): string | Boolean | PromiseLike<string | Boolean>;
    jwt(payload: User): string | Promise<string>;
    refresh(payload: User): string | Promise<string>;
    isAdmin(email: string,password:string):Promise<string|Boolean>;
    isUser(email: string,password:string):Promise<string|Boolean>
    mailExist(email:string):Promise<User|boolean>
    userData(email:string):Promise<User>
    createUser(name:string,email:string,password:string):Promise<string|UserDocument>
    createChannel(data:User):Promise<ChannelDocument | string>
    showChannel(data:User):Promise<String|ChannelDocument>
    showChannels():Promise<ChannelDocument[] | string>;
    sendOtpEmail(email: string, otp: string): Promise<void>;
    verifyOtp(otp:number):Promise<string|Boolean>
    getUserById(userId: string): Promise<any>;
  updateUser(user: any): Promise<void>;
  forgotPassword(email: string, newPassword: string): Promise<void>;
}
