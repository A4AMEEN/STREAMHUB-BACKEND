import { Category } from "../../entities/category";
import { User } from "../../entities/User";
import { ChannelDocument } from "../../model/channelModel";

export interface IAdminRepository {
  restrictChannel(channelId: string): Promise<ChannelDocument | string>;
  getCategories(): Promise<Category[]>;
  showChannels():Promise<ChannelDocument[] | string>;
  addCategory(name: string): Promise<{ success: boolean; message: string }>;  
  getUsers(): Promise<User[] | null>;
  blockUser(id: string): Promise<{update:boolean,user:User|null}>;
  updateCategory(id: string, name: string): Promise<{ success: boolean; message: string }>; 
  deleteCategory(id: string): Promise<{ success: boolean; message: string }>;

}