/**
 * Shared Type Definitions between Backend, Desktop, and Mobile
 */

import { UserRole, JobStatus, PaymentStatus, PaymentMethod, InventoryTransactionType } from './constants';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  timestamp?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'disabled';
  lastLogin?: string;
}

export interface CustomerDTO {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  notes?: string;
  vehiclesCount?: number;
  totalSpent?: number;
  outstandingBalance?: number;
  createdDate: string;
  updatedDate: string;
}

export interface VehicleDTO {
  id: string;
  customerId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  vin?: string;
  engineNumber?: string;
  currentMileage: number;
  fuelType: string;
  notes?: string;
  customerName?: string;
  createdDate: string;
  updatedDate: string;
}

export interface ProductDTO {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  currentQuantity: number;
  minStockLevel: number;
  unit: string;
  supplier?: string;
  shelfLocation?: string;
  description?: string;
}

export interface JobCardDTO {
  id: string;
  jobNumber: string;
  customerId: string;
  vehicleId: string;
  date: string;
  mileage: number;
  complaint: string;
  diagnosis?: string;
  workRequired?: string;
  assignedLabour: Array<{
    id: string;
    labourId: string;
    labourName: string;
    units: number;
    costToShop: number;
    customerCharge: number;
  }>;
  partsUsed: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    totalCost: number;
    totalPrice: number;
  }>;
  additionalServices: Array<{
    id: string;
    name: string;
    charge: number;
    cost: number;
  }>;
  photos: string[];
  estimatedCost: number;
  finalCost: number;
  status: JobStatus;
  invoiceId?: string;
  notes?: string;
  createdDate: string;
  updatedDate: string;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  jobCardId?: string;
  customerId: string;
  vehicleId?: string;
  date: string;
  partsTotal: number;
  labourTotal: number;
  servicesTotal: number;
  subtotal: number;
  partsCost: number;
  labourCost: number;
  servicesCost: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: Array<{
    id: string;
    type: 'part' | 'labour' | 'service';
    productId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unitCost: number;
    totalCost: number;
  }>;
  notes?: string;
  createdDate: string;
}

export interface MonthlyProfitSummary {
  monthKey: string; // YYYY-MM
  label: string;    // Month Year
  invoiceCount: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  marginPercent: number;
}

export interface GrandProfitSummary {
  totalInvoices: number;
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  totalExpenses: number;
  grandNetProfit: number;
  grandMargin: number;
  monthlyBreakdown: MonthlyProfitSummary[];
}
