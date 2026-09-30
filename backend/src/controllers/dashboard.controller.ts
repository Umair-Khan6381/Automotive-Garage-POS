import { Response } from 'express';
import { AuthRequest } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export const dashboardController = {
  getStats: async (req: AuthRequest, res: Response) => {
    const stats = await dashboardService.getStatistics();
    return sendSuccess(res, stats);
  }
};
