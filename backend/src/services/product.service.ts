import { productRepository } from '../repositories/product.repository';

export const productService = {
  getAll: async () => {
    return productRepository.findAll();
  },

  getById: async (id: string) => {
    return productRepository.findById(id);
  },

  getBySku: async (sku: string) => {
    return productRepository.findBySku(sku);
  },

  create: async (data: {
    sku: string;
    name: string;
    categoryId?: string;
    supplierId?: string;
    brand?: string;
    purchasePrice: number;
    sellingPrice: number;
    currentQuantity: number;
    minStockLevel?: number;
    unit?: string;
    shelfLocation?: string;
    description?: string;
  }) => {
    return productRepository.create(data);
  },

  update: async (id: string, data: any) => {
    return productRepository.update(id, data);
  },

  delete: async (id: string) => {
    return productRepository.delete(id);
  },

  adjustStock: async (
    productId: string,
    deltaQuantity: number,
    type: string,
    unitCost: number,
    referenceId?: string,
    notes?: string
  ) => {
    return productRepository.updateStock(
      productId,
      deltaQuantity,
      type,
      unitCost,
      referenceId,
      notes
    );
  }
};
