import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const record = loginAttempts.get(ip);

  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxAttempts) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    return sendError(
      res,
      `Too many failed attempts. Login is temporarily locked for this IP. Try again in ${minutesLeft} minutes.`,
      429
    );
  }

  record.count += 1;
  loginAttempts.set(ip, record);
  next();
};

export const resetAuthRateLimit = (ip: string) => {
  loginAttempts.delete(ip);
};
