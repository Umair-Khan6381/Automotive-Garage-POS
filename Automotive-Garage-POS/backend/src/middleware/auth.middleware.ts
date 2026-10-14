import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/security';
import { sendError } from '../utils/response';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Missing or invalid Bearer token.', 401);
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    return sendError(res, 'Invalid or expired session token.', 401);
  }

  if (user.status !== 'active') {
    return sendError(res, 'User account is disabled. Contact the garage owner.', 403);
  }

  req.user = user;
  next();
};
