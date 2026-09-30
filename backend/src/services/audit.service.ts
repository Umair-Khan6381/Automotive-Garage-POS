import { auditRepository } from '../repositories/audit.repository';

export const auditService = {
  getAll: async (limit: number = 100) => {
    return auditRepository.findAll(limit);
  },

  log: async (data: {
    userId: string;
    userName: string;
    userRole: string;
    module: string;
    action: string;
    recordId: string;
    description: string;
    ipAddress?: string;
  }) => {
    return auditRepository.create(data);
  }
};
