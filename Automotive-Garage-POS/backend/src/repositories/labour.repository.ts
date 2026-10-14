import prisma from '../database/prisma';

export const labourRepository = {
  findAllWorkers: async () => {
    return prisma.labourWorker.findMany({
      include: {
        payments: {
          orderBy: { date: 'desc' }
        },
        assignments: {
          include: { job: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  findWorkerById: async (id: string) => {
    return prisma.labourWorker.findUnique({
      where: { id },
      include: {
        payments: { orderBy: { date: 'desc' } },
        assignments: { include: { job: true } }
      }
    });
  },

  createWorker: async (data: {
    name: string;
    phone: string;
    position: string;
    rateType?: string;
    rateAmount?: number;
    status?: string;
  }) => {
    return prisma.labourWorker.create({ data });
  },

  updateWorker: async (id: string, data: any) => {
    return prisma.labourWorker.update({ where: { id }, data });
  },

  deleteWorker: async (id: string) => {
    return prisma.labourWorker.delete({ where: { id } });
  },

  findAllPayments: async () => {
    return prisma.labourPayment.findMany({
      include: {
        worker: true
      },
      orderBy: { date: 'desc' }
    });
  },

  createPayment: async (data: {
    workerId: string;
    amount: number;
    paymentMethod?: string;
    date?: Date;
    periodStart?: Date;
    periodEnd?: Date;
    notes?: string;
  }) => {
    return prisma.labourPayment.create({ data });
  }
};
