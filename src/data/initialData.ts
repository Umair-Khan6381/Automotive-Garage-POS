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
  AuditLog
} from '../types';

// ============================================================================
// 🔑 HARDCODED OWNER & ADMIN CREDENTIALS (ایڈمن لاگ ان اور اونر کا نام و پاسورڈ)
// File: /src/data/initialData.ts
// ============================================================================
export const HARDCODED_OWNER = {
  name: 'Umair Ullah',          // Owner Name
  username: 'umair',            // Login Username
  password: 'umair123#',        // Login Password
  email: 'owner@example.com',   // Login Email
  phone: '+92 300 1234567',     // Contact Phone
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
    createdAt: '2026-09-28T00:00:00.000Z',
    updatedAt: '2026-09-28T00:00:00.000Z',
    lastLogin: '2026-09-28T06:00:00.000Z'
  }
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'Umair Auto Care',
  garageName: 'Umair Auto Care',
  garageOwnerName: HARDCODED_OWNER.name,
  garagePhone: HARDCODED_OWNER.phone,
  garageEmail: HARDCODED_OWNER.email,
  privateMode: true,
  setupCompleted: true,
  tagline: 'Precision Mechanics & Automotive Workshop',
  phone: HARDCODED_OWNER.phone,
  email: HARDCODED_OWNER.email,
  address: 'Commercial Workshop Yard 4, Main Boulevard, Auto Market',
  taxNumber: 'NTN: 7849102-4 (Tax Registered)',
  currency: 'Rs.',
  defaultTaxRate: 0,
  invoicePrefix: 'INV-2026-',
  invoiceFooterNote: 'Thank you for choosing Umair Auto Care! All parts and labour include a 30-day warranty.',
  defaultOilChangeMonths: 3,
  defaultOilChangeKm: 5000,
  allowNegativeStock: false,
  lowStockThreshold: 10
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Ahmed Khan',
    phone: '0300-5551234',
    email: 'ahmed.khan@gmail.com',
    address: 'House 142, Street 8, Phase 5, DHA, Lahore',
    notes: 'Regular customer. Prefers Shell Helix Ultra synthetic oil.',
    createdDate: '2026-06-15'
  },
  {
    id: 'cust-2',
    fullName: 'Bilal Motors (Bilal Siddiqui)',
    phone: '0321-4447890',
    email: 'bilal@bilalmotors.pk',
    address: 'Plot 12, Main Boulevard, Gulberg III, Lahore',
    notes: 'Corporate fleet client. Multiple executive vehicles.',
    createdDate: '2026-07-02'
  },
  {
    id: 'cust-3',
    fullName: 'Hamza Ali',
    phone: '0333-8884321',
    email: 'hamza.ali90@hotmail.com',
    address: 'Sector F-7/2, Street 19, Islamabad',
    notes: 'Always checks brake pads and suspension before northern trips.',
    createdDate: '2026-07-20'
  },
  {
    id: 'cust-4',
    fullName: 'Muhammad Usman',
    phone: '0345-9992145',
    email: 'usman.m@outlook.com',
    address: 'Block 4, Clifton, Karachi',
    notes: 'Commutes frequently between Lahore and Islamabad.',
    createdDate: '2026-08-01'
  },
  {
    id: 'cust-5',
    fullName: 'Zainab Fatima',
    phone: '0312-3336789',
    email: 'zainab.f@gmail.com',
    address: 'Phase 7, Bahria Town, Rawalpindi',
    notes: 'Requests complete vehicle health checkup every quarter.',
    createdDate: '2026-08-10'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    registrationNumber: 'LEA-19-4821',
    make: 'Toyota',
    model: 'Corolla GLi 1.3',
    year: 2021,
    color: 'Super White',
    engineNumber: '2NZ-819203',
    chassisNumber: 'NZE140-592019',
    mileage: 64200,
    customerId: 'cust-1',
    notes: 'Next oil service due soon. Replaced front brake pads at 55,000 km.',
    createdDate: '2026-06-15'
  },
  {
    id: 'veh-2',
    registrationNumber: 'ICT-BZ-804',
    make: 'Honda',
    model: 'Civic Oriel 1.8 i-VTEC',
    year: 2020,
    color: 'Taffeta White',
    engineNumber: 'R18Z-902144',
    chassisNumber: 'FC1-889102',
    mileage: 78500,
    customerId: 'cust-2',
    notes: 'Transmission fluid was serviced at 60,000 km. AC cooling checked recently.',
    createdDate: '2026-07-02'
  },
  {
    id: 'veh-3',
    registrationNumber: 'MN-22-1140',
    make: 'Suzuki',
    model: 'Swift DLX 1.2',
    year: 2022,
    color: 'Phoenix Red',
    engineNumber: 'K12M-738910',
    chassisNumber: 'ZC83S-301928',
    mileage: 38100,
    customerId: 'cust-3',
    notes: 'Suspension bushes in great condition. Needs air filter replacement.',
    createdDate: '2026-07-20'
  },
  {
    id: 'veh-4',
    registrationNumber: 'KHI-21-9942',
    make: 'Toyota',
    model: 'Yaris ATIV 1.5',
    year: 2023,
    color: 'Silver Metallic',
    engineNumber: '2NR-492011',
    chassisNumber: 'NSP151-112093',
    mileage: 22400,
    customerId: 'cust-4',
    notes: 'Under showroom warranty period. Uses 0W-20 Mobil synthetic.',
    createdDate: '2026-08-01'
  },
  {
    id: 'veh-5',
    registrationNumber: 'ICT-CW-912',
    make: 'KIA',
    model: 'Sportage AWD',
    year: 2022,
    color: 'Panthera Metal',
    engineNumber: 'G4NA-610293',
    chassisNumber: 'QL-891024',
    mileage: 45600,
    customerId: 'cust-5',
    notes: 'Brake pads worn to 20%. Advised replacement at next visit.',
    createdDate: '2026-08-10'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
    sku: 'OIL-SHL-5W40-4L',
    category: 'Engine Oil',
    brand: 'Shell',
    supplier: 'Pak Petroleum Distributors',
    purchasePrice: 7800,
    sellingPrice: 10500,
    currentQuantity: 42,
    minStockLevel: 12,
    unit: 'Cans',
    location: 'Rack A-01',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-2',
    name: 'Total Quartz 9000 5W-30 (4L)',
    sku: 'OIL-TOT-5W30-4L',
    category: 'Engine Oil',
    brand: 'TotalEnergies',
    supplier: 'Total Parco Pakistan',
    purchasePrice: 6800,
    sellingPrice: 9200,
    currentQuantity: 34,
    minStockLevel: 10,
    unit: 'Cans',
    location: 'Rack A-02',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-3',
    name: 'Mobil 1 Advanced Full Synthetic 0W-20 (4L)',
    sku: 'OIL-MOB-0W20-4L',
    category: 'Engine Oil',
    brand: 'Mobil 1',
    supplier: 'Alpha Lube Importers',
    purchasePrice: 9200,
    sellingPrice: 12800,
    currentQuantity: 18,
    minStockLevel: 8,
    unit: 'Cans',
    location: 'Rack A-03',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-4',
    name: 'Genuine Toyota Oil Filter (90915-YZZE1)',
    sku: 'FLT-TOY-YZZE1',
    category: 'Oil Filters',
    brand: 'Toyota Genuine',
    supplier: 'Indus Auto Parts Wholesale',
    purchasePrice: 1100,
    sellingPrice: 1650,
    currentQuantity: 58,
    minStockLevel: 15,
    unit: 'Pieces',
    location: 'Shelf B-01',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-5',
    name: 'Genuine Honda Oil Filter (15400-RAF-T01)',
    sku: 'FLT-HND-RAFT01',
    category: 'Oil Filters',
    brand: 'Honda Genuine',
    supplier: 'Atlas Auto Spares',
    purchasePrice: 1300,
    sellingPrice: 1950,
    currentQuantity: 32,
    minStockLevel: 12,
    unit: 'Pieces',
    location: 'Shelf B-02',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-6',
    name: 'Suzuki Genuine Oil Filter (16510-61A31)',
    sku: 'FLT-SZK-61A31',
    category: 'Oil Filters',
    brand: 'Suzuki Genuine',
    supplier: 'Pak Suzuki Regional Spares',
    purchasePrice: 850,
    sellingPrice: 1300,
    currentQuantity: 24,
    minStockLevel: 10,
    unit: 'Pieces',
    location: 'Shelf B-03',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-7',
    name: 'Denso Iridium Spark Plugs IK20 (Set of 4)',
    sku: 'SPK-DNS-IK20',
    category: 'Spark Plugs & Ignition',
    brand: 'Denso',
    supplier: 'Nippon Parts Lahore',
    purchasePrice: 4800,
    sellingPrice: 7200,
    currentQuantity: 14,
    minStockLevel: 8,
    unit: 'Sets',
    location: 'Shelf C-01',
    createdDate: '2026-05-12'
  },
  {
    id: 'prod-8',
    name: 'Akebono Ceramic Front Brake Pads (Corolla/Yaris)',
    sku: 'BRK-AKB-ACT923',
    category: 'Brake System',
    brand: 'Akebono Japan',
    supplier: 'Brake Master Imports',
    purchasePrice: 4200,
    sellingPrice: 6400,
    currentQuantity: 7, // Low Stock!
    minStockLevel: 10,
    unit: 'Sets',
    location: 'Shelf D-01',
    createdDate: '2026-05-15'
  },
  {
    id: 'prod-9',
    name: 'Brembo Ceramic Front Brake Pads (Civic X)',
    sku: 'BRK-BRM-P28077',
    category: 'Brake System',
    brand: 'Brembo',
    supplier: 'Euro Auto Components',
    purchasePrice: 6500,
    sellingPrice: 9500,
    currentQuantity: 5, // Low Stock!
    minStockLevel: 8,
    unit: 'Sets',
    location: 'Shelf D-02',
    createdDate: '2026-05-15'
  },
  {
    id: 'prod-10',
    name: 'Toyota Super Long Life Coolant Pink 50/50 (4L)',
    sku: 'CLT-TOY-SLLC-4L',
    category: 'Coolant & Fluids',
    brand: 'Toyota Genuine',
    supplier: 'Indus Auto Parts Wholesale',
    purchasePrice: 3200,
    sellingPrice: 4800,
    currentQuantity: 21,
    minStockLevel: 8,
    unit: 'Bottles',
    location: 'Rack E-01',
    createdDate: '2026-05-18'
  },
  {
    id: 'prod-11',
    name: 'Bosch DOT 4 High Performance Brake Fluid (500ml)',
    sku: 'FLD-BSH-DOT4-500',
    category: 'Coolant & Fluids',
    brand: 'Bosch',
    supplier: 'Euro Auto Components',
    purchasePrice: 750,
    sellingPrice: 1200,
    currentQuantity: 29,
    minStockLevel: 12,
    unit: 'Bottles',
    location: 'Rack E-02',
    createdDate: '2026-05-18'
  },
  {
    id: 'prod-12',
    name: 'AGS 12V 65Ah Maintenance Free Battery',
    sku: 'BAT-AGS-MF65',
    category: 'Batteries & Electrical',
    brand: 'AGS Atlas Battery',
    supplier: 'Atlas Battery Distributor',
    purchasePrice: 18500,
    sellingPrice: 23500,
    currentQuantity: 3, // Low stock!
    minStockLevel: 5,
    unit: 'Pieces',
    location: 'Heavy Bay H-1',
    createdDate: '2026-05-20'
  }
];

