import { Response } from 'express';
import { AuthRequest } from '../types';
import { settingService } from '../services/setting.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const settingController = {
  getSettings: async (req: AuthRequest, res: Response) => {
    try {
      const settings = await settingService.getSettings();
      return sendSuccess(res, settings);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  updateSettings: async (req: AuthRequest, res: Response) => {
    try {
      const updated = await settingService.updateSettings(req.body);
      await logAuditEvent(req, 'Settings', 'UPDATE_SETTINGS', updated.id, 'Updated workshop system configuration');
      return sendSuccess(res, updated, 'Settings updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
};
