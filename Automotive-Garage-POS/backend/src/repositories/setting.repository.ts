import prisma from '../database/prisma';

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
          address: 'Main Workshop Boulevard, Commercial Area',
          currency: 'Rs.',
          defaultTaxRate: 0.0,
          invoicePrefix: 'INV-2026-',
          privateMode: true,
          setupCompleted: true
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
