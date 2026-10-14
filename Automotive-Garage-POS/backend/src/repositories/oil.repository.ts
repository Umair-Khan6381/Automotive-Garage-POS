import prisma from '../database/prisma';

export const oilRepository = {
  findAll: async () => {
    return prisma.oilChange.findMany({
      include: {
        vehicle: true,
        customer: true,
        product: true
      },
      orderBy: { serviceDate: 'desc' }
    });
  },

  create: async (data: any) => {
    return prisma.oilChange.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.oilChange.update({ where: { id }, data });
  }
};

export const settingRepository = {
  getSettings: async () => {
    let settings = await prisma.garageSetting.findFirst();
    if (!settings) {
      settings = await prisma.garageSetting.create({
        data: {
          id: 'garage-config-main',
          shopName: 'Umair Ullah Auto Workshop',
          garageName: 'Umair Ullah Auto Workshop',
          garageOwnerName: 'Umair Ullah',
          garagePhone: '+92 300 1234567',
          garageEmail: 'owner@example.com',
          address: 'Main Workshop Boulevard, Commercial Area'
        }
      });
    }
    return settings;
  },

  updateSettings: async (data: any) => {
    const current = await settingRepository.getSettings();
    return prisma.garageSetting.update({
      where: { id: current.id },
      data
    });
  }
};
