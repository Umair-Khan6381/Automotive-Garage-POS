import { Response } from 'express';
import { AuthRequest } from '../types';
import { backupService } from '../services/backup.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const backupController = {
  exportBackup: async (req: AuthRequest, res: Response) => {
    try {
      const snapshot = await backupService.createSnapshot();
      await logAuditEvent(req, 'Backup & Restore', 'EXPORT_BACKUP', 'backup-export', 'Exported database backup archive');
      return sendSuccess(res, snapshot, 'Backup archive generated');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  restoreBackup: async (req: AuthRequest, res: Response) => {
    try {
      const result = await backupService.restoreSnapshot(req.body);
      await logAuditEvent(req, 'Backup & Restore', 'RESTORE_BACKUP', 'backup-restore', 'Restored database from backup');
      return sendSuccess(res, result, 'Database restored successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
};
