import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../lib/utils/response';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authReq = req as AuthenticatedRequest;
    ApiResponse.success(
      res,
      {
        uid: authReq.user.uid,
        email: authReq.user.email,
        name: authReq.user.name || '',
        picture: authReq.user.picture || '',
        emailVerified: authReq.user.email_verified || false,
      },
      'Token verified successfully'
    );
  } catch (error) {
    next(error);
  }
};
