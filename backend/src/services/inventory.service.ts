import { productRepository } from '../repositories/product.repository';
import prisma from '../database/prisma';

export const inventoryService = {
  adjustStock: async (
    productId: string,
    delta: number,
    type: 'purchase' | 'sale' | 'job_usage' | 'return' | 'adjustment' | 'damage',
    reason: string,
    unitCost?: number
  ) => {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    const cost = unitCost !== undefined ? unitCost : product.purchasePrice;

    // Check insufficient stock for deductions
    if (delta < 0 && product.currentQuantity + delta < 0) {
      throw new Error(
        `Insufficient inventory stock for "${product.name}". Available: ${product.currentQuantity}, Requested: ${Math.abs(delta)}.`
      );
    }

    return productRepository.updateStock(productId, delta, type, cost, undefined, reason);
  },

  recordPurchase: async (data: {
    supplierId?: string;
    invoiceNumber?: string;
    items: Array<{ productId: string; quantity: number; unitCost: number }>;
    notes?: string;
    createdBy?: string;
  }) => {
    return prisma.$transaction(async tx => {
      let totalAmount = 0;
      data.items.forEach(item => {
        totalAmount += item.quantity * item.unitCost;
      });

      const purchase = await tx.purchase.create({
        data: {
          supplierId: data.supplierId,
          invoiceNumber: data.invoiceNumber,
          totalAmount,
          notes: data.notes,
          createdBy: data.createdBy,
          items: {
            create: data.items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              unitCost: i.unitCost,
              totalCost: i.quantity * i.unitCost
            }))
          }
        }
      });

      // Update product stocks and record inventory transactions
      for (const item of data.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          // Weighted Average Cost calculation
          const existingValue = prod.currentQuantity * prod.purchasePrice;
          const newValue = item.quantity * item.unitCost;
          const newQty = prod.currentQuantity + item.quantity;
          const newAvgCost = newQty > 0 ? (existingValue + newValue) / newQty : item.unitCost;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentQuantity: newQty,
              purchasePrice: Math.round(newAvgCost)
            }
          });

          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'purchase',
              quantity: item.quantity,
              unitCost: item.unitCost,
              referenceId: purchase.id,
              notes: `Purchase Invoice: ${data.invoiceNumber || 'PO'}`
            }
          });
        }
      }

      return purchase;
    });
  }
};
