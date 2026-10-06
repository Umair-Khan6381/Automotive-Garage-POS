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
// 🔑 HARDCODED OWNER & ADMIN CREDENTIALS — DUBAI, UAE
// File: /src/data/initialData.ts
// ============================================================================
export const HARDCODED_OWNER = {
  name: 'Umair Ullah',          // Owner Name
  username: 'umair',            // Login Username
  password: 'umair123#',        // Login Password
  email: 'owner@umairautocare.ae', // Login Email
  phone: '+971 50 789 4521',     // Dubai UAE Contact Phone
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
  },
  {
    id: 'usr-2',
    name: 'Kamran Siddiqui',
    username: 'kamran',
    email: 'kamran@umairautocare.ae',
    phone: '+971 52 341 8920',
    role: 'manager',
    status: 'active',
    passwordHash: '47a5bb44b4bce90ceef8a09e6ace76dff0fcec789fb702ccb9a521d8ee3af4be',
    salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    createdAt: '2026-09-28T00:00:00.000Z',
    updatedAt: '2026-09-28T00:00:00.000Z',
    lastLogin: '2026-09-29T08:30:00.000Z'
  },
  {
    id: 'usr-3',
    name: 'Hamza Farooq',
    username: 'hamza',
    email: 'hamza@umairautocare.ae',
    phone: '+971 54 902 1145',
    role: 'employee',
    status: 'active',
    passwordHash: '47a5bb44b4bce90ceef8a09e6ace76dff0fcec789fb702ccb9a521d8ee3af4be',
    salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    createdAt: '2026-09-28T00:00:00.000Z',
    updatedAt: '2026-09-28T00:00:00.000Z',
    lastLogin: '2026-09-29T09:00:00.000Z'
  }
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'Umair Auto Care LLC',
  garageName: 'Umair Auto Care LLC',
  garageOwnerName: HARDCODED_OWNER.name,
  garagePhone: HARDCODED_OWNER.phone,
  garageEmail: HARDCODED_OWNER.email,
  timezone: 'Asia/Dubai',
  privateMode: true,
  setupCompleted: true,
  tagline: 'Premium Auto Care & Mechanical Engineering — Dubai, UAE',
  phone: '+971 4 347 8899',
  email: 'service@umairautocare.ae',
  address: 'Warehouse #14, Street 18A, Al Quoz Industrial Area 3, Dubai, UAE',
  taxNumber: 'TRN: 100482937400003 (FTA Registered)',
  currency: 'AED',
  defaultTaxRate: 5, // 5% UAE VAT (Federal Tax Authority standard rate)
  invoicePrefix: 'INV-DXB-',
  invoiceFooterNote: 'Thank you for choosing Umair Auto Care LLC! All repairs covered under UAE Consumer Protection Law (Federal Law No. 15 of 2020) with 30-day warranty. UAE FTA 5% VAT Tax Invoice.',
  defaultOilChangeMonths: 6,
  defaultOilChangeKm: 10000,
  allowNegativeStock: false,
  lowStockThreshold: 10,
  trnNumber: '100482937400003',
  dedLicenseNumber: 'CN-1094829',
  rtaPermitNumber: 'RTA-VTS-2026-401',
  dmEnvironmentalPermit: 'DM-EHS-WST-8821',
  storageGraceHours: 72,
  dailyStorageFeeAED: 50,
  workmanshipWarrantyDays: 90,
  workmanshipWarrantyKm: 5000,
  enforcePolicePermitForAccidents: true
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Tariq Al Mansoori',
    phone: '+971 50 442 1982',
    email: 'tariq.mansoori@gmail.com',
    address: 'Villa 24, Street 12, Al Barsha 2, Dubai, UAE',
    notes: 'Regular VIP client. Prefers Shell Helix Ultra 5W-40 full synthetic.',
    createdDate: '2026-06-15'
  },
  {
    id: 'cust-2',
    fullName: 'Gulf Horizon Logistics LLC (Bilal Siddiqui)',
    phone: '+971 4 338 5511',
    email: 'operations@gulfhorizon.ae',
    address: 'Warehouse 8, Ras Al Khor Industrial Area 2, Dubai, UAE',
    notes: 'Commercial fleet client. Scheduled monthly maintenance.',
    createdDate: '2026-07-02'
  },
  {
    id: 'cust-3',
    fullName: 'Rashid Al Falasi',
    phone: '+971 55 918 2039',
    email: 'rashid.falasi@outlook.com',
    address: 'Apartment 1402, Boulevard Crescent, Downtown Dubai, UAE',
    notes: 'Always checks brake pads and suspension before highway travel.',
    createdDate: '2026-07-20'
  },
  {
    id: 'cust-4',
    fullName: 'Sarah Jenkins',
    phone: '+971 52 884 1029',
    email: 'sarah.j@dubaimarina.com',
    address: 'Princess Tower, Dubai Marina, Dubai, UAE',
    notes: 'Uses 0W-20 Mobil synthetic oil. Complete vehicle report requested.',
    createdDate: '2026-08-01'
  },
  {
    id: 'cust-5',
    fullName: 'Mohammed Al Hashemi',
    phone: '+971 56 312 9048',
    email: 'm.hashemi@gmail.com',
    address: 'Villa 12, Street 71, Mirdif, Dubai, UAE',
    notes: 'AC performance and cooling inspection scheduled every quarter.',
    createdDate: '2026-08-10'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    registrationNumber: 'Dubai A 48210',
    make: 'Toyota',
    model: 'Land Cruiser V8 5.7L',
    year: 2022,
    color: 'Pearl White',
    engineNumber: '3UR-819203',
    chassisNumber: 'JTM-8192039182',
    mileage: 64200,
    customerId: 'cust-1',
    notes: 'Next service due at 74,200 km. Front brake pads renewed at 55,000 km.',
    createdDate: '2026-06-15'
  },
  {
    id: 'veh-2',
    registrationNumber: 'Dubai B 80419',
    make: 'Nissan',
    model: 'Patrol Platinum 5.6 V8',
    year: 2021,
    color: 'Silver Metallic',
    engineNumber: 'VK56VD-902144',
    chassisNumber: 'JN1-9021448891',
    mileage: 78500,
    customerId: 'cust-2',
    notes: 'Transmission serviced at 60,000 km. AC dual zone checked OK.',
    createdDate: '2026-07-02'
  },
  {
    id: 'veh-3',
    registrationNumber: 'Dubai K 91204',
    make: 'Mercedes-Benz',
    model: 'C200 AMG Line',
    year: 2023,
    color: 'Obsidian Black',
    engineNumber: 'M264-738910',
    chassisNumber: 'WDD-7389103019',
    mileage: 38100,
    customerId: 'cust-3',
    notes: 'Suspension and dynamic steering in excellent condition.',
    createdDate: '2026-07-20'
  },
  {
    id: 'veh-4',
    registrationNumber: 'Dubai S 38100',
    make: 'Toyota',
    model: 'Camry SE Hybrid',
    year: 2022,
    color: 'Super White',
    engineNumber: 'A25A-FXS-492011',
    chassisNumber: '4T1-4920111120',
    mileage: 22400,
    customerId: 'cust-4',
    notes: 'Under hybrid system warranty. Uses 0W-20 Mobil synthetic.',
    createdDate: '2026-08-01'
  },
  {
    id: 'veh-5',
    registrationNumber: 'Abu Dhabi 5 73921',
    make: 'Lexus',
    model: 'LX570 V8',
    year: 2021,
    color: 'Sonic Titanium',
    engineNumber: '3UR-FE-610293',
    chassisNumber: 'JTJ-6102938910',
    mileage: 45600,
    customerId: 'cust-5',
    notes: 'Brake pads worn to 25%. Advised replacement at next periodic visit.',
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
    supplier: 'ENOC Lubricants Distribution LLC (Dubai)',
    purchasePrice: 95.00,
    sellingPrice: 165.00,
    currentQuantity: 42,
    minStockLevel: 12,
    unit: 'Cans',
    location: 'Rack A-01',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-2',
    name: 'Total Quartz 9000 5W-30 Synthetic (4L)',
    sku: 'OIL-TOT-5W30-4L',
    category: 'Engine Oil',
    brand: 'TotalEnergies',
    supplier: 'Total Lubricants Middle East (Dubai)',
    purchasePrice: 85.00,
    sellingPrice: 145.00,
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
    supplier: 'Al-Futtaim Auto Centers (Dubai)',
    purchasePrice: 115.00,
    sellingPrice: 185.00,
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
    supplier: 'Al-Futtaim Motors Spare Parts (Dubai)',
    purchasePrice: 22.00,
    sellingPrice: 45.00,
    currentQuantity: 65,
    minStockLevel: 15,
    unit: 'Pieces',
    location: 'Rack B-01',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-5',
    name: 'Genuine Honda Oil Filter (15400-RTA-003)',
    sku: 'FLT-HND-RTA003',
    category: 'Oil Filters',
    brand: 'Honda Genuine',
    supplier: 'Trading Enterprises Honda (Dubai)',
    purchasePrice: 25.00,
    sellingPrice: 50.00,
    currentQuantity: 38,
    minStockLevel: 10,
    unit: 'Pieces',
    location: 'Rack B-02',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-6',
    name: 'Genuine Nissan Oil Filter (15208-65F0A)',
    sku: 'FLT-NSN-65F0A',
    category: 'Oil Filters',
    brand: 'Nissan Genuine',
    supplier: 'Arabian Automobiles Parts Division (Deira, Dubai)',
    purchasePrice: 24.00,
    sellingPrice: 48.00,
    currentQuantity: 40,
    minStockLevel: 10,
    unit: 'Pieces',
    location: 'Rack B-03',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-7',
    name: 'Denso Iridium Spark Plugs IK20 (Set of 4)',
    sku: 'SPK-DNS-IK20',
    category: 'Ignition & Electrical',
    brand: 'Denso',
    supplier: 'Galadari Auto Spares LLC (Al Quoz, Dubai)',
    purchasePrice: 95.00,
    sellingPrice: 190.00,
    currentQuantity: 25,
    minStockLevel: 8,
    unit: 'Sets',
    location: 'Rack C-01',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-8',
    name: 'Akebono Ceramic Front Brake Pads (Camry / Corolla)',
    sku: 'BRK-AKB-ACT923',
    category: 'Braking System',
    brand: 'Akebono',
    supplier: 'Nippon Auto Parts UAE (Sharjah / Dubai)',
    purchasePrice: 130.00,
    sellingPrice: 260.00,
    currentQuantity: 16,
    minStockLevel: 6,
    unit: 'Sets',
    location: 'Rack D-01',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-9',
    name: 'Heavy Duty SUV Brake Pads (Land Cruiser / Patrol)',
    sku: 'BRK-SUV-LC200',
    category: 'Braking System',
    brand: 'Brembo / Advics',
    supplier: 'Al-Futtaim Motors Spare Parts (Dubai)',
    purchasePrice: 190.00,
    sellingPrice: 380.00,
    currentQuantity: 14,
    minStockLevel: 5,
    unit: 'Sets',
    location: 'Rack D-02',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-10',
    name: 'R134a Premium Auto AC Refrigerant (Can)',
    sku: 'AC-GAS-R134A',
    category: 'AC & Climate',
    brand: 'Honeywell Genetron',
    supplier: 'Dubai Climate Parts Supplies LLC',
    purchasePrice: 35.00,
    sellingPrice: 85.00,
    currentQuantity: 30,
    minStockLevel: 10,
    unit: 'Cans',
    location: 'Rack E-01',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-11',
    name: 'Toyota Super Long Life Coolant 50/50 Pre-mixed (4L)',
    sku: 'CLN-TOY-SLLC-4L',
    category: 'Cooling System',
    brand: 'Toyota Genuine',
    supplier: 'Al-Futtaim Motors Spare Parts (Dubai)',
    purchasePrice: 45.00,
    sellingPrice: 95.00,
    currentQuantity: 22,
    minStockLevel: 8,
    unit: 'Bottles',
    location: 'Rack E-02',
    createdDate: '2026-05-10'
  },
  {
    id: 'prod-12',
    name: 'Heavy Duty 12V 70Ah Sealed Auto Battery',
    sku: 'BAT-VRT-70AH',
    category: 'Ignition & Electrical',
    brand: 'Varta / Bosch',
    supplier: 'Emirates Auto Battery Distribution (Dubai)',
    purchasePrice: 240.00,
    sellingPrice: 390.00,
    currentQuantity: 12,
    minStockLevel: 4,
    unit: 'Pieces',
    location: 'Battery Bay',
    createdDate: '2026-05-10'
  }
];

