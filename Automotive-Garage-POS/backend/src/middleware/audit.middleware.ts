import { AuthRequest } from '../types';
import prisma from '../database/prisma';
import { logger } from '../utils/logger';

export const logAuditEvent = async (
  req: AuthRequest,
  module: string,
  action: string,
  recordId: string,
  description: string
) => {
  try {
    const user = req.user;
    await prisma.auditLog.create({
      data: {
        userId: user?.id || 'system',
        userName: user?.name || 'System / Setup',
        userRole: user?.role || 'owner',
        module,
        action,
        recordId,
        description,
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1'
      }
    });
  } catch (error) {
    logger.error('Failed to write audit log to database:', error);
  }
};
