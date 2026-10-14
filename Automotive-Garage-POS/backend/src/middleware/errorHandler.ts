import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logger.error(`Unhandled error at ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation error', 400, err.errors);
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target ? ` (${err.meta.target})` : '';
    return sendError(res, `A record with this unique value already exists${field}.`, 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'The requested record was not found.', 404);
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred on the server.'
      : err.message || 'Internal server error',
    err.status || 500
  );
};
