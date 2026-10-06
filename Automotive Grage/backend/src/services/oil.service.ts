import { oilRepository } from '../repositories/oil.repository';
import { vehicleRepository } from '../repositories/vehicle.repository';

export const oilService = {
  getAll: async () => {
    return oilRepository.findAll();
  },

  create: async (data: {
    vehicleId: string;
    customerId: string;
    oilProductId?: string;
    serviceDate?: Date;
    currentMileage: number;
    nextRecommendedMileage: number;
    nextRecommendedDate: Date;
    oilBrand: string;
    oilType: string;
    oilQuantity: number;
    oilFilterPartNumber?: string;
    technicianName: string;
    costPrice?: number;
    sellingPrice?: number;
    status?: string;
    notes?: string;
  }) => {
    const record = await oilRepository.create(data);

    // Update vehicle's current mileage if new mileage is higher
    const vehicle = await vehicleRepository.findById(data.vehicleId);
    if (vehicle && data.currentMileage > vehicle.currentMileage) {
      await vehicleRepository.update(data.vehicleId, {
        currentMileage: data.currentMileage
      });
    }

    return record;
  },

  update: async (id: string, data: any) => {
    return oilRepository.update(id, data);
  }
};
