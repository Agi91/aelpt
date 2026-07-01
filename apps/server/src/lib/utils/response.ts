import type { Response } from 'express';
import type { ErrorCode } from '@aelpt/shared';

export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  errorCode: ErrorCode;
  message: string;
  details?: unknown;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ): Response<SuccessResponse<T>> {
    const responseBody: SuccessResponse<T> = {
      success: true,
      data,
    };
    if (message !== undefined) {
      responseBody.message = message;
    }
    return res.status(statusCode).json(responseBody);
  }

  public static error(
    res: Response,
    errorCode: ErrorCode,
    message: string,
    statusCode = 500,
    details?: unknown
  ): Response<ErrorResponse> {
    const responseBody: ErrorResponse = {
      success: false,
      errorCode,
      message,
    };
    if (details !== undefined) {
      responseBody.details = details;
    }
    return res.status(statusCode).json(responseBody);
  }
}