export const INITIAL_LABOUR_WORKERS: LabourWorker[] = [
  {
    id: 'lab-1',
    workerCode: 'WRK-DXB-01',
    name: 'Rashid Mehmood',
    phone: '+971 50 671 2938',
    role: 'Master Diagnostic Mechanic & Shop Foreman',
    rateType: 'commission',
    commissionPercentage: 40,
    dailyRate: 250.00,
    hourlyRate: 35.00,
    monthlySalary: 6500.00,
    status: 'active',
    joiningDate: '2024-03-01',
    notes: 'Specialist in V8 engines, transmission overhauls, and suspension tuning.'
  },
  {
    id: 'lab-2',
    workerCode: 'WRK-DXB-02',
    name: 'Tariq Mehmood',
    phone: '+971 55 819 0234',
    role: 'Auto Electrician & ECU Programming Specialist',
    rateType: 'commission',
    commissionPercentage: 40,
    dailyRate: 220.00,
    hourlyRate: 32.00,
    monthlySalary: 5500.00,
    status: 'active',
    joiningDate: '2024-06-15',
    notes: 'OBD-II live diagnostics, ECU flashing, hybrid inverter repair.'
  },
  {
    id: 'lab-3',
    workerCode: 'WRK-DXB-03',
    name: 'Sajid Hussain',
    phone: '+971 52 441 9820',
    role: 'Automotive AC & Climate Control Technician',
    rateType: 'commission',
    commissionPercentage: 35,
    dailyRate: 200.00,
    hourlyRate: 30.00,
    monthlySalary: 5000.00,
    status: 'active',
    joiningDate: '2025-01-10',
    notes: 'AC compressor reconditioning, condenser leak repair, dual-evaporator systems.'
  },
  {
    id: 'lab-4',
    workerCode: 'WRK-DXB-04',
    name: 'Imran Bashir',
    phone: '+971 56 772 1094',
    role: 'Suspension, Brakes & Alignment Specialist',
    rateType: 'daily',
    commissionPercentage: 35,
    dailyRate: 190.00,
    hourlyRate: 28.00,
    monthlySalary: 4800.00,
    status: 'active',
    joiningDate: '2025-04-01',
    notes: 'Computerized 4-wheel alignment, disc skimming, bush extraction.'
  }
];

