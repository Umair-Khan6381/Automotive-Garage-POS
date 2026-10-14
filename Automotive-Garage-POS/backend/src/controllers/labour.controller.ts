import { Response } from 'express';
import { AuthRequest } from '../types';
import { labourRepository } from '../repositories/labour.repository';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const labourController = {
  getAllWorkers: async (req: AuthRequest, res: Response) => {
    const workers = await labourRepository.findAllWorkers();
    return sendSuccess(res, workers);
  },

  createWorker: async (req: AuthRequest, res: Response) => {
    const { name, phone, position, rateType, rateAmount } = req.body;
    if (!name || !phone || !position) {
      return sendError(res, 'Worker name, phone, and position required.', 400);
    }

    const worker = await labourRepository.createWorker({
      name,
      phone,
      position,
      rateType: rateType || 'daily',
      rateAmount: rateAmount || 0,
      status: 'active'
    });

    await logAuditEvent(req, 'Labour', 'CREATE_WORKER', worker.id, `Added technician ${worker.name}`);
    return sendSuccess(res, worker, 'Technician added', 201);
  },

  getAllPayments: async (req: AuthRequest, res: Response) => {
    const payments = await labourRepository.findAllPayments();
    return sendSuccess(res, payments);
  },

  createPayment: async (req: AuthRequest, res: Response) => {
    const { workerId, amount, paymentMethod, notes, periodStart, periodEnd } = req.body;
    if (!workerId || !amount || amount <= 0) {
      return sendError(res, 'Worker and positive payment amount required.', 400);
    }

    const payment = await labourRepository.createPayment({
      workerId,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      notes: notes || null,
      periodStart: periodStart ? new Date(periodStart) : null,
      periodEnd: periodEnd ? new Date(periodEnd) : null
    });

    await logAuditEvent(req, 'Labour', 'RECORD_PAYROLL', payment.id, `Disbursed wage payment of Rs. ${amount}`);
    return sendSuccess(res, payment, 'Wage payment recorded', 201);
  }
};
