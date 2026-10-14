import { Response } from 'express';
import { AuthRequest } from '../types';
import { jobRepository } from '../repositories/job.repository';
import { productRepository } from '../repositories/product.repository';
import { validateJobData } from '../validators/job.validator';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const jobController = {
  getAll: async (req: AuthRequest, res: Response) => {
    const jobs = await jobRepository.findAll();
    return sendSuccess(res, jobs);
  },

  getById: async (req: AuthRequest, res: Response) => {
    const job = await jobRepository.findById(req.params.id);
    if (!job) {
      return sendError(res, 'Repair job not found', 404);
    }
    return sendSuccess(res, job);
  },

  create: async (req: AuthRequest, res: Response) => {
    const { isValid, errors } = validateJobData(req.body);
    if (!isValid) {
      return sendError(res, 'Validation error', 400, errors);
    }

    const jobNumber = `JC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const job = await jobRepository.create({
      jobNumber,
      customerId: req.body.customerId,
      vehicleId: req.body.vehicleId,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      mileageIn: req.body.mileageIn || 0,
      customerComplaint: req.body.customerComplaint,
      diagnosis: req.body.diagnosis || null,
      workRequired: req.body.workRequired || null,
      status: req.body.status || 'draft',
      estimatedCost: req.body.estimatedCost || 0,
      finalCost: req.body.finalCost || 0,
      notes: req.body.notes || null
    });

    await logAuditEvent(req, 'Repair Jobs', 'CREATE_JOB', job.id, `Created repair job card ${job.jobNumber}`);
    return sendSuccess(res, job, 'Job created', 201);
  },

  update: async (req: AuthRequest, res: Response) => {
    const job = await jobRepository.update(req.params.id, req.body);
    await logAuditEvent(req, 'Repair Jobs', 'UPDATE_JOB', job.id, `Updated repair job ${job.jobNumber}`);
    return sendSuccess(res, job, 'Job updated');
  },

  addPart: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { productId, quantity, unitCost, unitPrice } = req.body;

    const product = await productRepository.findById(productId);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    if (product.currentQuantity < quantity) {
      return sendError(
        res,
        `Insufficient inventory for "${product.name}". Available: ${product.currentQuantity}, Required: ${quantity}.`,
        400
      );
    }

    // Deduct stock
    await productRepository.updateStock(
      productId,
      -quantity,
      'job_usage',
      unitCost || product.purchasePrice,
      id,
      `Job usage in Job ID ${id}`
    );

    const part = await jobRepository.addPart(id, {
      productId,
      quantity,
      unitCost: unitCost || product.purchasePrice,
      unitPrice: unitPrice || product.sellingPrice,
      totalCost: (unitCost || product.purchasePrice) * quantity,
      totalPrice: (unitPrice || product.sellingPrice) * quantity
    });

    await logAuditEvent(
      req,
      'Repair Jobs',
      'ADD_JOB_PART',
      id,
      `Added ${quantity}x ${product.name} to Job. Stock auto-deducted.`
    );
    return sendSuccess(res, part, 'Part added and stock deducted', 201);
  },

  addLabour: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { workerId, units, costToShop, customerCharge, notes } = req.body;

    const labour = await jobRepository.addLabour(id, {
      workerId,
      units: units || 1,
      costToShop: costToShop || 0,
      customerCharge: customerCharge || 0,
      notes: notes || null
    });

    return sendSuccess(res, labour, 'Labour assigned to job', 201);
  },

  addPhoto: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { photoUrl, caption } = req.body;
    if (!photoUrl) {
      return sendError(res, 'photoUrl is required', 400);
    }

    const photo = await jobRepository.addPhoto(id, photoUrl, caption);
    return sendSuccess(res, photo, 'Inspection photo saved', 201);
  }
};