export const INITIAL_JOB_CARDS: JobCard[] = [
  {
    id: 'jc-1',
    jobNumber: 'JC-DXB-082',
    customerId: 'cust-1',
    vehicleId: 'veh-1',
    date: '2026-09-24',
    mileage: 64200,
    complaint: 'Engine oil service due. Slight squeak from front brakes during low-speed braking.',
    inspectionNotes: 'Oil dark, filter clogged. Front pads worn to 3mm. Calipers cleaned and lubricated.',
    assignedLabour: [
      {
        id: 'la-1',
        labourId: 'lab-1',
        labourName: 'Rashid Mehmood',
        rateType: 'commission',
        commissionPercentage: 40,
        rate: 40,
        units: 1,
        costToShop: 60.00,
        customerCharge: 150.00,
        notes: 'Brake inspection & caliper overhaul'
      },
      {
        id: 'la-2',
        labourId: 'lab-4',
        labourName: 'Imran Bashir',
        rateType: 'fixed',
        rate: 50.00,
        units: 1,
        costToShop: 35.00,
        customerCharge: 70.00,
        notes: 'Oil & filter replacement'
      }
    ],
    partsUsed: [
      {
        id: 'pi-1',
        productId: 'prod-1',
        productName: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
        sku: 'OIL-SHL-5W40-4L',
        quantity: 1,
        unitCost: 95.00,
        unitPrice: 165.00,
        totalCost: 95.00,
        totalPrice: 165.00,
        profit: 70.00
      },
      {
        id: 'pi-2',
        productId: 'prod-4',
        productName: 'Genuine Toyota Oil Filter (90915-YZZE1)',
        sku: 'FLT-TOY-YZZE1',
        quantity: 1,
        unitCost: 22.00,
        unitPrice: 45.00,
        totalCost: 22.00,
        totalPrice: 45.00,
        profit: 23.00
      },
      {
        id: 'pi-3',
        productId: 'prod-8',
        productName: 'Akebono Ceramic Front Brake Pads (Camry / Corolla)',
        sku: 'BRK-AKB-ACT923',
        quantity: 1,
        unitCost: 130.00,
        unitPrice: 260.00,
        totalCost: 130.00,
        totalPrice: 260.00,
        profit: 130.00
      }
    ],
    additionalServices: [
      {
        id: 'srv-1',
        name: 'Complete Vehicle 28-Point Computer Inspection',
        charge: 50.00,
        cost: 0
      }
    ],
    estimatedCost: 740.00,
    finalCost: 740.00,
    status: 'completed',
    invoiceId: 'inv-1',
    notes: 'Customer notified. Vehicle ready for delivery.',
    createdDate: '2026-09-24',
    updatedDate: '2026-09-24'
  },
  {
    id: 'jc-2',
    jobNumber: 'JC-DXB-083',
    customerId: 'cust-2',
    vehicleId: 'veh-2',
    date: '2026-09-24',
    mileage: 78500,
    complaint: 'Check engine light on dashboard, slight misfire on idle after cold start.',
    inspectionNotes: 'Scanned OBD code P0302 (Cylinder 2 Misfire). Spark plugs overdue for replacement. Ignition coils tested OK.',
    assignedLabour: [
      {
        id: 'la-3',
        labourId: 'lab-2',
        labourName: 'Tariq Mehmood',
        rateType: 'commission',
        commissionPercentage: 40,
        rate: 40,
        units: 1,
        costToShop: 60.00,
        customerCharge: 150.00,
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
        unitCost: 95.00,
        unitPrice: 190.00,
        totalCost: 95.00,
        totalPrice: 190.00,
        profit: 95.00
      }
    ],
    additionalServices: [
      {
        id: 'srv-2',
        name: 'OBD-II Full System Computer Diagnostics Scan',
        charge: 100.00,
        cost: 0
      }
    ],
    estimatedCost: 440.00,
    finalCost: 440.00,
    status: 'in_progress',
    notes: 'Parts fitted. Running engine idle test.',
    createdDate: '2026-09-24',
    updatedDate: '2026-09-25'
  },
  {
    id: 'jc-3',
    jobNumber: 'JC-DXB-084',
    customerId: 'cust-5',
    vehicleId: 'veh-5',
    date: '2026-09-25',
    mileage: 45600,
    complaint: 'AC blowing lukewarm air in afternoon Dubai heat. Coolant level low in reservoir.',
    inspectionNotes: 'AC pressure gauge shows slight refrigerant loss. Radiator cap seal cracked. Running UV leak test.',
    assignedLabour: [
      {
        id: 'la-4',
        labourId: 'lab-3',
        labourName: 'Sajid Hussain',
        rateType: 'commission',
        commissionPercentage: 35,
        rate: 35,
        units: 1,
        costToShop: 52.50,
        customerCharge: 150.00,
        notes: 'AC system pressure test & gas recharge'
      }
    ],
    partsUsed: [
      {
        id: 'pi-5',
        productId: 'prod-10',
        productName: 'R134a Premium Auto AC Refrigerant (Can)',
        sku: 'AC-GAS-R134A',
        quantity: 1,
        unitCost: 35.00,
        unitPrice: 85.00,
        totalCost: 35.00,
        totalPrice: 85.00,
        profit: 50.00
      }
    ],
    additionalServices: [],
    estimatedCost: 235.00,
    finalCost: 235.00,
    status: 'inspection',
    notes: 'Diagnosing leak before recharging refrigerant.',
    createdDate: '2026-09-25',
    updatedDate: '2026-09-25'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-DXB-001',
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
        unitPrice: 165.00,
        totalPrice: 165.00,
        unitCost: 95.00,
        totalCost: 95.00
      },
      {
        id: 'ii-2',
        type: 'part',
        productId: 'prod-4',
        name: 'Genuine Toyota Oil Filter (90915-YZZE1)',
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00,
        unitCost: 22.00,
        totalCost: 22.00
      },
      {
        id: 'ii-3',
        type: 'part',
        productId: 'prod-8',
        name: 'Akebono Ceramic Front Brake Pads (Camry / Corolla)',
        quantity: 1,
        unitPrice: 260.00,
        totalPrice: 260.00,
        unitCost: 130.00,
        totalCost: 130.00
      },
      {
        id: 'ii-4',
        type: 'labour',
        name: 'Labour: Brake servicing & caliper cleaning (Rashid Mehmood)',
        quantity: 1,
        unitPrice: 150.00,
        totalPrice: 150.00,
        unitCost: 60.00,
        totalCost: 60.00
      },
      {
        id: 'ii-5',
        type: 'labour',
        name: 'Labour: Oil & filter change (Imran Bashir)',
        quantity: 1,
        unitPrice: 70.00,
        totalPrice: 70.00,
        unitCost: 35.00,
        totalCost: 35.00
      },
      {
        id: 'ii-6',
        type: 'service',
        name: 'Complete Vehicle 28-Point Computer Inspection',
        quantity: 1,
        unitPrice: 50.00,
        totalPrice: 50.00,
        unitCost: 0,
        totalCost: 0
      }
    ],
    partsTotal: 470.00,
    labourTotal: 220.00,
    servicesTotal: 50.00,
    subtotal: 740.00,
    partsCost: 247.00,
    labourCost: 95.00,
    servicesCost: 0,
    discount: 40.00, // Courtesy discount
    discountType: 'fixed',
    taxRate: 5, // 5% UAE VAT
    taxAmount: 35.00, // 5% on 700.00
    grandTotal: 735.00,
    paidAmount: 735.00,
    balanceDue: 0.00,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    notes: 'Paid in full via Visa Card. 5% UAE VAT Tax Invoice issued. 30-day warranty under UAE Consumer Protection Law.',
    createdDate: '2026-09-24'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-DXB-002',
    date: '2026-08-20',
    dueDate: '2026-08-20',
    customerId: 'cust-2',
    vehicleId: 'veh-2',
    items: [
      {
        id: 'ii-21',
        type: 'part',
        productId: 'prod-2',
        name: 'Total Quartz 9000 5W-30 Synthetic (4L)',
        quantity: 1,
        unitPrice: 145.00,
        totalPrice: 145.00,
        unitCost: 85.00,
        totalCost: 85.00
      },
      {
        id: 'ii-22',
        type: 'part',
        productId: 'prod-7',
        name: 'Denso Iridium Spark Plugs IK20 (Set of 4)',
        quantity: 1,
        unitPrice: 190.00,
        totalPrice: 190.00,
        unitCost: 95.00,
        totalCost: 95.00
      },
      {
        id: 'ii-23',
        type: 'labour',
        name: 'Labour: Spark plugs replacement & throttle body cleaning',
        quantity: 1,
        unitPrice: 150.00,
        totalPrice: 150.00,
        unitCost: 60.00,
        totalCost: 60.00
      },
      {
        id: 'ii-24',
        type: 'service',
        name: 'OBD-II Computer Diagnostics Scan',
        quantity: 1,
        unitPrice: 100.00,
        totalPrice: 100.00,
        unitCost: 0,
        totalCost: 0
      }
    ],
    partsTotal: 335.00,
    labourTotal: 150.00,
    servicesTotal: 100.00,
    subtotal: 585.00,
    partsCost: 180.00,
    labourCost: 60.00,
    servicesCost: 0,
    discount: 35.00,
    discountType: 'fixed',
    taxRate: 5,
    taxAmount: 27.50,
    grandTotal: 577.50,
    paidAmount: 577.50,
    balanceDue: 0.00,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    notes: 'Settled via Emirates NBD Business Online Transfer.',
    createdDate: '2026-08-20'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-DXB-003',
    date: '2026-07-16',
    dueDate: '2026-07-16',
    customerId: 'cust-3',
    vehicleId: 'veh-3',
    items: [
      {
        id: 'ii-31',
        type: 'part',
        productId: 'prod-1',
        name: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
        quantity: 1,
        unitPrice: 165.00,
        totalPrice: 165.00,
        unitCost: 95.00,
        totalCost: 95.00
      },
      {
        id: 'ii-32',
        type: 'part',
        productId: 'prod-4',
        name: 'Genuine Toyota Oil Filter (90915-YZZE1)',
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00,
        unitCost: 22.00,
        totalCost: 22.00
      },
      {
        id: 'ii-33',
        type: 'labour',
        name: 'Labour: Front suspension bush replacement & brake caliper overhaul',
        quantity: 1,
        unitPrice: 250.00,
        totalPrice: 250.00,
        unitCost: 100.00,
        totalCost: 100.00
      },
      {
        id: 'ii-34',
        type: 'service',
        name: 'High-speed computerized 4-wheel balancing',
        quantity: 1,
        unitPrice: 120.00,
        totalPrice: 120.00,
        unitCost: 0,
        totalCost: 0
      }
    ],
    partsTotal: 210.00,
    labourTotal: 250.00,
    servicesTotal: 120.00,
    subtotal: 580.00,
    partsCost: 117.00,
    labourCost: 100.00,
    servicesCost: 0,
    discount: 30.00,
    discountType: 'fixed',
    taxRate: 5,
    taxAmount: 27.50,
    grandTotal: 577.50,
    paidAmount: 577.50,
    balanceDue: 0.00,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    notes: 'Periodic service cleared. Issued Dubai workshop tax invoice.',
    createdDate: '2026-07-16'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-DXB-001',
    customerId: 'cust-1',
    amount: 735.00,
    paymentMethod: 'Card',
    date: '2026-09-24',
    reference: 'POS-ENBD-082',
    notes: 'Received at front desk cashier counter via Visa Terminal.',
    receivedBy: 'Kamran Siddiqui'
  }
];

