import prisma from '../database/prisma';

export const productRepository = {
  findAll: async () => {
    return prisma.product.findMany({
      include: {
        category: true,
        supplier: true
      },
      orderBy: { name: 'asc' }
    });
  },

  findById: async (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
  },

  findBySku: async (sku: string) => {
    return prisma.product.findUnique({ where: { sku } });
  },

  create: async (data: any) => {
    return prisma.product.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.product.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.product.delete({ where: { id } });
  },

  updateStock: async (
    productId: string,
    deltaQuantity: number,
    transactionType: string,
    unitCost: number,
    referenceId?: string,
    notes?: string
  ) => {
    return prisma.$transaction(async tx => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          currentQuantity: {
            increment: deltaQuantity
          }
        }
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          type: transactionType,
          quantity: deltaQuantity,
          unitCost,
          referenceId,
          notes
        }
      });

      return { product, transaction };
    });
  },

  findAllTransactions: async () => {
    return prisma.inventoryTransaction.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
