import { Response } from 'express';
import { AuthRequest } from '../types';
import { reportService } from '../services/report.service';
import { sendSuccess, sendError } from '../utils/response';

export const reportController = {
  getProfitReport: async (req: AuthRequest, res: Response) => {
    try {
      const period = (req.query.period as 'weekly' | 'monthly' | 'yearly') || 'monthly';
      const report = await reportService.getProfitAndLoss(period);
      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getSalesReport: async (req: AuthRequest, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await reportService.getSalesSummary(startDate, endDate);
      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getInventoryReport: async (req: AuthRequest, res: Response) => {
    try {
      const report = await reportService.getInventoryValuation();
      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getLabourPayrollReport: async (req: AuthRequest, res: Response) => {
    try {
      const report = await reportService.getLabourPayrollSummary();
      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getExpenseReport: async (req: AuthRequest, res: Response) => {
    try {
      const monthKey = req.query.month as string | undefined;
      const report = await reportService.getExpenseReport(monthKey);
      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
};