export const INITIAL_LABOUR_PAYMENTS: LabourPayment[] = [
  {
    id: 'lp-1',
    labourId: 'lab-1',
    labourName: 'Rashid Mehmood',
    amount: 1500.00,
    date: '2026-09-20',
    paymentPeriod: 'Week 37, Sept 2026',
    paymentMethod: 'Bank Transfer',
    reference: 'WPS-W37-01',
    notes: 'Weekly commission & wage disbursement under UAE WPS.',
    paidBy: 'Kamran Siddiqui'
  },
  {
    id: 'lp-2',
    labourId: 'lab-2',
    labourName: 'Tariq Mehmood',
    amount: 1300.00,
    date: '2026-09-20',
    paymentPeriod: 'Week 37, Sept 2026',
    paymentMethod: 'Bank Transfer',
    reference: 'WPS-W37-02',
    notes: 'Weekly commission & wage disbursement under UAE WPS.',
    paidBy: 'Kamran Siddiqui'
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
    cost: 95.00,
    sellingPrice: 165.00,
    nextRecommendedDate: '2026-12-24',
    nextRecommendedMileage: 74200,
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
    cost: 85.00,
    sellingPrice: 145.00,
    nextRecommendedDate: '2026-09-18', // OVERDUE!
    nextRecommendedMileage: 38200,
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
    cost: 85.00,
    sellingPrice: 145.00,
    nextRecommendedDate: '2026-11-05',
    nextRecommendedMileage: 84100,
    notes: 'Next service approaching in ~1,000 km.'
  }
];

