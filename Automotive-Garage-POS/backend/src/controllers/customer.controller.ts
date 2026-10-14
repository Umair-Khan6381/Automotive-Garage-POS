import { Response } from 'express';
import { AuthRequest } from '../types';
import { customerRepository } from '../repositories/customer.repository';
import { validateCustomerData } from '../validators/customer.validator';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const customerController = {
  getAll: async (req: AuthRequest, res: Response) => {
    const customers = await customerRepository.findAll();
    return sendSuccess(res, customers);
  },

  getById: async (req: AuthRequest, res: Response) => {
    const customer = await customerRepository.findById(req.params.id);
    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }
    return sendSuccess(res, customer);
  },

  create: async (req: AuthRequest, res: Response) => {
    const { isValid, errors } = validateCustomerData(req.body);
    if (!isValid) {
      return sendError(res, 'Validation error', 400, errors);
    }
    const customer = await customerRepository.create(req.body);
    await logAuditEvent(req, 'Customers', 'CREATE', customer.id, `Created customer ${customer.fullName}`);
    return sendSuccess(res, customer, 'Customer created', 201);
  },

  update: async (req: AuthRequest, res: Response) => {
    const customer = await customerRepository.update(req.params.id, req.body);
    await logAuditEvent(req, 'Customers', 'UPDATE', customer.id, `Updated customer ${customer.fullName}`);
    return sendSuccess(res, customer, 'Customer updated');
  },

  delete: async (req: AuthRequest, res: Response) => {
    await customerRepository.delete(req.params.id);
    await logAuditEvent(req, 'Customers', 'DELETE', req.params.id, `Deleted customer ID ${req.params.id}`);
    return sendSuccess(res, null, 'Customer deleted');
  }
};
