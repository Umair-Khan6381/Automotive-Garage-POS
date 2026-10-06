import { Response } from 'express';
import { AuthRequest } from '../types';
import { paymentService } from '../services/payment.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const paymentController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const payments = await paymentService.getAll();
      return sendSuccess(res, payments);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const payment = await paymentService.getById(req.params.id);
      if (!payment) return sendError(res, 'Payment not found', 404);
      return sendSuccess(res, payment);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const { invoiceId, amount, paymentMethod, referenceNumber, notes, paymentDate } = req.body;
      if (!invoiceId || !amount || amount <= 0) {
        return sendError(res, 'Invoice ID and valid amount are required', 400);
      }

      const payment = await paymentService.create({
        invoiceId,
        amount: Number(amount),
        paymentMethod: paymentMethod || 'Cash',
        referenceNumber,
        notes,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        receivedBy: req.user?.name || 'Cashier'
      });

      await logAuditEvent(
        req,
        'Payments',
        'RECORD_PAYMENT',
        payment.id,
        `Collected payment of Rs. ${payment.amount} for invoice ${invoiceId} via ${payment.paymentMethod}`
      );

      return sendSuccess(res, payment, 'Payment collected successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
};
