import { Channel } from "../../entities/channel";
import { User } from "../../entities/Admin"
import { UserDocument } from "../../model/userModel"
import { ChannelDocument } from "../../model/channelModel";

export interface IuserInteractor{
    isAdmin(email: string):Promise<string|Boolean>
    isUser(email: string,password:string): Promise<string|Boolean>
    jwt(payload: User): string | Promise<string>;
    refresh(payload: User): string | Promise<string>;
    mailExist(email:string):Promise<User|boolean>;
    userData(email:string):Promise<User>;
    createUser(name:string,email:string,password:string,isblocked?: boolean):Promise<string|UserDocument>
    createChannel(data:User):Promise<ChannelDocument | string>
    showChannel(data:User):Promise<String|ChannelDocument>;
    showChannels():Promise<ChannelDocument[] | string>;
    sendOtpEmail(email: string, otp: string): Promise<void>;
    verifyOtp(otp:number):Promise<string|Boolean>
    getUserById(userId: string): Promise<any>;
    updateUser(user: any): Promise<void>;
    forgotPassword(email: string, newPassword: string): Promise<void>;
}