export const INITIAL_LABOUR_WORKERS: LabourWorker[] = [
  {
    id: 'lab-1',
    name: 'Ustad Rashid Mehmood',
    phone: '0301-8273645',
    role: 'Master Mechanic & Engine Specialist',
    dailyRate: 2500,
    hourlyRate: 350,
    status: 'active',
    joiningDate: '2024-03-01',
    notes: '22 years workshop experience. Specializes in Toyota and Honda engine overhauls.'
  },
  {
    id: 'lab-2',
    name: 'Tariq Mehmood',
    phone: '0322-9988771',
    role: 'Auto Electrician & Diagnostic Lead',
    dailyRate: 2200,
    hourlyRate: 300,
    status: 'active',
    joiningDate: '2024-06-15',
    notes: 'Expert in OBD-II scanners, wiring harnesses, ECM, and hybrid diagnostics.'
  },
  {
    id: 'lab-3',
    name: 'Sajid Ali',
    phone: '0334-1122334',
    role: 'Suspension & Brake Technician',
    dailyRate: 2000,
    hourlyRate: 280,
    status: 'active',
    joiningDate: '2025-01-10',
    notes: 'Fast and reliable on brake pad servicing, shock absorbers, and wheel hubs.'
  },
  {
    id: 'lab-4',
    name: 'Babar Hussain',
    phone: '0315-4455667',
    role: 'Lube Tech & Service Assistant',
    dailyRate: 1400,
    hourlyRate: 200,
    status: 'active',
    joiningDate: '2025-08-01',
    notes: 'Handles oil drains, filter replacements, fluid top-ups, and workshop cleanliness.'
  }
];