export const INITIAL_RENTS: WorkshopRent[] = [
  {
    id: 'rent-2026-09',
    month: '2026-09',
    monthLabel: 'September 2026',
    amount: 12500.00,
    paidAmount: 12500.00,
    paymentDate: '2026-09-05',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'Workshop Warehouse #14, Al Quoz 3. Paid via Emirates NBD transfer to Landlord Al Habtoor Real Estate LLC',
    createdDate: '2026-09-01'
  },
  {
    id: 'rent-2026-08',
    month: '2026-08',
    monthLabel: 'August 2026',
    amount: 12500.00,
    paidAmount: 12500.00,
    paymentDate: '2026-08-04',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'August workshop premises lease cleared via bank transfer',
    createdDate: '2026-08-01'
  },
  {
    id: 'rent-2026-07',
    month: '2026-07',
    monthLabel: 'July 2026',
    amount: 12500.00,
    paidAmount: 12500.00,
    paymentDate: '2026-07-05',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'July workshop premises lease cleared via bank transfer',
    createdDate: '2026-07-01'
  }
];

export const INITIAL_LICENSES: LicenseRecord[] = [
  {
    id: 'lic-1',
    name: 'Dubai DET / DED Commercial Auto Repair Trade License',
    licenseNumber: 'CN-1094821',
    issuingAuthority: 'Department of Economy and Tourism (DET), Dubai',
    issueDate: '2025-10-15',
    expiryDate: '2026-10-14',
    renewalCost: 14500.00,
    paymentDate: '2025-10-15',
    paymentMethod: 'Bank Transfer',
    status: 'Expiring Soon',
    notes: 'Commercial trade license for mechanical and auto electrical repair. Annual renewal due.',
    createdDate: '2025-10-15'
  },
  {
    id: 'lic-2',
    name: 'Dubai Municipality (DM) Auto Workshop Waste Oil & Environmental Clearance',
    licenseNumber: 'DM-ENV-2026-8842',
    issuingAuthority: 'Dubai Municipality Environment & Waste Management Department',
    issueDate: '2026-01-10',
    expiryDate: '2027-01-09',
    renewalCost: 3200.00,
    paymentDate: '2026-01-10',
    paymentMethod: 'Bank Transfer',
    status: 'Active',
    notes: 'Certified for environmentally safe waste oil recovery and battery recycling disposal.',
    createdDate: '2026-01-10'
  },
  {
    id: 'lic-3',
    name: 'Dubai Civil Defence (DCD) Workshop Fire & Life Safety Certificate',
    licenseNumber: 'DCD-FS-2026-088',
    issuingAuthority: 'Dubai Civil Defence (DCD)',
    issueDate: '2026-09-10',
    expiryDate: '2027-09-09',
    renewalCost: 2800.00,
    paymentDate: '2026-09-10',
    paymentMethod: 'Card',
    status: 'Active',
    notes: 'Fire suppression system, extinguisher inspection, and emergency evacuation clearance approved.',
    createdDate: '2026-09-10'
  },
  {
    id: 'lic-4',
    name: 'RTA Technical Vehicle Inspection & Repair Permit',
    licenseNumber: 'RTA-VTS-2026-401',
    issuingAuthority: 'Roads and Transport Authority (RTA), Dubai',
    issueDate: '2026-03-01',
    expiryDate: '2027-02-28',
    renewalCost: 4500.00,
    paymentDate: '2026-03-01',
    paymentMethod: 'Bank Transfer',
    status: 'Active',
    notes: 'Authorized workshop technical compliance under RTA automotive service regulations.',
    createdDate: '2026-03-01'
  }
];

