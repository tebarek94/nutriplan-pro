import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '../types';

/**
 * Custom error class for operational errors
 */
export class OperationalError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new OperationalError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // Handle known error types
  if (error instanceof OperationalError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors || [];
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = (error as AppError).errors || [];
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if ((error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user
    });
  }

  // Send error response
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors.length > 0 && { errors })
  };

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (error: Error): void => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
};



/**
 * Database connection error handler
 */
export const databaseErrorHandler = (error: Error): void => {
  console.error('Database Error:', error);
  // In production, you might want to send alerts or restart the application
  if (process.env.NODE_ENV === 'production') {
    // Send alert to monitoring service
    console.error('Database connection failed in production');
  }
};

/**
 * File upload error handler
 */
export const fileUploadErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (error.message.includes('LIMIT_FILE_SIZE')) {
    const uploadError = new OperationalError('File too large', 400);
    return next(uploadError);
  }
  
  if (error.message.includes('LIMIT_FILE_COUNT')) {
    const uploadError = new OperationalError('Too many files', 400);
    return next(uploadError);
  }
  
  if (error.message.includes('LIMIT_UNEXPECTED_FILE')) {
    const uploadError = new OperationalError('Unexpected file field', 400);
    return next(uploadError);
  }
  
  next(error);
};