export const INITIAL_JOB_CARDS: JobCard[] = [
  {
    id: 'jc-1',
    jobNumber: 'JC-2026-082',
    customerId: 'cust-1',
    vehicleId: 'veh-1',
    date: '2026-09-24',
    mileage: 64200,
    complaint: 'Routine 60,000 km oil service + squeaking noise from front wheels during morning braking.',
    inspectionNotes: 'Front brake pads worn down to 2mm. Disc rotors have minor glazing but within spec. Recommended new pads.',
    assignedLabour: [
      {
        id: 'la-1',
        labourId: 'lab-1',
        labourName: 'Ustad Rashid Mehmood',
        rateType: 'fixed',
        rate: 1000,
        units: 1,
        costToShop: 1000,
        customerCharge: 1500,
        notes: 'Brake servicing & caliper cleaning'
      },
      {
        id: 'la-2',
        labourId: 'lab-4',
        labourName: 'Babar Hussain',
        rateType: 'fixed',
        rate: 500,
        units: 1,
        costToShop: 500,
        customerCharge: 800,
        notes: 'Oil & filter change labour'
      }
    ],
    partsUsed: [
      {
        id: 'pi-1',
        productId: 'prod-1',
        productName: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
        sku: 'OIL-SHL-5W40-4L',
        quantity: 1,
        unitCost: 7800,
        unitPrice: 10500,
        totalCost: 7800,
        totalPrice: 10500,
        profit: 2700
      },
      {
        id: 'pi-2',
        productId: 'prod-4',
        productName: 'Genuine Toyota Oil Filter (90915-YZZE1)',
        sku: 'FLT-TOY-YZZE1',
        quantity: 1,
        unitCost: 1100,
        unitPrice: 1650,
        totalCost: 1100,
        totalPrice: 1650,
        profit: 550
      },
      {
        id: 'pi-3',
        productId: 'prod-8',
        productName: 'Akebono Ceramic Front Brake Pads (Corolla/Yaris)',
        sku: 'BRK-AKB-ACT923',
        quantity: 1,
        unitCost: 4200,
        unitPrice: 6400,
        totalCost: 4200,
        totalPrice: 6400,
        profit: 2200
      }
    ],
    additionalServices: [
      {
        id: 'srv-1',
        name: 'Complete Vehicle 28-Point Inspection',
        charge: 500,
        cost: 0
      }
    ],
    estimatedCost: 21350,
    finalCost: 21350,
    status: 'completed',
    invoiceId: 'inv-1',
    notes: 'Customer notified. Car ready for delivery.',
    createdDate: '2026-09-24',
    updatedDate: '2026-09-24'
  },
  {
    id: 'jc-2',
    jobNumber: 'JC-2026-083',
    customerId: 'cust-2',
    vehicleId: 'veh-2',
    date: '2026-09-24',
    mileage: 78500,
    complaint: 'Check engine light on dashboard, slight misfire on idle after startup.',
    inspectionNotes: 'Scanned OBD code P0302 (Cylinder 2 Misfire). Spark plugs overdue for replacement. Ignition coils tested OK.',
    assignedLabour: [
      {
        id: 'la-3',
        labourId: 'lab-2',
        labourName: 'Tariq Mehmood',
        rateType: 'fixed',
        rate: 1500,
        units: 1,
        costToShop: 1500,
        customerCharge: 2200,
        notes: 'Electronic scan & spark plug replacement'
      }
    ],
    partsUsed: [
      {
        id: 'pi-4',
        productId: 'prod-7',
        productName: 'Denso Iridium Spark Plugs IK20 (Set of 4)',
        sku: 'SPK-DNS-IK20',
        quantity: 1,
        unitCost: 4800,
        unitPrice: 7200,
        totalCost: 4800,
        totalPrice: 7200,
        profit: 2400
      }
    ],
    additionalServices: [
      {
        id: 'srv-2',
        name: 'OBD-II Full System Computer Diagnostics',
        charge: 1000,
        cost: 0
      }
    ],
    estimatedCost: 10400,
    finalCost: 10400,
    status: 'in_progress',
    notes: 'Parts fitted. Running engine idle test.',
    createdDate: '2026-09-24',
    updatedDate: '2026-09-25'
  },
  {
    id: 'jc-3',
    jobNumber: 'JC-2026-084',
    customerId: 'cust-5',
    vehicleId: 'veh-5',
    date: '2026-09-25',
    mileage: 45600,
    complaint: 'AC blowing lukewarm air in afternoon traffic. Coolant level low in reservoir.',
    inspectionNotes: 'AC pressure gauge shows slight refrigerant loss. Radiator cap seal cracked. Need leak test.',
    assignedLabour: [
      {
        id: 'la-4',
        labourId: 'lab-2',
        labourName: 'Tariq Mehmood',
        rateType: 'fixed',
        rate: 1200,
        units: 1,
        costToShop: 1200,
        customerCharge: 1800,
        notes: 'AC system pressure test'
      }
    ],
    partsUsed: [],
    additionalServices: [],
    estimatedCost: 6500,
    finalCost: 1800,
    status: 'inspection',
    notes: 'Diagnosing leak before recharging refrigerant.',
    createdDate: '2026-09-25',
    updatedDate: '2026-09-25'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    date: '2026-09-24',
    dueDate: '2026-09-24',
    customerId: 'cust-1',
    vehicleId: 'veh-1',
    jobCardId: 'jc-1',
    items: [
      {
        id: 'ii-1',
        type: 'part',
        productId: 'prod-1',
        name: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
        quantity: 1,
        unitPrice: 10500,
        totalPrice: 10500,
        unitCost: 7800,
        totalCost: 7800
      },
      {
        id: 'ii-2',
        type: 'part',
        productId: 'prod-4',
        name: 'Genuine Toyota Oil Filter (90915-YZZE1)',
        quantity: 1,
        unitPrice: 1650,
        totalPrice: 1650,
        unitCost: 1100,
        totalCost: 1100
      },
      {
        id: 'ii-3',
        type: 'part',
        productId: 'prod-8',
        name: 'Akebono Ceramic Front Brake Pads (Corolla/Yaris)',
        quantity: 1,
        unitPrice: 6400,
        totalPrice: 6400,
        unitCost: 4200,
        totalCost: 4200
      },
      {
        id: 'ii-4',
        type: 'labour',
        name: 'Labour: Brake servicing & caliper cleaning (Ustad Rashid)',
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
        unitCost: 1000,
        totalCost: 1000
      },
      {
        id: 'ii-5',
        type: 'labour',
        name: 'Labour: Oil & filter change (Babar Hussain)',
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800,
        unitCost: 500,
        totalCost: 500
      },
      {
        id: 'ii-6',
        type: 'service',
        name: 'Complete Vehicle 28-Point Inspection',
        quantity: 1,
        unitPrice: 500,
        totalPrice: 500,
        unitCost: 0,
        totalCost: 0
      }
    ],
    partsTotal: 18550,
    labourTotal: 2300,
    servicesTotal: 500,
    subtotal: 21350,
    partsCost: 13100,
    labourCost: 1500,
    servicesCost: 0,
    discount: 350, // Courtesy discount
    discountType: 'fixed',
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 21000,
    paidAmount: 21000,
    balanceDue: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    notes: 'Paid in full via cash. Issued 30 days brake warranty stamp.',
    createdDate: '2026-09-24'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    date: '2026-08-20',
    dueDate: '2026-08-20',
    customerId: 'cust-2',
    vehicleId: 'veh-2',
    items: [
      {
        id: 'ii-21',
        type: 'part',
        productId: 'prod-2',
        name: 'Total Quartz 9000 5W-30 (4L)',
        quantity: 1,
        unitPrice: 9200,
        totalPrice: 9200,
        unitCost: 6800,
        totalCost: 6800
      },
      {
        id: 'ii-22',
        type: 'part',
        productId: 'prod-7',
        name: 'Denso Iridium Spark Plugs IK20 (Set of 4)',
        quantity: 1,
        unitPrice: 7200,
        totalPrice: 7200,
        unitCost: 4800,
        totalCost: 4800
      },
      {
        id: 'ii-23',
        type: 'labour',
        name: 'Labour: Spark plugs replacement & throttle body cleaning',
        quantity: 1,
        unitPrice: 2200,
        totalPrice: 2200,
        unitCost: 1500,
        totalCost: 1500
      },
      {
        id: 'ii-24',
        type: 'service',
        name: 'OBD-II Computer Diagnostics Scan',
        quantity: 1,
        unitPrice: 1000,
        totalPrice: 1000,
        unitCost: 0,
        totalCost: 0
      }
    ],
    partsTotal: 16400,
    labourTotal: 2200,
    servicesTotal: 1000,
    subtotal: 19600,
    partsCost: 11600,
    labourCost: 1500,
    servicesCost: 0,
    discount: 600,
    discountType: 'fixed',
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 19000,
    paidAmount: 19000,
    balanceDue: 0,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    notes: 'August periodic engine tune-up.',
    createdDate: '2026-08-20'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-003',
    date: '2026-07-16',
    dueDate: '2026-07-16',
    customerId: 'cust-3',
    vehicleId: 'veh-3',
    items: [
      {
        id: 'ii-31',
        type: 'part',
        productId: 'prod-8',
        name: 'Akebono Ceramic Front Brake Pads',
        quantity: 1,
        unitPrice: 6400,
        totalPrice: 6400,
        unitCost: 4200,
        totalCost: 4200
      },
      {
        id: 'ii-32',
        type: 'part',
        productId: 'prod-5',
        name: 'Guard Air Filter (Engine)',
        quantity: 1,
        unitPrice: 1450,
        totalPrice: 1450,
        unitCost: 950,
        totalCost: 950
      },
      {
        id: 'ii-33',
        type: 'labour',
        name: 'Labour: Front suspension bush replacement & brake caliper overhaul',
        quantity: 1,
        unitPrice: 3500,
        totalPrice: 3500,
        unitCost: 2000,
        totalCost: 2000
      },
      {
        id: 'ii-34',
        type: 'service',
        name: 'High-speed wheel balancing (2 wheels)',
        quantity: 1,
        unitPrice: 1200,
        totalPrice: 1200,
        unitCost: 0,
        totalCost: 0
      }
    ],
    partsTotal: 7850,
    labourTotal: 3500,
    servicesTotal: 1200,
    subtotal: 12550,
    partsCost: 5150,
    labourCost: 2000,
    servicesCost: 0,
    discount: 550,
    discountType: 'fixed',
    taxRate: 0,
    taxAmount: 0,
    grandTotal: 12000,
    paidAmount: 12000,
    balanceDue: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    notes: 'July brake and suspension service.',
    createdDate: '2026-07-16'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    amount: 21000,
    paymentMethod: 'Cash',
    date: '2026-09-24',
    reference: 'CASH-REC-082',
    notes: 'Received at front desk cashier counter.',
    receivedBy: 'Tariq Malik'
  }
];

