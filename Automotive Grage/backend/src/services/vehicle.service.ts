import { vehicleRepository } from '../repositories/vehicle.repository';

export const vehicleService = {
  getAll: async () => {
    return vehicleRepository.findAll();
  },

  getById: async (id: string) => {
    return vehicleRepository.findById(id);
  },

  getByRegistration: async (registrationNumber: string) => {
    return vehicleRepository.findByRegistration(registrationNumber);
  },

  create: async (data: {
    customerId: string;
    registrationNumber: string;
    make: string;
    model: string;
    year?: number;
    color?: string;
    vin?: string;
    engineNumber?: string;
    currentMileage?: number;
    fuelType?: string;
    notes?: string;
  }) => {
    return vehicleRepository.create(data);
  },

  update: async (id: string, data: any) => {
    return vehicleRepository.update(id, data);
  },

  delete: async (id: string) => {
    return vehicleRepository.delete(id);
  }
};
