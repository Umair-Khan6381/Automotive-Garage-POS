import { Response } from 'express';
import { AuthRequest } from '../types';
import { storageService } from '../services/storage.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const uploadController = {
  /**
   * Protected upload endpoint for workshop receipts, salary proofs, and job photos
   */
  uploadDocument: async (req: AuthRequest, res: Response) => {
    try {
      const { filename, mimeType, dataUrl, folder, notes, entityType, entityId } = req.body;

      if (!dataUrl || !filename || !mimeType) {
        return sendError(res, 'File dataUrl, filename, and mimeType are required.', 400);
      }

      const uploadResult = await storageService.uploadFile({
        dataUrl,
        filename,
        mimeType,
        folder: folder || 'documents'
      });

      const user = req.user;
      if (user) {
        await logAuditEvent(
          req,
          'Document Storage',
          'UPLOAD_FILE',
          entityId || uploadResult.pathname || 'upload',
          `User ${user.username} uploaded ${filename} (${(uploadResult.size / 1024).toFixed(1)} KB) via ${uploadResult.storageProvider}.`
        );
      }

      return sendSuccess(
        res,
        {
          ...uploadResult,
          filename,
          notes,
          uploadedBy: user?.id,
          uploadedByName: user?.name,
          uploadedAt: new Date().toISOString()
        },
        'File uploaded and saved securely',
        201
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to upload document', 400);
    }
  }
};
