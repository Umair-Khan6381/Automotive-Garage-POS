export const validateProductData = (body: any) => {
  const errors: Record<string, string> = {};
  if (!body.name || body.name.trim().length < 2) {
    errors.name = 'Part name is required.';
  }
  if (!body.sku || body.sku.trim().length < 2) {
    errors.sku = 'SKU / Part Code is required.';
  }
  if (body.purchasePrice === undefined || body.purchasePrice < 0) {
    errors.purchasePrice = 'Purchase price must be 0 or higher.';
  }
  if (body.sellingPrice === undefined || body.sellingPrice < 0) {
    errors.sellingPrice = 'Selling price must be 0 or higher.';
  }
  if (body.currentQuantity !== undefined && body.currentQuantity < 0) {
    errors.currentQuantity = 'Quantity cannot be negative.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};
