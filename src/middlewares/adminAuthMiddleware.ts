import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const adminAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("Hrere alsoe");
    
  if (req.user && req.user.role === 'admin') {
    next();
    console.log("He is admins");
    
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};