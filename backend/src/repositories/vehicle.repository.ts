import prisma from '../database/prisma';

export const vehicleRepository = {
  findAll: async () => {
    return prisma.vehicle.findMany({
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
        repairJobs: true,
        oilChanges: true
      }
    });
  },

  findByRegistration: async (registrationNumber: string) => {
    return prisma.vehicle.findUnique({
      where: { registrationNumber }
    });
  },

  create: async (data: any) => {
    return prisma.vehicle.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.vehicle.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.vehicle.delete({ where: { id } });
  }
};
