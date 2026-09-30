import { supplierRepository } from '../repositories/supplier.repository';

export const supplierService = {
  getAll: async () => {
    return supplierRepository.findAll();
  },

  getById: async (id: string) => {
    return supplierRepository.findById(id);
  },

  create: async (data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    return supplierRepository.create(data);
  },

  update: async (id: string, data: any) => {
    return supplierRepository.update(id, data);
  },

  delete: async (id: string) => {
    return supplierRepository.delete(id);
  }
};
