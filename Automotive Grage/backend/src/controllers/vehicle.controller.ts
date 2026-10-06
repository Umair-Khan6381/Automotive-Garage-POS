import { Response } from 'express';
import { AuthRequest } from '../types';
import { vehicleRepository } from '../repositories/vehicle.repository';
import { validateVehicleData } from '../validators/vehicle.validator';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const vehicleController = {
  getAll: async (req: AuthRequest, res: Response) => {
    const vehicles = await vehicleRepository.findAll();
    return sendSuccess(res, vehicles);
  },

  getById: async (req: AuthRequest, res: Response) => {
    const vehicle = await vehicleRepository.findById(req.params.id);
    if (!vehicle) {
      return sendError(res, 'Vehicle not found', 404);
    }
    return sendSuccess(res, vehicle);
  },

  create: async (req: AuthRequest, res: Response) => {
    const { isValid, errors } = validateVehicleData(req.body);
    if (!isValid) {
      return sendError(res, 'Validation error', 400, errors);
    }

    const existing = await vehicleRepository.findByRegistration(req.body.registrationNumber.trim().toUpperCase());
    if (existing) {
      return sendError(res, 'A vehicle with this registration plate already exists in the system.', 409);
    }

    const vehicle = await vehicleRepository.create({
      ...req.body,
      registrationNumber: req.body.registrationNumber.trim().toUpperCase()
    });

    await logAuditEvent(req, 'Vehicles', 'CREATE', vehicle.id, `Registered vehicle ${vehicle.registrationNumber}`);
    return sendSuccess(res, vehicle, 'Vehicle registered', 201);
  },

  update: async (req: AuthRequest, res: Response) => {
    const vehicle = await vehicleRepository.update(req.params.id, req.body);
    await logAuditEvent(req, 'Vehicles', 'UPDATE', vehicle.id, `Updated vehicle ${vehicle.registrationNumber}`);
    return sendSuccess(res, vehicle, 'Vehicle updated');
  },

  delete: async (req: AuthRequest, res: Response) => {
    await vehicleRepository.delete(req.params.id);
    await logAuditEvent(req, 'Vehicles', 'DELETE', req.params.id, `Deleted vehicle ID ${req.params.id}`);
    return sendSuccess(res, null, 'Vehicle deleted');
  }
};
