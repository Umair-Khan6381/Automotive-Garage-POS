import { Response } from 'express';
import { AuthRequest } from '../types';
import { auditService } from '../services/audit.service';
import { sendSuccess, sendError } from '../utils/response';

export const auditController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 100;
      const logs = await auditService.getAll(limit);
      return sendSuccess(res, logs);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
};
