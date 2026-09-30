// Comprehensive Domain Types for Automotive Repair Shop POS & Workshop Management System

export type UserRole = 'owner' | 'manager' | 'employee' | 'admin';
export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordHash?: string;
  salt?: string;
  avatar?: string;
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  expiresAt: number;
  loginTime: string;
}

export interface SetupFormData {
  fullName: string;
  garageName: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  createdDate: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // e.g. "LEA-19-4821", unique
  make: string;               // e.g. "Toyota"
  model: string;              // e.g. "Corolla GLi"
  year: number;               // e.g. 2021
  color: string;
  engineNumber?: string;
  chassisNumber?: string;
  mileage: number;            // Current km
  customerId: string;
  notes?: string;
  createdDate: string;
}

export type ProductCategory =
  | 'Engine Oil'
  | 'Oil Filters'
  | 'Air & Cabin Filters'
  | 'Brake System'
  | 'Suspension & Steering'
  | 'Spark Plugs & Ignition'
  | 'Batteries & Electrical'
  | 'Coolant & Fluids'
  | 'Belts & Hoses'
  | 'Tires & Wheels'
  | 'Transmission'
  | 'Shop Supplies';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  brand: string;
  supplier: string;
  purchasePrice: number;     // Weighted average cost per unit
  sellingPrice: number;      // Customer price per unit
  currentQuantity: number;
  minStockLevel: number;
  unit: string;              // 'Liters', 'Pieces', 'Sets', 'Bottles'
  location: string;          // 'Rack A-01', 'Shelf B-3'
  createdDate: string;
}

export type InventoryTransactionType =
  | 'purchase'
  | 'sale'
  | 'job_usage'
  | 'return'
  | 'adjustment'
  | 'damaged'
  | 'correction';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: InventoryTransactionType;
  quantity: number;          // Positive for increase, negative for deduction
  unitCost: number;          // Cost at transaction time
  reference: string;         // e.g. "PO-1002", "INV-2026-004", "JC-2026-084"
  date: string;
  user: string;
  notes?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  purchaseDate: string;
  invoiceNumber: string;     // Supplier invoice #
  items: PurchaseItem[];
  totalCost: number;
  notes?: string;
  createdDate: string;
  createdBy: string;
}

export type LabourStatus = 'active' | 'inactive' | 'on_leave';
export type LabourRateType = 'daily' | 'hourly' | 'fixed';

export interface LabourWorker {
  id: string;
  name: string;
  phone: string;
  role: string;              // e.g. 'Master Mechanic', 'Auto Electrician', 'AC Technician', 'Apprentice'
  dailyRate: number;         // e.g. Rs. 2,500
  hourlyRate: number;        // e.g. Rs. 350
  status: LabourStatus;
  joiningDate: string;
  notes?: string;
}

export interface LabourAssignment {
  id: string;
  labourId: string;
  labourName: string;
  rateType: LabourRateType;
  rate: number;              // Rate charged by or for the worker
  units: number;             // Days, Hours, or 1 for fixed
  costToShop: number;        // What shop owes the worker
  customerCharge: number;    // What customer pays for this labour
  notes?: string;
}

export interface JobPartItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;          // Shop cost
  unitPrice: number;         // Customer price
  totalCost: number;         // quantity * unitCost
  totalPrice: number;        // quantity * unitPrice
  profit: number;            // totalPrice - totalCost
}

export interface AdditionalServiceItem {
  id: string;
  name: string;              // e.g. 'Computer Diagnostic Scan', 'Wheel Alignment', 'AC Gas Recharge'
  charge: number;            // Customer price
  cost: number;              // Shop cost/consumables
}

