import { purchaseRepository } from '../repositories/purchase.repository';

export const purchaseService = {
  getAll: async () => {
    return purchaseRepository.findAll();
  },

  getById: async (id: string) => {
    return purchaseRepository.findById(id);
  },

  create: async (
    purchaseData: {
      invoiceNumber?: string;
      supplierId?: string;
      date?: Date;
      totalAmount: number;
      notes?: string;
      createdBy?: string;
    },
    items: Array<{
      productId: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
    }>
  ) => {
    return purchaseRepository.create(purchaseData, items);
  }
};