export const INITIAL_LABOUR_PAYMENTS: LabourPayment[] = [
  {
    id: 'lp-1',
    labourId: 'lab-1',
    labourName: 'Ustad Rashid Mehmood',
    amount: 15000,
    date: '2026-09-20',
    paymentPeriod: 'Week 37, Sept 2026',
    paymentMethod: 'Cash',
    reference: 'WAGE-W37-01',
    notes: 'Weekly wage settlement.',
    paidBy: 'Tariq Malik'
  },
  {
    id: 'lp-2',
    labourId: 'lab-2',
    labourName: 'Tariq Mehmood',
    amount: 13000,
    date: '2026-09-20',
    paymentPeriod: 'Week 37, Sept 2026',
    paymentMethod: 'Cash',
    reference: 'WAGE-W37-02',
    notes: 'Weekly wage settlement.',
    paidBy: 'Tariq Malik'
  }
];

export const INITIAL_OIL_CHANGES: OilChangeRecord[] = [
  {
    id: 'oil-1',
    vehicleId: 'veh-1',
    customerId: 'cust-1',
    date: '2026-09-24',
    mileage: 64200,
    oilProductId: 'prod-1',
    oilProductName: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
    quantityLiters: 4,
    cost: 7800,
    sellingPrice: 10500,
    nextRecommendedDate: '2026-12-24',
    nextRecommendedMileage: 69200,
    notes: 'Filter replaced with Genuine Toyota 90915-YZZE1.'
  },
  {
    id: 'oil-2',
    vehicleId: 'veh-3',
    customerId: 'cust-3',
    date: '2026-06-18',
    mileage: 33200,
    oilProductId: 'prod-2',
    oilProductName: 'Total Quartz 9000 5W-30 (4L)',
    quantityLiters: 3.5,
    cost: 6800,
    sellingPrice: 9200,
    nextRecommendedDate: '2026-09-18', // OVERDUE!
    nextRecommendedMileage: 38200,    // Current is 38,100 km (within 100km!)
    notes: 'Overdue for next periodic lube service.'
  },
  {
    id: 'oil-3',
    vehicleId: 'veh-2',
    customerId: 'cust-2',
    date: '2026-08-05',
    mileage: 74100,
    oilProductId: 'prod-2',
    oilProductName: 'Total Quartz 9000 5W-30 (4L)',
    quantityLiters: 4,
    cost: 6800,
    sellingPrice: 9200,
    nextRecommendedDate: '2026-11-05',
    nextRecommendedMileage: 79100,    // Current is 78,500 (Due within 600km!)
    notes: 'Next service approaching in ~600 km.'
  }
];

