import { Response } from 'express';
import { AuthRequest } from '../types';
import { supplierService } from '../services/supplier.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const supplierController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const suppliers = await supplierService.getAll();
      return sendSuccess(res, suppliers);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const supplier = await supplierService.getById(req.params.id);
      if (!supplier) return sendError(res, 'Supplier not found', 404);
      return sendSuccess(res, supplier);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const { name, phone, email, address } = req.body;
      if (!name) return sendError(res, 'Supplier name is required', 400);

      const supplier = await supplierService.create({ name, phone, email, address });
      await logAuditEvent(req, 'Suppliers', 'CREATE_SUPPLIER', supplier.id, `Created parts supplier: ${supplier.name}`);
      return sendSuccess(res, supplier, 'Supplier created', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const updated = await supplierService.update(req.params.id, req.body);
      await logAuditEvent(req, 'Suppliers', 'UPDATE_SUPPLIER', req.params.id, `Updated supplier: ${updated.name}`);
      return sendSuccess(res, updated, 'Supplier updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      await supplierService.delete(req.params.id);
      await logAuditEvent(req, 'Suppliers', 'DELETE_SUPPLIER', req.params.id, `Deleted supplier ID: ${req.params.id}`);
      return sendSuccess(res, null, 'Supplier deleted');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
};
