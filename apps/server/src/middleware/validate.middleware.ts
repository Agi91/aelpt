import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../lib/errors/AppError';

export const validateMiddleware = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new ValidationError(
          'Request body validation failed',
          result.error.format()
        )
      );
      return;
    }
    req.body = result.data;
    next();
  };
};
