/**
 * Shared Business Validation Logic for Private Garage POS
 * Validates inputs for Customers, Vehicles, Products, Job Cards, Invoices, Labour, and Users.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 1. Customer Validation
export interface CustomerInput {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
}

export const validateCustomer = (data: CustomerInput): ValidationResult => {
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

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 2. Vehicle Validation
export interface VehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  year?: number;
  currentMileage?: number;
}

export const validateVehicle = (data: VehicleInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.registrationNumber || data.registrationNumber.trim().length < 2) {
    errors.registrationNumber = 'License registration number is required (e.g., ABC-123).';
  }

  if (!data.make || data.make.trim().length < 2) {
    errors.make = 'Vehicle make is required (e.g., Toyota, Honda).';
  }

  if (!data.model || data.model.trim().length < 1) {
    errors.model = 'Vehicle model is required (e.g., Corolla, Civic).';
  }

  if (data.year !== undefined && (data.year < 1960 || data.year > new Date().getFullYear() + 2)) {
    errors.year = `Year must be between 1960 and ${new Date().getFullYear() + 1}.`;
  }

  if (data.currentMileage !== undefined && data.currentMileage < 0) {
    errors.currentMileage = 'Mileage cannot be negative.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 3. Product / Spare Part Validation
export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  currentQuantity: number;
  minStockLevel?: number;
}

export const validateProduct = (data: ProductInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Part / product name is required.';
  }

  if (!data.sku || data.sku.trim().length < 2) {
    errors.sku = 'SKU / Part Code is required.';
  }

  if (data.purchasePrice < 0) {
    errors.purchasePrice = 'Purchase cost cannot be negative.';
  }

  if (data.sellingPrice < 0) {
    errors.sellingPrice = 'Selling price cannot be negative.';
  }

  if (data.currentQuantity < 0) {
    errors.currentQuantity = 'Quantity cannot be negative.';
  }

  if (data.minStockLevel !== undefined && data.minStockLevel < 0) {
    errors.minStockLevel = 'Minimum stock threshold cannot be negative.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 4. Job Card Validation
export interface JobCardInput {
  customerId: string;
  vehicleId: string;
  customerComplaint: string;
  mileageIn: number;
}

export const validateJobCard = (data: JobCardInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.customerId) {
    errors.customerId = 'Customer must be selected.';
  }

  if (!data.vehicleId) {
    errors.vehicleId = 'Vehicle must be selected.';
  }

  if (!data.customerComplaint || data.customerComplaint.trim().length < 3) {
    errors.customerComplaint = 'Customer complaint or inspection request is required.';
  }

  if (data.mileageIn < 0) {
    errors.mileageIn = 'Odometer mileage cannot be negative.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 5. Invoice Validation
export interface InvoiceInput {
  customerId: string;
  itemsCount: number;
  grandTotal: number;
  paidAmount: number;
}

export const validateInvoice = (data: InvoiceInput): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.customerId) {
    errors.customerId = 'Customer is required for invoice creation.';
  }

  if (data.itemsCount <= 0) {
    errors.items = 'At least one product, part, or labour item is required on the invoice.';
  }

  if (data.grandTotal < 0) {
    errors.grandTotal = 'Invoice grand total cannot be negative.';
  }

  if (data.paidAmount < 0) {
    errors.paidAmount = 'Paid amount cannot be negative.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 6. User Account Validation
export interface UserAccountInput {
  name: string;
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export const validateUserAccount = (data: UserAccountInput, isCreatingNew: boolean = true): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  }

  if (!data.username || data.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  } else if (!/^[a-zA-Z0-9._-]+$/.test(data.username)) {
    errors.username = 'Username can only contain letters, numbers, dots, and underscores.';
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Valid email address is required.';
  }

  if (isCreatingNew) {
    if (!data.password || data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
