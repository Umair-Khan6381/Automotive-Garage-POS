import { customerRepository } from '../repositories/customer.repository';

export const customerService = {
  getAll: async () => {
    return customerRepository.findAll();
  },

  getById: async (id: string) => {
    return customerRepository.findById(id);
  },

  create: async (data: {
    fullName: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    return customerRepository.create(data);
  },

  update: async (id: string, data: any) => {
    return customerRepository.update(id, data);
  },

  delete: async (id: string) => {
    return customerRepository.delete(id);
  }
};
