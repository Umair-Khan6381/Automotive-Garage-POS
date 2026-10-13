/**
 * Shared System Constants for Garage POS & Workshop Management
 */

export const USER_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const JOB_STATUS = {
  DRAFT: 'draft',
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  UNPAID: 'unpaid'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Online', 'Other'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const INVENTORY_TRANSACTION_TYPES = [
  'purchase',
  'sale',
  'job_usage',
  'return',
  'adjustment',
  'damage',
  'opening_stock'
] as const;
export type InventoryTransactionType = typeof INVENTORY_TRANSACTION_TYPES[number];

export const DEFAULT_GARAGE_CONFIG = {
  name: 'Umair Ullah Auto Workshop',
  currency: 'Rs.',
  lowStockThreshold: 5,
  defaultOilIntervalKm: 5000,
  defaultOilIntervalMonths: 3
};