export const INITIAL_ELECTRICITY_BILLS: ElectricityBill[] = [
  {
    id: 'elec-2026-09',
    billingMonth: '2026-09',
    monthLabel: 'September 2026',
    billNumber: 'DEWA-2109482-09',
    previousReading: 14200,
    currentReading: 14980,
    unitsConsumed: 780,
    billAmount: 2850.00,
    paidAmount: 2850.00,
    issueDate: '2026-09-08',
    dueDate: '2026-09-22',
    paymentDate: '2026-09-15',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'DEWA commercial 3-phase electricity & water service settled via direct bank debit.',
    createdDate: '2026-09-08'
  },
  {
    id: 'elec-2026-08',
    billingMonth: '2026-08',
    monthLabel: 'August 2026',
    billNumber: 'DEWA-2109482-08',
    previousReading: 13350,
    currentReading: 14200,
    unitsConsumed: 850,
    billAmount: 3120.00,
    paidAmount: 3120.00,
    issueDate: '2026-08-08',
    dueDate: '2026-08-22',
    paymentDate: '2026-08-16',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'August DEWA utility bill cleared.',
    createdDate: '2026-08-08'
  },
  {
    id: 'elec-2026-07',
    billingMonth: '2026-07',
    monthLabel: 'July 2026',
    billNumber: 'DEWA-2109482-07',
    previousReading: 12600,
    currentReading: 13350,
    unitsConsumed: 750,
    billAmount: 2950.00,
    paidAmount: 2950.00,
    issueDate: '2026-07-08',
    dueDate: '2026-07-22',
    paymentDate: '2026-07-15',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    notes: 'July DEWA utility bill paid in full.',
    createdDate: '2026-07-08'
  }
];

