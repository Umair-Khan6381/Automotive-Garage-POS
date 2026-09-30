-- ============================================================================
-- PRIVATE AUTOMOTIVE GARAGE POS & WORKSHOP MANAGEMENT SYSTEM
-- SQLite Database Schema Definition
-- File: src/db/init.sql
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Garage Settings
CREATE TABLE IF NOT EXISTS garage_settings (
  id TEXT PRIMARY KEY DEFAULT 'garage-config-main',
  shop_name TEXT NOT NULL,
  garage_name TEXT NOT NULL,
  garage_owner_name TEXT NOT NULL,
  garage_phone TEXT NOT NULL,
  garage_email TEXT NOT NULL,
  address TEXT NOT NULL,
  tagline TEXT,
  tax_number TEXT,
  currency TEXT NOT NULL DEFAULT 'Rs.',
  default_tax_rate REAL NOT NULL DEFAULT 0.0,
  invoice_prefix TEXT NOT NULL DEFAULT 'INV-2026-',
  private_mode INTEGER NOT NULL DEFAULT 1,
  setup_completed INTEGER NOT NULL DEFAULT 1,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  default_oil_interval_km INTEGER NOT NULL DEFAULT 5000,
  default_oil_interval_months INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK(role IN ('owner', 'manager', 'employee')),
  status TEXT NOT NULL CHECK(status IN ('active', 'disabled')),
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);

-- 4. Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  vin TEXT,
  engine_number TEXT,
  current_mileage INTEGER NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL DEFAULT 'Petrol',
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON vehicles(customer_id);

-- 5. Inventory Products & Spare Parts
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  purchase_price REAL NOT NULL DEFAULT 0.0,
  selling_price REAL NOT NULL DEFAULT 0.0,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 5,
  supplier TEXT,
  shelf_location TEXT,
  description TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 6. Inventory Transactions (Auditable movements)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('purchase', 'sale', 'job_usage', 'return', 'adjustment', 'damage', 'opening_stock')),
  quantity INTEGER NOT NULL,
  unit_cost REAL NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON inventory_transactions(type);

-- 7. Stock Purchases (Purchase Orders)
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  invoice_number TEXT,
  supplier TEXT NOT NULL,
  date TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0.0,
  items_json TEXT NOT NULL,
  notes TEXT,
  created_by TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8. Labour Workers
CREATE TABLE IF NOT EXISTS labour_workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  rate_type TEXT NOT NULL CHECK(rate_type IN ('daily', 'hourly', 'fixed_job')),
  rate_amount REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL CHECK(status IN ('active', 'inactive')),
  created_date TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. Labour Payments & Payroll
CREATE TABLE IF NOT EXISTS labour_payments (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  date TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0.0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  period_start TEXT,
  period_end TEXT,
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (worker_id) REFERENCES labour_workers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_labour_payments_worker ON labour_payments(worker_id);

-- 10. Repair Job Cards
CREATE TABLE IF NOT EXISTS job_cards (
  id TEXT PRIMARY KEY,
  job_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  date TEXT NOT NULL,
  mileage_in INTEGER NOT NULL DEFAULT 0,
  customer_complaint TEXT NOT NULL,
  diagnosis TEXT,
  work_required TEXT,
  assigned_labour_json TEXT NOT NULL DEFAULT '[]',
  parts_used_json TEXT NOT NULL DEFAULT '[]',
  additional_services_json TEXT NOT NULL DEFAULT '[]',
  photos_json TEXT NOT NULL DEFAULT '[]',
  estimated_cost REAL NOT NULL DEFAULT 0.0,
  final_cost REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL CHECK(status IN ('draft', 'waiting', 'in_progress', 'completed', 'delivered', 'cancelled')),
  invoice_id TEXT,
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON job_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_vehicle ON job_cards(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_cards(status);

-- 11. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  job_card_id TEXT,
  customer_id TEXT NOT NULL,
  vehicle_id TEXT,
  date TEXT NOT NULL,
  parts_total REAL NOT NULL DEFAULT 0.0,
  labour_total REAL NOT NULL DEFAULT 0.0,
  services_total REAL NOT NULL DEFAULT 0.0,
  discount_amount REAL NOT NULL DEFAULT 0.0,
  tax_amount REAL NOT NULL DEFAULT 0.0,
  tax_rate REAL NOT NULL DEFAULT 0.0,
  grand_total REAL NOT NULL DEFAULT 0.0,
  paid_amount REAL NOT NULL DEFAULT 0.0,
  payment_status TEXT NOT NULL CHECK(payment_status IN ('paid', 'partial', 'unpaid')),
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  items_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);

-- 12. Payment Receipts
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0.0,
  payment_date TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Online', 'Other')),
  reference_number TEXT,
  received_by TEXT NOT NULL,
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- 13. Oil Change Tracking Records
CREATE TABLE IF NOT EXISTS oil_changes (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  service_date TEXT NOT NULL,
  current_mileage INTEGER NOT NULL,
  next_recommended_mileage INTEGER NOT NULL,
  next_recommended_date TEXT NOT NULL,
  oil_brand TEXT NOT NULL,
  oil_type TEXT NOT NULL,
  oil_quantity REAL NOT NULL,
  oil_filter_part_number TEXT,
  technician_name TEXT NOT NULL,
  cost_price REAL NOT NULL DEFAULT 0.0,
  selling_price REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL CHECK(status IN ('upcoming', 'due', 'overdue', 'completed')),
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
CREATE INDEX IF NOT EXISTS idx_oil_vehicle ON oil_changes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_oil_status ON oil_changes(status);

-- 14. Shop Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0.0,
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  recipient TEXT,
  receipt_number TEXT,
  notes TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  record_id TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1'
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module);