export const INITIAL_RENTS: WorkshopRent[] = [
  {
    id: 'rent-2026-09',
    month: '2026-09',
    monthLabel: 'September 2026',
    amount: 80000,
    paidAmount: 80000,
    paymentDate: '2026-09-05',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'Paid via Meezan Bank Online Transfer to Landlord Malik Jahangir',
    createdDate: '2026-09-01'
  },
  {
    id: 'rent-2026-08',
    month: '2026-08',
    monthLabel: 'August 2026',
    amount: 80000,
    paidAmount: 80000,
    paymentDate: '2026-08-04',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'August workshop premises rent cleared',
    createdDate: '2026-08-01'
  },
  {
    id: 'rent-2026-07',
    month: '2026-07',
    monthLabel: 'July 2026',
    amount: 80000,
    paidAmount: 80000,
    paymentDate: '2026-07-05',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'July workshop premises rent cleared',
    createdDate: '2026-07-01'
  }
];

export const INITIAL_LICENSES: LicenseRecord[] = [
  {
    id: 'lic-1',
    name: 'Municipal Corporation Auto Workshop Trade License',
    licenseNumber: 'MCL-TRD-2026-9041',
    issuingAuthority: 'Municipal Corporation Commercial Directorate',
    issueDate: '2025-10-15',
    expiryDate: '2026-10-14',
    renewalCost: 15000,
    paymentDate: '2025-10-15',
    paymentMethod: 'Bank Transfer',
    status: 'Expiring Soon',
    notes: 'Annual commercial workshop operations permit. Renewal due within 30 days.',
    createdDate: '2025-10-15'
  },
  {
    id: 'lic-2',
    name: 'Punjab Environmental Protection Agency (EPA) Emission Clearance',
    licenseNumber: 'EPA-WRK-4412-B',
    issuingAuthority: 'Environmental Protection Agency',
    issueDate: '2026-01-10',
    expiryDate: '2027-01-09',
    renewalCost: 12000,
    paymentDate: '2026-01-10',
    paymentMethod: 'Bank Transfer',
    status: 'Active',
    notes: 'Waste oil handling and environmental compliance certificate.',
    createdDate: '2026-01-10'
  },
  {
    id: 'lic-3',
    name: 'Civil Defence & Fire Safety Compliance Certificate',
    licenseNumber: 'CD-FIRE-2026-088',
    issuingAuthority: 'Civil Defence Department',
    issueDate: '2026-09-10',
    expiryDate: '2027-09-09',
    renewalCost: 5000,
    paymentDate: '2026-09-10',
    paymentMethod: 'Cash',
    status: 'Active',
    notes: 'Fire extinguishers installed and inspected. Valid for 1 year.',
    createdDate: '2026-09-10'
  }
];