export type JobStatus =
  | 'waiting'
  | 'inspection'
  | 'in_progress'
  | 'waiting_for_parts'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export interface JobCard {
  id: string;
  jobNumber: string;         // e.g. "JC-2026-084"
  customerId: string;
  vehicleId: string;
  date: string;
  mileage: number;
  complaint: string;
  inspectionNotes?: string;
  assignedLabour: LabourAssignment[];
  partsUsed: JobPartItem[];
  additionalServices: AdditionalServiceItem[];
  estimatedCost: number;
  finalCost: number;
  status: JobStatus;
  invoiceId?: string;
  photos?: string[];
  notes?: string;
  createdDate: string;
  updatedDate: string;
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid';

export interface InvoiceItem {
  id: string;
  type: 'part' | 'labour' | 'service';
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
  totalCost: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;     // e.g. "INV-2026-012"
  date: string;
  dueDate: string;
  customerId: string;
  vehicleId: string;
  jobCardId?: string;
  items: InvoiceItem[];
  partsTotal: number;
  labourTotal: number;
  servicesTotal: number;
  subtotal: number;
  partsCost: number;
  labourCost: number;
  servicesCost: number;
  discount: number;
  discountType: 'fixed' | 'percent';
  taxRate: number;           // e.g. 0 or 5 or 13 %
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdDate: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
  receivedBy: string;
}

export interface LabourPayment {
  id: string;
  labourId: string;
  labourName: string;
  amount: number;
  date: string;
  paymentPeriod: string;     // e.g. "Week 38, Sept 2026"
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  paidBy: string;
}

export interface VehicleServiceRecord {
  id: string;
  vehicleId: string;
  customerId: string;
  serviceType: string;
  serviceDate: string;
  mileage: number;
  productsUsedSummary: string[];
  labourSummary: string[];
  partsCost: number;
  labourCost: number;
  totalServiceCost: number;  // Selling price
  invoiceId?: string;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export type ServiceDueStatus = 'upcoming' | 'due' | 'overdue';

export interface OilChangeRecord {
  id: string;
  vehicleId: string;
  customerId: string;
  date: string;
  mileage: number;
  oilProductId: string;
  oilProductName: string;
  quantityLiters: number;
  cost: number;
  sellingPrice: number;
  nextRecommendedDate: string;
  nextRecommendedMileage: number;
  notes?: string;
}

export type ExpenseType = 'daily' | 'fixed' | 'legal' | 'workshop';

export type ExpenseCategory =
  // Food
  | 'Breakfast'
  | 'Tea'
  | 'Lunch'
  | 'Dinner'
  | 'Staff Food'
  | 'Guest Food'
  // Transport & Conveyance
  | 'Conveyance'
  | 'Petrol/Fuel'
  | 'Delivery'
  | 'Vehicle Transport'
  | 'Other Travel'
  // Workshop Operations
  | 'Cleaning'
  | 'Water'
  | 'Tools'
  | 'Small Repairs'
  | 'Maintenance'
  | 'Stationery'
  | 'Shop Supplies'
  | 'Miscellaneous'
  // Fixed & Recurring Overheads
  | 'Rent'
  | 'Electricity'
  | 'Internet'
  | 'Security'
  | 'Software Subscription'
  | 'Telephone'
  | 'Insurance'
  | 'License & Legal'
  | 'Other Fixed';

export type ExpenseStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Void' | 'Cancelled';

export interface ShopExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  type: ExpenseType;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  paidBy: string;
  status: ExpenseStatus;
  notes?: string;
  attachment?: string; // base64 or receipt URL/photo
  linkedEntityId?: string; // Links to rent ID, electricity bill ID, or license ID
  linkedEntityType?: 'rent' | 'electricity' | 'license';
  createdDate: string;
  updatedDate?: string;
  voidReason?: string;
}

export type RentStatus = 'Paid' | 'Pending' | 'Partially Paid';

export interface WorkshopRent {
  id: string;
  month: string; // e.g. "2026-09"
  monthLabel: string; // e.g. "September 2026"
  amount: number;
  paidAmount: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  status: RentStatus;
  notes?: string;
  attachment?: string;
  createdDate: string;
  updatedDate?: string;
}

export type LicenseStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Pending Renewal';

export interface LicenseRecord {
  id: string;
  name: string; // e.g. "Workshop Municipal Trade License", "Environmental EPA Permit"
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  renewalCost: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  status: LicenseStatus;
  notes?: string;
  attachment?: string;
  createdDate: string;
  updatedDate?: string;
}

export type ElectricityBillStatus = 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';

export interface ElectricityBill {
  id: string;
  billingMonth: string; // e.g. "2026-09"
  monthLabel: string; // e.g. "September 2026"
  billNumber?: string;
  previousReading?: number;
  currentReading?: number;
  unitsConsumed: number;
  billAmount: number;
  paidAmount: number;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  status: ElectricityBillStatus;
  notes?: string;
  attachment?: string;
  createdDate: string;
  updatedDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: 'Auth' | 'User' | 'Customer' | 'Vehicle' | 'Inventory' | 'Purchase' | 'Job' | 'Labour' | 'Invoice' | 'Payment' | 'Expenses' | 'Settings';
  recordId: string;
  description: string;
}

export interface ShopSettings {
  shopName: string;
  garageName?: string;
  garageOwnerName?: string;
  garagePhone?: string;
  garageEmail?: string;
  privateMode: boolean;        // Strict Private Garage Mode (Default: true)
  setupCompleted: boolean;     // First-time owner setup status
  tagline: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  currency: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  invoiceFooterNote: string;
  defaultOilChangeMonths: number;
  defaultOilChangeKm: number;
  allowNegativeStock: boolean;
  lowStockThreshold: number;
}
