import { settingRepository } from '../repositories/setting.repository';

export const settingService = {
  getSettings: async () => {
    return settingRepository.getSettings();
  },

  updateSettings: async (data: any) => {
    return settingRepository.updateSettings(data);
  }
};
