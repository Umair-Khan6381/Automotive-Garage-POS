/**
 * Shared Validator Functions used across Backend API and Frontend Clients
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCustomerInput = (data: {
  fullName?: string;
  phone?: string;
  email?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Customer full name must be at least 2 characters.';
  }

  if (!data.phone || data.phone.trim().length < 7) {
    errors.phone = 'Valid phone number is required (min 7 digits).';
  }

  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateVehicleInput = (data: {
  registrationNumber?: string;
  make?: string;
  model?: string;
  currentMileage?: number;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.registrationNumber || data.registrationNumber.trim().length < 2) {
    errors.registrationNumber = 'Registration number is required.';
  }

  if (!data.make || data.make.trim().length < 2) {
    errors.make = 'Vehicle make is required.';
  }

  if (!data.model || data.model.trim().length < 1) {
    errors.model = 'Vehicle model is required.';
  }

  if (data.currentMileage !== undefined && data.currentMileage < 0) {
    errors.currentMileage = 'Mileage cannot be negative.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateProductInput = (data: {
  name?: string;
  sku?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  currentQuantity?: number;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Part name is required.';
  }

  if (!data.sku || data.sku.trim().length < 2) {
    errors.sku = 'SKU / Part Code is required.';
  }

  if (data.purchasePrice === undefined || data.purchasePrice < 0) {
    errors.purchasePrice = 'Purchase cost must be a non-negative number.';
  }

  if (data.sellingPrice === undefined || data.sellingPrice < 0) {
    errors.sellingPrice = 'Selling price must be a non-negative number.';
  }

  if (data.currentQuantity === undefined || data.currentQuantity < 0) {
    errors.currentQuantity = 'Quantity must be 0 or greater.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
