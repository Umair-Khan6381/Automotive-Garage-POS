import { invoiceRepository } from '../repositories/invoice.repository';
import { productRepository } from '../repositories/product.repository';

export const invoiceService = {
  getAll: async () => {
    return invoiceRepository.findAll();
  },

  getById: async (id: string) => {
    return invoiceRepository.findById(id);
  },

  create: async (
    invoiceData: {
      invoiceNumber: string;
      jobId?: string;
      customerId: string;
      vehicleId?: string;
      date?: Date;
      partsTotal?: number;
      partsCost?: number;
      labourTotal?: number;
      labourCost?: number;
      servicesTotal?: number;
      servicesCost?: number;
      subtotal: number;
      discount?: number;
      taxAmount?: number;
      grandTotal: number;
      paidAmount?: number;
      balanceDue?: number;
      paymentStatus?: string;
      notes?: string;
      issuedBy: string;
    },
    items: Array<{
      productId?: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      unitCost: number;
      totalCost: number;
    }>
  ) => {
    // 1. Create Invoice
    const invoice = await invoiceRepository.create(invoiceData, items);

    // 2. If direct POS items (no job linked), deduct inventory stock
    if (!invoiceData.jobId && items.length > 0) {
      for (const item of items) {
        if (item.productId) {
          await productRepository.updateStock(
            item.productId,
            -item.quantity,
            'sale',
            item.unitCost,
            invoice.id,
            `Sold on Invoice #${invoice.invoiceNumber}`
          );
        }
      }
    }

    return invoice;
  },

  recordPayment: async (
    invoiceId: string,
    paymentData: {
      amount: number;
      paymentDate?: Date;
      paymentMethod: string;
      referenceNumber?: string;
      receivedBy: string;
      notes?: string;
    }
  ) => {
    return invoiceRepository.addPayment(invoiceId, paymentData);
  },

  delete: async (id: string) => {
    return invoiceRepository.delete(id);
  }
};
