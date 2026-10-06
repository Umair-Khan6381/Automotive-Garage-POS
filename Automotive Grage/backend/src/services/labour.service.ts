import { labourRepository } from '../repositories/labour.repository';

export const labourService = {
  getAllWorkers: async () => {
    return labourRepository.findAllWorkers();
  },

  getWorkerById: async (id: string) => {
    return labourRepository.findWorkerById(id);
  },

  createWorker: async (data: {
    name: string;
    phone: string;
    position: string;
    rateType?: string;
    rateAmount?: number;
    status?: string;
  }) => {
    return labourRepository.createWorker(data);
  },

  updateWorker: async (id: string, data: any) => {
    return labourRepository.updateWorker(id, data);
  },

  deleteWorker: async (id: string) => {
    return labourRepository.deleteWorker(id);
  },

  getAllPayments: async () => {
    return labourRepository.findAllPayments();
  },

  recordPayment: async (data: {
    workerId: string;
    amount: number;
    paymentMethod?: string;
    date?: Date;
    periodStart?: Date;
    periodEnd?: Date;
    notes?: string;
  }) => {
    return labourRepository.createPayment(data);
  }
};
