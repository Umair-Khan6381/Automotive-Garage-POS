import { Response } from 'express';
import { AuthRequest } from '../types';
import { purchaseService } from '../services/purchase.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const purchaseController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const purchases = await purchaseService.getAll();
      return sendSuccess(res, purchases);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const purchase = await purchaseService.getById(req.params.id);
      if (!purchase) return sendError(res, 'Purchase record not found', 404);
      return sendSuccess(res, purchase);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const { invoiceNumber, supplierId, date, totalAmount, notes, items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'At least one purchase item is required', 400);
      }

      const purchase = await purchaseService.create(
        {
          invoiceNumber,
          supplierId,
          date: date ? new Date(date) : new Date(),
          totalAmount: Number(totalAmount || 0),
          notes,
          createdBy: req.user?.name || 'Owner'
        },
        items
      );

      await logAuditEvent(
        req,
        'Purchases',
        'CREATE_PURCHASE',
        purchase.id,
        `Recorded supplier stock purchase: Rs. ${purchase.totalAmount} (${items.length} items)`
      );

      return sendSuccess(res, purchase, 'Purchase recorded and stock updated', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
};
