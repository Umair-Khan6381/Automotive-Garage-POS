import prisma from '../database/prisma';

export const userRepository = {
  findByUsernameOrEmail: async (identifier: string) => {
    return prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }]
      }
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  countUsers: async () => {
    return prisma.user.count();
  },

  findAll: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  create: async (data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    passwordHash: string;
    salt: string;
  }) => {
    return prisma.user.create({ data });
  },

  update: async (id: string, data: Partial<{
    name: string;
    phone: string;
    role: string;
    status: string;
    passwordHash: string;
    salt: string;
    lastLogin: Date;
  }>) => {
    return prisma.user.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  }
};
