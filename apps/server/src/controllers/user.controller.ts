import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../lib/utils/response';
import { NotFoundError } from '../lib/errors/AppError';

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const profile = await UserService.getUserProfile(authReq.user.uid);

    if (profile === null) {
      throw new NotFoundError('User profile not found in database');
    }

    ApiResponse.success(res, profile, 'User profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { fullName } = req.body as { fullName?: string };

    const email = authReq.user.email || '';
    const name = fullName || authReq.user.name || 'Anonymous User';

    const profile = await UserService.createUserProfile(authReq.user.uid, {
      fullName: name,
      email,
    });

    ApiResponse.success(
      res,
      profile,
      'User profile initialized successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { fullName, onboardingDone } = req.body as {
      fullName?: string;
      onboardingDone?: boolean;
    };

    const updatedProfile = await UserService.updateUserProfile(
      authReq.user.uid,
      {
        ...(fullName !== undefined && { fullName }),
        ...(onboardingDone !== undefined && { onboardingDone }),
      }
    );

    ApiResponse.success(
      res,
      updatedProfile,
      'User profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};