export const INITIAL_EXPENSES: ShopExpense[] = [
  {
    id: 'exp-d1',
    title: 'Staff Morning Refreshments & Coffee',
    category: 'Breakfast',
    type: 'daily',
    amount: 65.00,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Morning refreshments for shop technicians and mechanics',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d2',
    title: 'Morning Workshop Karak Tea (Round 1)',
    category: 'Tea',
    type: 'daily',
    amount: 25.00,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Morning tea and snacks for garage staff',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d3',
    title: 'Evening Workshop Tea & Refreshments',
    category: 'Tea',
    type: 'daily',
    amount: 25.00,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Afternoon tea for mechanics',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d4',
    title: 'Emergency Parts Pickup — Conveyance & Fuel',
    category: 'Conveyance',
    type: 'daily',
    amount: 80.00,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Rashid Mehmood',
    status: 'Paid',
    notes: 'Fuel conveyance to collect specialized brake discs from Al Quoz dealer',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d5',
    title: 'Workshop Floor Degreasing & Industrial Cleaning',
    category: 'Cleaning',
    type: 'workshop',
    amount: 60.00,
    date: '2026-09-29',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Daily bay degreasing and pit cleaning in compliance with DM environmental guidelines',
    createdDate: '2026-09-29'
  },
  {
    id: 'exp-d6',
    title: 'Staff Overtime Working Lunch',
    category: 'Lunch',
    type: 'daily',
    amount: 95.00,
    date: '2026-09-28',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Lunch for 4 technicians working overtime on engine overhaul',
    createdDate: '2026-09-28'
  },
  {
    id: 'exp-d8',
    title: 'Shop Consumables, Degreaser & Industrial Wipes',
    category: 'Shop Supplies',
    type: 'workshop',
    amount: 350.00,
    date: '2026-09-18',
    paymentMethod: 'Card',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Brake cleaners, WD-40 cans, nitrile gloves, shop towels',
    createdDate: '2026-09-18'
  },
  {
    id: 'exp-d9',
    title: 'Etisalat by e& Business Fiber Internet Monthly',
    category: 'Internet',
    type: 'fixed',
    amount: 599.00,
    date: '2026-09-12',
    paymentMethod: 'Bank Transfer',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'High-speed diagnostic cloud and terminal internet connection',
    createdDate: '2026-09-12'
  },
  {
    id: 'exp-d10',
    title: 'Drinking Water Supply (5 Gallon Bottles x 12)',
    category: 'Water',
    type: 'fixed',
    amount: 85.00,
    date: '2026-09-14',
    paymentMethod: 'Cash',
    paidBy: 'Umair Ullah',
    status: 'Paid',
    notes: 'Customer lounge and technician drinking water dispenser',
    createdDate: '2026-09-14'
  }
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-1',
    productId: 'prod-1',
    productName: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
    type: 'purchase',
    quantity: 50,
    unitCost: 95.00,
    reference: 'PO-DXB-041',
    date: '2026-09-10 11:30',
    user: 'Kamran Siddiqui',
    notes: 'Supplier bulk shipment from ENOC Lubricants'
  },
  {
    id: 'tx-2',
    productId: 'prod-1',
    productName: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
    type: 'job_usage',
    quantity: -1,
    unitCost: 95.00,
    reference: 'JC-DXB-082',
    date: '2026-09-24 14:15',
    user: 'Hamza Farooq',
    notes: 'Installed in Toyota Land Cruiser Dubai A 48210'
  },
  {
    id: 'tx-3',
    productId: 'prod-8',
    productName: 'Akebono Ceramic Front Brake Pads (Camry / Corolla)',
    type: 'job_usage',
    quantity: -1,
    unitCost: 130.00,
    reference: 'JC-DXB-082',
    date: '2026-09-24 14:20',
    user: 'Hamza Farooq',
    notes: 'Installed in Toyota Land Cruiser Dubai A 48210'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-24T14:30:00.000Z',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    action: 'Payment Received',
    module: 'Payment',
    recordId: 'inv-1',
    description: 'Received AED 735.00 card payment for Invoice INV-DXB-001 (Tariq Al Mansoori)'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-24T14:15:00.000Z',
    userId: 'usr-3',
    userName: 'Hamza Farooq',
    userRole: 'employee',
    action: 'Inventory Deducted',
    module: 'Inventory',
    recordId: 'jc-1',
    description: 'Deducted 1x Shell Helix Ultra, 1x Oil Filter, 1x Ceramic Brake Pads for Job JC-DXB-082'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-24T10:00:00.000Z',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    action: 'Job Created',
    module: 'Job',
    recordId: 'jc-1',
    description: 'Created repair job card JC-DXB-082 for Toyota Land Cruiser (Dubai A 48210)'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-24T14:35:00.000Z',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    action: 'Invoice Printed',
    module: 'Invoice',
    recordId: 'inv-1',
    description: 'Printed UAE VAT tax invoice INV-DXB-001 (Print Count: 1)'
  },
  {
    id: 'log-5',
    timestamp: '2026-09-25T11:00:00.000Z',
    userId: 'usr-owner-1',
    userName: 'Umair Ullah',
    userRole: 'owner',
    action: 'Labour Salary Paid',
    module: 'Labour',
    recordId: 'lab-pay-1',
    description: 'Disbursed AED 1,500.00 to Rashid Mehmood via Bank Transfer under UAE WPS'
  }
];

