import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError } from '../types';

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500): CustomError => {
  return new CustomError(message, statusCode);
};

export const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): CustomError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[];
      return new CustomError(
        `${field ? field.join(', ') : 'Field'} already exists`,
        409
      );
    case 'P2025':
      // Record not found
      return new CustomError('Record not found', 404);
    case 'P2003':
      // Foreign key constraint violation
      return new CustomError('Invalid reference', 400);
    case 'P2014':
      // Required relation violation
      return new CustomError('Required relation missing', 400);
    default:
      return new CustomError('Database operation failed', 500);
  }
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle different error types
  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    isOperational = true;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    isOperational = true;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  }

  // Send error response
  const response: any = {
    success: false,
    error: message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Include additional details for operational errors
  if (isOperational && process.env.NODE_ENV === 'development') {
    response.details = {
      name: error.name,
      statusCode,
      isOperational,
    };
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