export const INITIAL_ELECTRICITY_BILLS: ElectricityBill[] = [
  {
    id: 'elec-2026-09',
    billingMonth: '2026-09',
    monthLabel: 'September 2026',
    billNumber: 'LESCO-9923841-09',
    previousReading: 14200,
    currentReading: 14980,
    unitsConsumed: 780,
    billAmount: 27400,
    paidAmount: 27400,
    issueDate: '2026-09-08',
    dueDate: '2026-09-22',
    paymentDate: '2026-09-15',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: '3-phase commercial meter peak consumption cleared.',
    createdDate: '2026-09-08'
  },
  {
    id: 'elec-2026-08',
    billingMonth: '2026-08',
    monthLabel: 'August 2026',
    billNumber: 'LESCO-9923841-08',
    previousReading: 13350,
    currentReading: 14200,
    unitsConsumed: 850,
    billAmount: 32500,
    paidAmount: 32500,
    issueDate: '2026-08-08',
    dueDate: '2026-08-22',
    paymentDate: '2026-08-16',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'August commercial electricity bill paid via bank.',
    createdDate: '2026-08-08'
  },
  {
    id: 'elec-2026-07',
    billingMonth: '2026-07',
    monthLabel: 'July 2026',
    billNumber: 'LESCO-9923841-07',
    previousReading: 12600,
    currentReading: 13350,
    unitsConsumed: 750,
    billAmount: 29000,
    paidAmount: 29000,
    issueDate: '2026-07-08',
    dueDate: '2026-07-22',
    paymentDate: '2026-07-15',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'July electricity bill paid in full.',
    createdDate: '2026-07-08'
  }
];

