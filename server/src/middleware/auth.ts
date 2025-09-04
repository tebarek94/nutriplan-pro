import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AppError } from '../types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const error = new Error('Access token required') as AppError;
    error.statusCode = 401;
    error.isOperational = true;
    return next(error);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const jwtError = new Error('Invalid or expired token') as AppError;
    jwtError.statusCode = 401;
    jwtError.isOperational = true;
    return next(jwtError);
  }
};

/**
 * Check if user has required role
 */
export const requireRole = (roles: ('user' | 'admin')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error = new Error('Authentication required') as AppError;
      error.statusCode = 401;
      error.isOperational = true;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error('Insufficient permissions') as AppError;
      error.statusCode = 403;
      error.isOperational = true;
      return next(error);
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Require user role (admin or regular user)
 */
export const requireUser = requireRole(['user', 'admin']);

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

