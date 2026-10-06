import { Response } from 'express';
import { AuthRequest } from '../types';
import { oilRepository } from '../repositories/oil.repository';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const oilController = {
  getAll: async (req: AuthRequest, res: Response) => {
    const records = await oilRepository.findAll();
    return sendSuccess(res, records);
  },

  create: async (req: AuthRequest, res: Response) => {
    const {
      vehicleId,
      customerId,
      oilProductId,
      serviceDate,
      currentMileage,
      intervalKm = 5000,
      intervalMonths = 3,
      oilBrand,
      oilType,
      oilQuantity,
      oilFilterPartNumber,
      technicianName,
      costPrice = 0,
      sellingPrice = 0,
      notes
    } = req.body;

    if (!vehicleId || !customerId || !oilBrand || currentMileage === undefined) {
      return sendError(res, 'Vehicle, customer, oil brand, and current mileage required.', 400);
    }

    const nextMileage = currentMileage + intervalKm;
    const servDate = serviceDate ? new Date(serviceDate) : new Date();
    const nextDate = new Date(servDate);
    nextDate.setMonth(nextDate.getMonth() + intervalMonths);

    const record = await oilRepository.create({
      vehicleId,
      customerId,
      oilProductId: oilProductId || null,
      serviceDate: servDate,
      currentMileage,
      nextRecommendedMileage: nextMileage,
      nextRecommendedDate: nextDate,
      oilBrand,
      oilType: oilType || 'Synthetic 5W-30',
      oilQuantity: oilQuantity || 4.0,
      oilFilterPartNumber: oilFilterPartNumber || null,
      technicianName: technicianName || 'Staff Mechanic',
      costPrice,
      sellingPrice,
      status: 'upcoming',
      notes: notes || null
    });

    await logAuditEvent(req, 'Oil Change', 'RECORD_OIL_SERVICE', record.id, `Recorded oil service for vehicle ID ${vehicleId}`);
    return sendSuccess(res, record, 'Oil service record saved', 201);
  }
};