export const INITIAL_USER_SESSIONS: UserSessionRecord[] = [
  {
    id: 'sess-1',
    userId: 'usr-owner-1',
    userName: 'Umair Ullah',
    userRole: 'owner',
    loginTimestamp: '2026-09-30T08:00:00.000Z',
    logoutTimestamp: undefined,
    status: 'Active',
    deviceInfo: 'Desktop POS Terminal (Windows 11 / Chrome)'
  },
  {
    id: 'sess-2',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    loginTimestamp: '2026-09-29T08:30:00.000Z',
    logoutTimestamp: '2026-09-29T18:00:00.000Z',
    status: 'Logged Out',
    deviceInfo: 'Counter Laptop (Edge / Windows 10)'
  },
  {
    id: 'sess-3',
    userId: 'usr-3',
    userName: 'Hamza Farooq',
    userRole: 'employee',
    loginTimestamp: '2026-09-29T09:00:00.000Z',
    logoutTimestamp: '2026-09-29T17:30:00.000Z',
    status: 'Logged Out',
    deviceInfo: 'Floor Tablet (Android Chrome)'
  }
];

export const INITIAL_RECORD_CHANGES: RecordChangeEntry[] = [
  {
    id: 'rc-1',
    recordType: 'Invoice',
    recordId: 'inv-1',
    recordReference: 'INV-DXB-001',
    timestamp: '2026-09-24T10:15:00.000Z',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    action: 'Created',
    description: 'Created tax invoice for Job JC-DXB-082. Total: AED 735.00 (Incl. 5% UAE VAT)'
  },
  {
    id: 'rc-2',
    recordType: 'Invoice',
    recordId: 'inv-1',
    recordReference: 'INV-DXB-001',
    timestamp: '2026-09-24T14:30:00.000Z',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    action: 'Payment Recorded',
    fieldChanged: 'Payment Status',
    oldValue: 'Unpaid',
    newValue: 'Paid',
    description: 'Customer paid AED 735.00 in full via Visa Card.'
  },
  {
    id: 'rc-3',
    recordType: 'Invoice',
    recordId: 'inv-1',
    recordReference: 'INV-DXB-001',
    timestamp: '2026-09-24T14:35:00.000Z',
    userId: 'usr-2',
    userName: 'Kamran Siddiqui',
    userRole: 'manager',
    action: 'Printed',
    description: 'Tax Invoice printed by Kamran Siddiqui.'
  },
  {
    id: 'rc-4',
    recordType: 'Customer',
    recordId: 'cust-1',
    recordReference: 'Tariq Al Mansoori',
    timestamp: '2026-09-01T09:30:00.000Z',
    userId: 'usr-owner-1',
    userName: 'Umair Ullah',
    userRole: 'owner',
    action: 'Created',
    description: 'Customer account registered with Toyota Land Cruiser Dubai A 48210.'
  }
];

export const INITIAL_PRINT_HISTORY: InvoicePrintEvent[] = [
  {
    id: 'prt-1',
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-DXB-001',
    printedBy: 'usr-2',
    printedByName: 'Kamran Siddiqui',
    printTimestamp: '2026-09-24T14:35:00.000Z',
    printCount: 1
  }
];

export const INITIAL_PAYMENT_PROOFS: PaymentProof[] = [
  {
    id: 'proof-1',
    fileName: 'emirates_nbd_transfer_inv001.jpg',
    fileType: 'image/jpeg',
    fileSize: 184520,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23FAFAF9" stroke="%23DCDDD9" stroke-width="2"/><text x="50%25" y="35%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="%231B4D3E">EMIRATES NBD BANK TRANSFER</text><text x="50%25" y="52%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%23202321">TXN: ENBD-994821039 | AED 735.00</text><text x="50%25" y="68%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%236B706D">Account: Umair Auto Care LLC (Dubai, UAE)</text></svg>',
    uploadedBy: 'usr-2',
    uploadedByName: 'Kamran Siddiqui',
    uploadedAt: '2026-09-24T14:31:00.000Z',
    notes: 'Emirates NBD direct bank payment verified'
  }
];
