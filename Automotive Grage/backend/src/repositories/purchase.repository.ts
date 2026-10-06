import prisma from '../database/prisma';

export const purchaseRepository = {
  findAll: async () => {
    return prisma.purchase.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
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
    return prisma.$transaction(async tx => {
      // 1. Create Purchase record with nested items
      const purchase = await tx.purchase.create({
        data: {
          invoiceNumber: purchaseData.invoiceNumber,
          supplierId: purchaseData.supplierId,
          date: purchaseData.date || new Date(),
          totalAmount: purchaseData.totalAmount,
          notes: purchaseData.notes,
          createdBy: purchaseData.createdBy,
          items: {
            create: items
          }
        },
        include: {
          items: true,
          supplier: true
        }
      });

      // 2. Increment product inventory levels and record inventory transactions
      for (const item of items) {
        // Fetch current product to compute weighted average cost
        const existingProduct = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (existingProduct) {
          const currentTotalVal = existingProduct.currentQuantity * existingProduct.purchasePrice;
          const newBatchVal = item.quantity * item.unitCost;
          const totalQty = existingProduct.currentQuantity + item.quantity;
          const weightedCost = totalQty > 0 ? (currentTotalVal + newBatchVal) / totalQty : item.unitCost;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentQuantity: { increment: item.quantity },
              purchasePrice: weightedCost
            }
          });

          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'purchase',
              quantity: item.quantity,
              unitCost: item.unitCost,
              referenceId: purchase.id,
              notes: `Stock PO #${purchase.invoiceNumber || purchase.id}`
            }
          });
        }
      }

      return purchase;
    });
  }
};
