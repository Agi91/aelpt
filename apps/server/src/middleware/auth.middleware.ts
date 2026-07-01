import type { Response, NextFunction, Request } from 'express';
import * as admin from 'firebase-admin';
import { adminAuth } from '../firebase/admin';
import { UnauthorizedError } from '../lib/errors/AppError';

export interface AuthenticatedRequest extends Request {
  user: admin.auth.DecodedIdToken;
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];

    if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (token === undefined || token === '') {
      throw new UnauthorizedError('Authentication token not provided');
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      (req as AuthenticatedRequest).user = decodedToken;
      next();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid token';
      throw new UnauthorizedError(
        `Session token is invalid or expired: ${errorMsg}`
      );
    }
  } catch (error) {
    next(error);
  }
};
