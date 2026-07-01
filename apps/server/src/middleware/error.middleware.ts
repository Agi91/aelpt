import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors/AppError';
import { ApiResponse } from '../lib/utils/response';
import { ERROR_CODES } from '@aelpt/shared';
import { config } from '../config';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error in development/non-production
  if (config.NODE_ENV !== 'production') {
    console.error('💥 Error caught by middleware:', err);
  }

  // Handle known operational AppErrors
  if (err instanceof AppError) {
    ApiResponse.error(
      res,
      err.errorCode,
      err.message,
      err.statusCode,
      err.details
    );
    return;
  }

  // Handle uncaught / system errors
  const isProduction = config.NODE_ENV === 'production';
  const message = isProduction
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  ApiResponse.error(
    res,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    message,
    500,
    !isProduction ? { stack: err.stack } : undefined
  );
};
