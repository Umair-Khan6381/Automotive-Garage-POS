import prisma from '../database/prisma';

export const jobRepository = {
  findAll: async () => {
    return prisma.repairJob.findMany({
      include: {
        customer: true,
        vehicle: true,
        partsUsed: {
          include: {
            product: true
          }
        },
        labourAssigned: {
          include: {
            worker: true
          }
        },
        photos: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.repairJob.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        partsUsed: {
          include: {
            product: true
          }
        },
        labourAssigned: {
          include: {
            worker: true
          }
        },
        photos: true
      }
    });
  },

  create: async (data: any) => {
    return prisma.repairJob.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.repairJob.update({ where: { id }, data });
  },

  addPart: async (jobId: string, partData: any) => {
    return prisma.jobPart.create({
      data: {
        jobId,
        ...partData
      }
    });
  },

  removePart: async (id: string) => {
    return prisma.jobPart.delete({ where: { id } });
  },

  addLabour: async (jobId: string, labourData: any) => {
    return prisma.jobLabour.create({
      data: {
        jobId,
        ...labourData
      }
    });
  },

  removeLabour: async (id: string) => {
    return prisma.jobLabour.delete({ where: { id } });
  },

  addPhoto: async (jobId: string, photoUrl: string, caption?: string) => {
    return prisma.jobPhoto.create({
      data: {
        jobId,
        photoUrl,
        caption
      }
    });
  }
};
