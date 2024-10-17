import { Request, Response, NextFunction } from "express";
import { IAdminInteractor } from "../providers/interfaces/IAdminInteractor";
import { ResponseStatus } from "../contrants/statusCodesEnus";
export class AdminController {
    private _interactor: IAdminInteractor;
   
    
    
    
    
    constructor(interactor: IAdminInteractor) {
      this._interactor = interactor;
    }
    getUsers = async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log("It come insdie the get suers");
        
        const users = await this._interactor.getUsers();
        console.log('Successfully get all the users',users)
        if (users) {
          return res.status(ResponseStatus.OK).json({ message: "Successfully get all the users", users });
        }
        
      } catch (error) {
        next(error);
      }
    };
    

    onBlockUser = async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log("id is", req.params.id);
        const status = await this._interactor.blockUser(req.params.id);
       
        if (status.update) {
          console.log("success");
          res
            .status(ResponseStatus.OK)
            .json({ message: "Successfully Updated",updated:status.update,id:status.user?._id });
        } else {
          res
            .status(ResponseStatus.BadRequest)
            .json({ message: "Error toggling user status" });
        }
      } catch (error) {
        next(error);
      }
    };

   

    getCategory = async (req: Request, res: Response, next: NextFunction) => {
      console.log("get i n hereee");
      try {
        const categories = await this._interactor.getCategories();
        res.status(ResponseStatus.OK).json(categories);
      } catch (error) {
        next(error);
      }
    };

    addCategory = async (req: Request, res: Response) => {
      try {
        const { name } = req.body;
        const result = await this._interactor.addCategory(name);
        if (result.success) {
          console.log("scess",result.success);
          
          return res.status(ResponseStatus.OK).json({ message: result.message });
        } else {
          return res.status(ResponseStatus.BadRequest).json({ message: result.message });
        }
      } catch (error) {
        console.error("Error in controller while adding category:", error);
        return res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
      }
    };

    updateCategory = async (req: Request, res: Response) => {
      console.log("upIn");
      
      try {
        const {name } = req.body;
        const { id } = req.params;
        console.log("namaas",id,name);
        
        const result = await this._interactor.updateCategory(id, name);
        if (result.success) {
          return res.status(ResponseStatus.OK).json({ message: result.message });
        } else {
          return res.status(ResponseStatus.BadRequest).json({ message: result.message });
        }
      } catch (error) {
        console.error("Error in controller while updating category:", error);
        return res.status(ResponseStatus.BadRequest).json({ message: "Internal server error" });
      }
    };

    deleteCategory = async (req: Request, res: Response) => {
      try {
        const categoryId = req.params.id;
        const result = await this._interactor.deleteCategory(categoryId);
        if (result.success) {
          return res.status(ResponseStatus.OK).json({ message: result.message });
        } else {
          return res.status(ResponseStatus.BadRequest).json({ message: result.message });
        }
      } catch (error) {
        console.error('Error in controller while deleting category:', error);
        return res.status(ResponseStatus.BadRequest).json({ message: 'Internal server error' });
      }
    };

    async getChannels(req: Request, res: Response) {
              
              

      try {
        console.log("test for channel");
        
        const showChannels = await this._interactor.showChannels()
        if (!showChannels) {
          res.status(401).json({ message: "no active Channels Now" })
        }
  
       
        res.status(ResponseStatus.OK).json({ showChannels })
      } catch (error) {
  
      }
    }

    async onRestrictChannel(req: Request, res: Response) {
      try {
        console.log("for restrct");
        
        const channelId = req.params.id;
        const result = await this._interactor.restrictChannel(channelId);
        if (typeof result === 'string') {
          res.status(ResponseStatus.NotFound).json({ message: result });
        } else {
          res.status(ResponseStatus.OK).json({ message: "Channel restricted successfully", channel: result });
        }
      } catch (error) {
        res.status(ResponseStatus.BadRequest).json({ message: "An error occurred while restricting the channel" });
      }
    }
    
    

   
    
}