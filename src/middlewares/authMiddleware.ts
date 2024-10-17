import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../model/userModel';
import dotenv from 'dotenv';
import { isTokenValid } from '../utils/tokenUtils';

dotenv.config();

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("come in");
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log("come in",token);

    
    
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided', logout: true });
    }

    const decoded = jwt.verify(token, process.env.SECRET_LOGIN as string) as { _id: string, tokenVersion: number };
   console.log("Current user",decoded);
   
    const isValid = await isTokenValid(decoded._id, decoded.tokenVersion);
    if (!isValid) {
      return res.status(401).json({ message: 'Token has been invalidated', logout: true });
    }

    const user = await UserModel.findById(decoded._id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found', logout: true });
    }
//cons
    if (user.isblocked) {
      return res.status(403).json({ message: 'User is blocked', logout: true });
    }
    console.log("he is okay");
    

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', logout: true });
  }
};