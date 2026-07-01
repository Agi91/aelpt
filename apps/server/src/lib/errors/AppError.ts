import { ERROR_CODES, type ErrorCode } from '@aelpt/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, ERROR_CODES.NOT_FOUND);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, ERROR_CODES.FORBIDDEN);
  }
}

export class AiServiceError extends AppError {
  constructor(message = 'AI Service Error') {
    super(message, 502, ERROR_CODES.AI_SERVICE_ERROR);
  }
}
