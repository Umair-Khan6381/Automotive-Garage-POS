import {
  Customer,
  Vehicle,
  Product,
  LabourWorker,
  JobCard,
  Invoice,
  PaymentRecord,
  LabourPayment,
  OilChangeRecord,
  ShopExpense,
  WorkshopRent,
  LicenseRecord,
  ElectricityBill,
  InventoryTransaction,
  ShopSettings,
  User,
  AuditLog,
  PaymentProof,
  InvoicePrintEvent,
  UserSessionRecord,
  RecordChangeEntry
} from '../types';

// ============================================================================
// 🔑 OWNER ACCOUNT CREDENTIALS
// File: /src/data/initialData.ts
// ============================================================================
export const HARDCODED_OWNER = {
  name: 'Umair Ullah',
  username: 'umair',
  password: 'umair123#',
  email: 'owner@umairautocare.ae',
  phone: '+971 50 789 4521',
  role: 'owner' as const
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-owner-1',
    name: HARDCODED_OWNER.name,
    username: HARDCODED_OWNER.username,
    email: HARDCODED_OWNER.email,
    phone: HARDCODED_OWNER.phone,
    role: HARDCODED_OWNER.role,
    status: 'active',
    passwordHash: '47a5bb44b4bce90ceef8a09e6ace76dff0fcec789fb702ccb9a521d8ee3af4be',
    salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'Automotive Garage',
  garageName: 'Automotive Garage',
  garageOwnerName: HARDCODED_OWNER.name,
  garagePhone: HARDCODED_OWNER.phone,
  garageEmail: HARDCODED_OWNER.email,
  timezone: 'Asia/Dubai',
  privateMode: true,
  setupCompleted: true,
  tagline: 'Professional Automotive Repair & Workshop Management',
  phone: '',
  email: '',
  address: '',
  taxNumber: '',
  currency: 'AED',
  defaultTaxRate: 5,
  invoicePrefix: 'INV-',
  invoiceFooterNote: 'Thank you for your business! All repairs covered with standard warranty.',
  defaultOilChangeMonths: 6,
  defaultOilChangeKm: 10000,
  allowNegativeStock: false,
  lowStockThreshold: 10,
  trnNumber: '',
  dedLicenseNumber: '',
  rtaPermitNumber: '',
  dmEnvironmentalPermit: '',
  storageGraceHours: 72,
  dailyStorageFeeAED: 0,
  workmanshipWarrantyDays: 90,
  workmanshipWarrantyKm: 5000,
  enforcePolicePermitForAccidents: false
};

// ============================================================================
// 📦 EMPTY DATA STORES — Ready for user's own live records
// ============================================================================
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_VEHICLES: Vehicle[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_LABOUR_WORKERS: LabourWorker[] = [];
export const INITIAL_JOB_CARDS: JobCard[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_LABOUR_PAYMENTS: LabourPayment[] = [];
export const INITIAL_OIL_CHANGES: OilChangeRecord[] = [];
export const INITIAL_RENTS: WorkshopRent[] = [];
export const INITIAL_LICENSES: LicenseRecord[] = [];
export const INITIAL_ELECTRICITY_BILLS: ElectricityBill[] = [];
export const INITIAL_EXPENSES: ShopExpense[] = [];
export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_USER_SESSIONS: UserSessionRecord[] = [];
export const INITIAL_RECORD_CHANGES: RecordChangeEntry[] = [];
export const INITIAL_PRINT_HISTORY: InvoicePrintEvent[] = [];
export const INITIAL_PAYMENT_PROOFS: PaymentProof[] = [];
