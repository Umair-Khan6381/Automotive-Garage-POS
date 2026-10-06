import prisma from '../database/prisma';

export const auditRepository = {
  findAll: async (limit: number = 100) => {
    return prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true
          }
        }
      }
    });
  },

  create: async (data: {
    userId: string;
    userName: string;
    userRole: string;
    module: string;
    action: string;
    recordId: string;
    description: string;
    ipAddress?: string;
  }) => {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        module: data.module,
        action: data.action,
        recordId: data.recordId,
        description: data.description,
        ipAddress: data.ipAddress || '127.0.0.1'
      }
    });
  }
};
