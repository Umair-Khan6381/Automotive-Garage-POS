import prisma from '../database/prisma';

export const customerRepository = {
  findAll: async () => {
    return prisma.customer.findMany({
      include: {
        vehicles: true,
        invoices: {
          select: {
            id: true,
            grandTotal: true,
            paidAmount: true,
            balanceDue: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        invoices: true,
        repairJobs: true,
        oilChanges: true
      }
    });
  },

  create: async (data: {
    fullName: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return prisma.customer.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.customer.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.customer.delete({ where: { id } });
  }
};
