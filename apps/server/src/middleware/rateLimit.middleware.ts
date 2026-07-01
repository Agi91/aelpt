import rateLimit from 'express-rate-limit';
import { ERROR_CODES } from '@aelpt/shared';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message:
      'Too many authentication attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many API requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message:
      'AI request limit reached. Please wait a minute before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
