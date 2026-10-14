import prisma from '../database/prisma';

export const supplierRepository = {
  findAll: async () => {
    return prisma.supplier.findMany({
      include: {
        products: true,
        purchases: {
          orderBy: { date: 'desc' },
          take: 10
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  findById: async (id: string) => {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        products: true,
        purchases: {
          include: {
            items: {
              include: { product: true }
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });
  },

  create: async (data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    return prisma.supplier.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.supplier.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.supplier.delete({ where: { id } });
  }
};
