/**
 * TypeScript Data Models and Database Schema Mapping for SQLite / Node.js
 * Compatible with Drizzle ORM and standard SQLite interfaces.
 */

export interface DbGarageSettings {
  id: string;
  shop_name: string;
  garage_name: string;
  garage_owner_name: string;
  garage_phone: string;
  garage_email: string;
  address: string;
  tagline: string | null;
  tax_number: string | null;
  currency: string;
  default_tax_rate: number;
  invoice_prefix: string;
  private_mode: number;
  setup_completed: number;
  low_stock_threshold: number;
  default_oil_interval_km: number;
  default_oil_interval_months: number;
  created_at: string;
  updated_at: string;
}

export interface DbUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  role: 'owner' | 'manager' | 'employee';
  status: 'active' | 'disabled';
  password_hash: string;
  salt: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface DbCustomer {
  id: string;
  full_name: string;
  phone: string;
  alternate_phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_date: string;
  updated_date: string;
}

export interface DbVehicle {
  id: string;
  customer_id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  vin: string | null;
  engine_number: string | null;
  current_mileage: number;
  fuel_type: string;
  notes: string | null;
  created_date: string;
  updated_date: string;
}

export interface DbProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  purchase_price: number;
  selling_price: number;
  current_quantity: number;
  min_stock_level: number;
  supplier: string | null;
  shelf_location: string | null;
  description: string | null;
  created_date: string;
  updated_date: string;
}

export interface DbInventoryTransaction {
  id: string;
  product_id: string;
  type: 'purchase' | 'sale' | 'job_usage' | 'return' | 'adjustment' | 'damage' | 'opening_stock';
  quantity: number;
  unit_cost: number;
  reference_id: string | null;
  notes: string | null;
  created_date: string;
}

export interface DbPurchase {
  id: string;
  invoice_number: string | null;
  supplier: string;
  date: string;
  total_amount: number;
  items_json: string;
  notes: string | null;
  created_by: string | null;
  created_date: string;
}

export interface DbLabourWorker {
  id: string;
  name: string;
  phone: string;
  position: string;
  rate_type: 'daily' | 'hourly' | 'fixed_job';
  rate_amount: number;
  status: 'active' | 'inactive';
  created_date: string;
}

export interface DbLabourPayment {
  id: string;
  worker_id: string;
  date: string;
  amount: number;
  payment_method: string;
  period_start: string | null;
  period_end: string | null;
  notes: string | null;
  created_date: string;
}

export interface DbJobCard {
  id: string;
  job_number: string;
  customer_id: string;
  vehicle_id: string;
  date: string;
  mileage_in: number;
  customer_complaint: string;
  diagnosis: string | null;
  work_required: string | null;
  assigned_labour_json: string;
  parts_used_json: string;
  additional_services_json: string;
  photos_json: string;
  estimated_cost: number;
  final_cost: number;
  status: 'draft' | 'waiting' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  invoice_id: string | null;
  notes: string | null;
  created_date: string;
  updated_date: string;
}

export interface DbInvoice {
  id: string;
  invoice_number: string;
  job_card_id: string | null;
  customer_id: string;
  vehicle_id: string | null;
  date: string;
  parts_total: number;
  labour_total: number;
  services_total: number;
  discount_amount: number;
  tax_amount: number;
  tax_rate: number;
  grand_total: number;
  paid_amount: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  payment_method: string;
  items_json: string;
  notes: string | null;
  created_date: string;
  updated_date: string;
}

export interface DbPayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'Cash' | 'Card' | 'Bank Transfer' | 'Online' | 'Other';
  reference_number: string | null;
  received_by: string;
  notes: string | null;
  created_date: string;
}

export interface DbOilChange {
  id: string;
  vehicle_id: string;
  customer_id: string;
  service_date: string;
  current_mileage: number;
  next_recommended_mileage: number;
  next_recommended_date: string;
  oil_brand: string;
  oil_type: string;
  oil_quantity: number;
  oil_filter_part_number: string | null;
  technician_name: string;
  cost_price: number;
  selling_price: number;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  notes: string | null;
  created_date: string;
}

export interface DbExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method: string;
  recipient: string | null;
  receipt_number: string | null;
  notes: string | null;
  created_date: string;
}

export interface DbAuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: string;
  module: string;
  action: string;
  record_id: string;
  description: string;
  ip_address: string;
}