export const INITIAL_EXPENSES: ShopExpense[] = [
  // September 29 Daily Expenses (Matches examples in spec)
  {
    id: 'exp-d1',
    title: 'Staff Morning Breakfast (Parathas, Omelettes & Chana)',
    category: 'Breakfast',
    type: 'daily',
    amount: 800,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Morning breakfast for shop technicians and apprentices',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d2',
    title: 'Morning Workshop Tea (First Round)',
    category: 'Tea',
    type: 'daily',
    amount: 150,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Morning tea from corner dhabba',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d3',
    title: 'Evening Workshop Tea (Second Round)',
    category: 'Tea',
    type: 'daily',
    amount: 150,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Evening tea with rusks for mechanics',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d4',
    title: 'Parts Pickup — Petrol (Bike fuel for collecting brake discs)',
    category: 'Conveyance',
    type: 'daily',
    amount: 1000,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Ustad Rashid',
    status: 'Paid',
    notes: 'Parts collection conveyance from Montgomery Road wholesale market',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d5',
    title: 'Workshop Floor Daily Cleaning & Waste Disposal',
    category: 'Cleaning',
    type: 'workshop',
    amount: 500,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Evening bay degreasing and pit cleaning',
    createdDate: '2026-09-29'
  },
  // Earlier September daily and operational expenses
  {
    id: 'exp-d6',
    title: 'Staff Lunch (Chicken Biryani for 6 technicians)',
    category: 'Lunch',
    type: 'daily',
    amount: 1200,
    date: '2026-09-28',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Overtime working day lunch',
    createdDate: '2026-09-28'
  },
  {
    id: 'exp-d7',
    title: 'Late Night Overtime Dinner (Karahi & Naan)',
    category: 'Dinner',
    type: 'daily',
    amount: 1500,
    date: '2026-09-27',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Dinner during engine rebuild overtime',
    createdDate: '2026-09-27'
  },
  {
    id: 'exp-d8',
    title: 'Shop Consumables, Degreaser & Cotton Waste',
    category: 'Shop Supplies',
    type: 'workshop',
    amount: 6200,
    date: '2026-09-18',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Brake cleaners, WD-40 spray cans, shop rags',
    createdDate: '2026-09-18'
  },
  {
    id: 'exp-d9',
    title: 'High-speed Fiber Internet Monthly Bill (Ptcl Flash)',
    category: 'Internet',
    type: 'fixed',
    amount: 4500,
    date: '2026-09-12',
    paymentMethod: 'Online Payment' as any,
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Workshop diagnostics computer internet connection',
    createdDate: '2026-09-12'
  },
  {
    id: 'exp-d10',
    title: 'Drinking Mineral Water Cans (Nestle 19L x 10)',
    category: 'Water',
    type: 'fixed',
    amount: 3500,
    date: '2026-09-14',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Customer lounge & technician drinking water delivery',
    createdDate: '2026-09-14'
  },
  {
    id: 'exp-d11',
    title: 'Workshop Security Guard Services (Night Shift)',
    category: 'Security',
    type: 'fixed',
    amount: 8000,
    date: '2026-09-02',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Private security agency monthly fee',
    createdDate: '2026-09-02'
  },
  // August Daily & Misc
  {
    id: 'exp-d12',
    title: 'August Staff Refreshments & Tea',
    category: 'Tea',
    type: 'daily',
    amount: 9500,
    date: '2026-08-20',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Monthly cumulative tea allowance',
    createdDate: '2026-08-20'
  },
  {
    id: 'exp-d13',
    title: 'August Conveyance & Petrol',
    category: 'Conveyance',
    type: 'daily',
    amount: 4200,
    date: '2026-08-22',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Parts collection runs',
    createdDate: '2026-08-22'
  },
  {
    id: 'exp-d14',
    title: 'August Shop Supplies & Solvent Barrels',
    category: 'Shop Supplies',
    type: 'workshop',
    amount: 3400,
    date: '2026-08-18',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Solvent barrels and oil drain tubs',
    createdDate: '2026-08-18'
  },
  {
    id: 'exp-d15',
    title: 'August Internet & Water',
    category: 'Other Fixed',
    type: 'fixed',
    amount: 7000,
    date: '2026-08-10',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Recurring utilities',
    createdDate: '2026-08-10'
  },
  // July Daily & Misc
  {
    id: 'exp-d16',
    title: 'July Staff Tea & Conveyance',
    category: 'Tea',
    type: 'daily',
    amount: 8800,
    date: '2026-07-22',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'July daily food, tea and travel',
    createdDate: '2026-07-22'
  },
  {
    id: 'exp-d17',
    title: 'Compressor Maintenance & Shop Supplies (July)',
    category: 'Shop Supplies',
    type: 'workshop',
    amount: 2800,
    date: '2026-07-20',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Pneumatic tools filter change and lubrication',
    createdDate: '2026-07-20'
  },
  {
    id: 'exp-d18',
    title: 'July Recurring Fixed Costs (Security & Water)',
    category: 'Other Fixed',
    type: 'fixed',
    amount: 8000,
    date: '2026-07-10',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Security guard & water',
    createdDate: '2026-07-10'
  }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-1',
    productId: 'prod-1',
    productName: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
    type: 'purchase',
    quantity: 50,
    unitCost: 7800,
    reference: 'PO-2026-041',
    date: '2026-09-10 11:30',
    user: 'Tariq Malik',
    notes: 'Supplier bulk shipment'
  },
  {
    id: 'tx-2',
    productId: 'prod-1',
    productName: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
    type: 'job_usage',
    quantity: -1,
    unitCost: 7800,
    reference: 'JC-2026-082',
    date: '2026-09-24 14:15',
    user: 'Hamza Farooq',
    notes: 'Used in Toyota Corolla LEA-19-4821'
  },
  {
    id: 'tx-3',
    productId: 'prod-8',
    productName: 'Akebono Ceramic Front Brake Pads (Corolla/Yaris)',
    type: 'job_usage',
    quantity: -1,
    unitCost: 4200,
    reference: 'JC-2026-082',
    date: '2026-09-24 14:20',
    user: 'Hamza Farooq',
    notes: 'Used in Toyota Corolla LEA-19-4821'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-24 14:30',
    userId: 'usr-1',
    userName: 'Tariq Malik',
    userRole: 'admin',
    action: 'Payment Received',
    module: 'Payment',
    recordId: 'inv-1',
    description: 'Received Rs. 21,000 cash for Invoice INV-2026-001 (Ahmed Khan)'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-24 14:15',
    userId: 'usr-3',
    userName: 'Hamza Farooq',
    userRole: 'employee',
    action: 'Inventory Deducted',
    module: 'Inventory',
    recordId: 'jc-1',
    description: 'Deducted 1x Shell Helix Ultra, 1x Oil Filter, 1x Akebono Brake Pads for Job JC-2026-082'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-24 10:00',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    action: 'Job Created',
    module: 'Job',
    recordId: 'jc-1',
    description: 'Created repair job card JC-2026-082 for Toyota Corolla (LEA-19-4821)'
  }
];
