import { jobRepository } from '../repositories/job.repository';
import { productRepository } from '../repositories/product.repository';

export const jobService = {
  getAll: async () => {
    return jobRepository.findAll();
  },

  getById: async (id: string) => {
    return jobRepository.findById(id);
  },

  create: async (data: {
    jobNumber: string;
    customerId: string;
    vehicleId: string;
    mileageIn?: number;
    customerComplaint: string;
    diagnosis?: string;
    workRequired?: string;
    status?: string;
    estimatedCost?: number;
    notes?: string;
  }) => {
    return jobRepository.create(data);
  },

  update: async (id: string, data: any) => {
    return jobRepository.update(id, data);
  },

  updateStatus: async (id: string, status: string) => {
    return jobRepository.update(id, { status });
  },

  addPartToJob: async (
    jobId: string,
    partData: {
      productId: string;
      quantity: number;
      unitCost: number;
      unitPrice: number;
      totalCost: number;
      totalPrice: number;
    }
  ) => {
    // 1. Deduct stock from inventory
    await productRepository.updateStock(
      partData.productId,
      -partData.quantity,
      'job_usage',
      partData.unitCost,
      jobId,
      `Used in Job Card #${jobId}`
    );

    // 2. Link part to job
    return jobRepository.addPart(jobId, partData);
  },

  addLabourToJob: async (
    jobId: string,
    labourData: {
      workerId: string;
      units: number;
      costToShop: number;
      customerCharge: number;
    }
  ) => {
    return jobRepository.addLabour(jobId, labourData);
  },

  delete: async (id: string) => {
    return jobRepository.delete(id);
  }
};
