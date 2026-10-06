import { paymentRepository } from '../repositories/payment.repository';

export const paymentService = {
  getAll: async () => {
    return paymentRepository.findAll();
  },

  getById: async (id: string) => {
    return paymentRepository.findById(id);
  },

  getByInvoiceId: async (invoiceId: string) => {
    return paymentRepository.findByInvoiceId(invoiceId);
  },

  create: async (data: {
    invoiceId: string;
    amount: number;
    paymentDate?: Date;
    paymentMethod: string;
    referenceNumber?: string;
    receivedBy: string;
    notes?: string;
  }) => {
    return paymentRepository.create(data);
  }
};
