import { Category, CategoryResponse } from "../entities/category";
import { User } from "../entities/User";
import { ChannelDocument } from "../model/channelModel";
import { IAdminRepository } from "../providers/interfaces/IAdminRepository";

export class AdminInteractor implements IAdminRepository {
    private _repository: IAdminRepository;
  constructor(repository: IAdminRepository) {
    this._repository = repository;
  }
  
  blockUser = async (id: string): Promise<{update:boolean,user:User|null}> => {
    try {
      return this._repository.blockUser(id);
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  };
  
  
  

  getUsers = async (): Promise<User[] | null> => {
    try {
      return this._repository.getUsers();
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  };

  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this._repository.getCategories();
      return categories.map(category => ({
        name: category.name,
        _id: category._id
      }));
    } catch (error) {
      console.error("Error in interactor while fetching categories:", error);
      throw error;
    }
  }

  addCategory = async (name: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await this._repository.addCategory(name);
      if (result) {
        return { success: true, message: "Category added successfully" };
      } else {
        return { success: false, message: "Category already exists" };
      }
    } catch (error) {
      console.error("Error in interactor while adding category:", error);
      throw error;
    }
  };

  updateCategory = async (id: string, name: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await this._repository.updateCategory(id, name);
      return result;
    } catch (error) {
      console.error("Error in interactor while updating category:", error);
      throw error;
    }
  };

  deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const result = await this._repository.deleteCategory(id);
        return result;
    } catch (error) {
        console.error("Error in interactor while deleting category:", error);
        throw error;
    }


};

showChannels = async():Promise<ChannelDocument[] | string> =>{
  try {
    return await this._repository.showChannels()
    
  } catch (error) {
    return "error "
  }
}

restrictChannel = async (channelId: string): Promise<ChannelDocument | string> => {
  try {
    const result = await this._repository.restrictChannel(channelId);
    if (typeof result === 'string') {
      return result;
    }
    return result;
  } catch (error) {
    return "Error restricting channel";
  }
}







  

  
}