import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  AuthSession,
  SetupFormData,
  Customer,
  Vehicle,
  Product,
  InventoryTransaction,
  Purchase,
  LabourWorker,
  LabourPayment,
  JobCard,
  JobStatus,
  Invoice,
  PaymentRecord,
  OilChangeRecord,
  ShopExpense,
  WorkshopRent,
  LicenseRecord,
  ElectricityBill,
  AuditLog,
  ShopSettings,
  PaymentMethod
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  HARDCODED_OWNER,
  INITIAL_CUSTOMERS,
  INITIAL_VEHICLES,
  INITIAL_PRODUCTS,
  INITIAL_LABOUR_WORKERS,
  INITIAL_JOB_CARDS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_LABOUR_PAYMENTS,
  INITIAL_OIL_CHANGES,
  INITIAL_EXPENSES,
  INITIAL_RENTS,
  INITIAL_LICENSES,
  INITIAL_ELECTRICITY_BILLS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import {
  UnifiedExpenseItem,
  getUnifiedExpensesList
} from '../utils/expenseCalculations';
import { calculateWeightedAverageCost } from '../utils/calculations';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  validatePasswordStrength,
  checkLoginRateLimit,
  recordFailedLogin,
  clearFailedLogins
} from '../utils/security';

export type AppView =
  | 'login'
  | 'setup'
  | 'registration_disabled'
  | 'dashboard'
  | 'pos'
  | 'jobs'
  | 'customers'
  | 'vehicles'
  | 'inventory'
  | 'purchases'
  | 'stock_audit'
  | 'labour'
  | 'labour_payroll'
  | 'invoices'
  | 'expenses'
  | 'oil_changes'
  | 'reports'
  | 'users'
  | 'settings'
  | 'backup'
  | 'audit_logs';

interface ShopContextType {
  // Navigation & View State
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Selected Entity Quick Views
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;

  // Authentication & Session
  currentUser: User | null;
  currentSession: AuthSession | null;
  allUsers: User[];
  setupCompleted: boolean;
  authFlashMessage: string | null;
  setAuthFlashMessage: (msg: string | null) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeFirstTimeSetup: (data: SetupFormData) => Promise<{ success: boolean; error?: string }>;
  
  // Owner User Management
  createUserByOwner: (data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    role: UserRole;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateUserByOwner: (id: string, data: Partial<User>) => { success: boolean; error?: string };
  toggleUserStatus: (id: string) => { success: boolean; error?: string };
  resetUserPasswordByOwner: (id: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteUserByOwner: (id: string) => { success: boolean; error?: string };
  changeMyPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Role & Permission Checks
  isOwner: boolean;
  isManager: boolean;
  isEmployee: boolean;
  canAccess: (view: AppView) => boolean;
  switchUser: (userId: string) => void;
  updateUserRole: (role: UserRole) => void;

  // Customers
  customers: Customer[];
  addCustomer: (data: Omit<Customer, 'id' | 'createdDate'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (data: Omit<Vehicle, 'id' | 'createdDate'>) => Vehicle;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Inventory & Products
  products: Product[];
  addProduct: (data: Omit<Product, 'id' | 'createdDate'>) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  purchases: Purchase[];
  recordPurchase: (purchase: Omit<Purchase, 'id' | 'createdDate' | 'createdBy'>) => void;
  adjustStock: (productId: string, quantityDelta: number, reason: string, type?: InventoryTransaction['type']) => void;

  // Transactions Audit
  transactions: InventoryTransaction[];

  // Labour
  labourWorkers: LabourWorker[];
  addLabourWorker: (data: Omit<LabourWorker, 'id'>) => LabourWorker;
  updateLabourWorker: (id: string, data: Partial<LabourWorker>) => void;
  deleteLabourWorker: (id: string) => void;
  labourPayments: LabourPayment[];
  recordLabourPayment: (payment: Omit<LabourPayment, 'id' | 'paidBy'>) => void;

  // Job Cards
  jobCards: JobCard[];
  createJobCard: (data: Omit<JobCard, 'id' | 'createdDate' | 'updatedDate'>) => JobCard;
  updateJobCard: (id: string, data: Partial<JobCard>) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  deleteJobCard: (id: string) => void;

  // Invoices & POS
  invoices: Invoice[];
  payments: PaymentRecord[];
  createInvoice: (data: Omit<Invoice, 'id' | 'createdDate'>) => Invoice;
  recordInvoicePayment: (invoiceId: string, amount: number, paymentMethod: PaymentMethod, reference?: string, notes?: string) => void;
  deleteInvoice: (id: string) => void;
  processProductReturn: (invoiceId: string, productId: string, returnQty: number, reason: string) => void;

  // Oil Changes
  oilChanges: OilChangeRecord[];
  logOilChange: (data: Omit<OilChangeRecord, 'id'>) => OilChangeRecord;

  // Expenses & Fixed Costs
  expenses: ShopExpense[];
  rents: WorkshopRent[];
  electricityBills: ElectricityBill[];
  licenses: LicenseRecord[];
  unifiedExpenses: UnifiedExpenseItem[];
  addExpense: (data: Omit<ShopExpense, 'id' | 'paidBy' | 'createdDate'>) => ShopExpense;
  updateExpense: (id: string, data: Partial<ShopExpense>) => void;
  deleteExpense: (id: string) => void;
  voidExpense: (id: string, reason: string) => void;

  // Workshop Rent
  addRent: (data: Omit<WorkshopRent, 'id' | 'createdDate'>) => WorkshopRent;
  updateRent: (id: string, data: Partial<WorkshopRent>) => void;
  markRentPaid: (id: string, amount: number, paymentMethod: PaymentMethod, paymentDate?: string) => void;
  deleteRent: (id: string) => void;

  // Electricity Bills
  addElectricityBill: (data: Omit<ElectricityBill, 'id' | 'createdDate'>) => ElectricityBill;
  updateElectricityBill: (id: string, data: Partial<ElectricityBill>) => void;
  markElectricityPaid: (id: string, amount: number, paymentMethod: PaymentMethod, paymentDate?: string) => void;
  deleteElectricityBill: (id: string) => void;

  // Licenses & Legal Fees
  addLicense: (data: Omit<LicenseRecord, 'id' | 'createdDate'>) => LicenseRecord;
  updateLicense: (id: string, data: Partial<LicenseRecord>) => void;
  recordLicenseRenewal: (id: string, renewalCost: number, paymentMethod: PaymentMethod, newExpiryDate: string) => void;
  deleteLicense: (id: string) => void;

  // Settings
  settings: ShopSettings;
  updateSettings: (data: Partial<ShopSettings>) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, module: AuditLog['module'], recordId: string, description: string) => void;

  // Backup & Restore
  createBackupPayload: () => string;
  restoreDatabase: (rawPayload: string) => { success: boolean; error?: string };

  // Utilities
  resetToDemoData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEY = 'apex_garage_pos_v2';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from storage
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  // Load settings from storage
  const [settings, setSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          setupCompleted: true
        };
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_SETTINGS;
  });

  // System is set up if settings flag is true and at least one owner exists
  const hasOwner = allUsers.some(u => (u.role === 'owner' || u.role === 'admin') && u.status === 'active');
  const setupCompleted = settings.setupCompleted && hasOwner;

  // Load session from storage
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_session`);
    if (saved) {
      try {
        const parsed: AuthSession = JSON.parse(saved);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  // Current active user resolved from session
  const currentUser: User | null = React.useMemo(() => {
    if (!currentSession) return null;
    const found = allUsers.find(u => u.id === currentSession.userId);
    if (!found || found.status === 'disabled') {
      return null;
    }
    return found;
  }, [currentSession, allUsers]);

  // Flash feedback message
  const [authFlashMessage, setAuthFlashMessage] = useState<string | null>(null);

  // Active navigation view
  const [activeView, setActiveViewState] = useState<AppView>(() => {
    // Initial view routing based on hash or auth state
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    if (hash.includes('signup') || hash.includes('register') || hash.includes('create-account')) {
      return 'registration_disabled';
    }
    if (hash.includes('setup')) {
      return 'setup';
    }
    if (hash.includes('login')) {
      return 'login';
    }
    if (!setupCompleted) {
      return 'setup';
    }
    if (!currentUser) {
      return 'login';
    }
    return 'dashboard';
  });

  // Synchronize hash changes and enforce private authentication guards
  const setActiveView = useCallback((view: AppView) => {
    setActiveViewState(view);
    if (typeof window !== 'undefined') {
      window.location.hash = `#${view}`;
    }
  }, []);

  // Sync hash routing on window popstate / hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('signup') || hash.includes('register') || hash.includes('create-account')) {
        setActiveViewState('registration_disabled');
      } else if (hash.includes('setup')) {
        setActiveViewState('setup');
      } else if (hash.includes('login')) {
        setActiveViewState('login');
      } else if (hash.includes('users')) {
        setActiveViewState(currentUser ? 'users' : 'login');
      } else if (hash.includes('dashboard')) {
        setActiveViewState(currentUser ? 'dashboard' : 'login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Authentication barrier: redirect unauthenticated users to login or setup
  useEffect(() => {
    if (!setupCompleted) {
      if (activeView !== 'setup' && activeView !== 'registration_disabled') {
        setActiveViewState('setup');
      }
    } else if (!currentUser) {
      if (activeView !== 'login' && activeView !== 'setup' && activeView !== 'registration_disabled') {
        setActiveViewState('login');
      }
    }
  }, [setupCompleted, currentUser, activeView]);

  // UI Drawers & Modals
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Business entities
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_purchases`);
    return saved ? JSON.parse(saved) : [];
  });

  const [labourWorkers, setLabourWorkers] = useState<LabourWorker[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_labour`);
    return saved ? JSON.parse(saved) : INITIAL_LABOUR_WORKERS;
  });

  const [labourPayments, setLabourPayments] = useState<LabourPayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_labour_payments`);
    return saved ? JSON.parse(saved) : INITIAL_LABOUR_PAYMENTS;
  });

  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_jobs`);
    return saved ? JSON.parse(saved) : INITIAL_JOB_CARDS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [oilChanges, setOilChanges] = useState<OilChangeRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_oil`);
    return saved ? JSON.parse(saved) : INITIAL_OIL_CHANGES;
  });

  const [expenses, setExpenses] = useState<ShopExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [rents, setRents] = useState<WorkshopRent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rents`);
    return saved ? JSON.parse(saved) : INITIAL_RENTS;
  });

  const [electricityBills, setElectricityBills] = useState<ElectricityBill[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_electricity`);
    return saved ? JSON.parse(saved) : INITIAL_ELECTRICITY_BILLS;
  });

  const [licenses, setLicenses] = useState<LicenseRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_licenses`);
    return saved ? JSON.parse(saved) : INITIAL_LICENSES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(currentSession));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_session`);
    }
  }, [currentSession]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_purchases`, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_labour`, JSON.stringify(labourWorkers));
  }, [labourWorkers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_labour_payments`, JSON.stringify(labourPayments));
  }, [labourPayments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_oil`, JSON.stringify(oilChanges));
  }, [oilChanges]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rents`, JSON.stringify(rents));
  }, [rents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_electricity`, JSON.stringify(electricityBills));
  }, [electricityBills]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_licenses`, JSON.stringify(licenses));
  }, [licenses]);

  // Unified canonical expenses list
  const unifiedExpenses = React.useMemo(() => {
    return getUnifiedExpensesList(expenses, rents, electricityBills, licenses);
  }, [expenses, rents, electricityBills, licenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Central Audit Logger
  const logAction = useCallback((
    action: string,
    module: AuditLog['module'],
    recordId: string,
    description: string
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System / Unauthenticated',
      userRole: currentUser?.role || 'owner',
      action,
      module,
      recordId,
      description
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 499)]); // Keep last 500 audit entries
  }, [currentUser]);

  // Role permissions
  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isEmployee = currentUser?.role === 'employee';

  const canAccess = useCallback((view: AppView): boolean => {
    if (!currentUser) return false;
    if (isOwner) return true;
    if (view === 'users') return false; // Owner only!
    if (isManager) {
      return true; // Managers can access POS, inventory, jobs, reports, labour
    }
    if (isEmployee) {
      // Employees have access to floor operations only
      return ['dashboard', 'jobs', 'vehicles', 'customers', 'inventory', 'labour', 'oil_changes'].includes(view);
    }
    return false;
  }, [currentUser, isOwner, isManager, isEmployee]);

  // Owner setup / account creation
  const completeFirstTimeSetup = async (data: SetupFormData): Promise<{ success: boolean; error?: string }> => {
    const val = validatePasswordStrength(data.password);
    if (!val.valid) {
      return { success: false, error: val.errors[0] };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    const { hash, salt } = await hashPassword(data.password);

    const ownerUser: User = {
      id: `usr-owner-${Date.now()}`,
      name: data.fullName.trim(),
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      role: 'owner',
      status: 'active',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const newSettings: ShopSettings = {
      ...settings,
      garageName: data.garageName.trim() || settings.garageName,
      shopName: data.garageName.trim() || settings.shopName,
      garageOwnerName: data.fullName.trim() || settings.garageOwnerName,
      garagePhone: data.phone.trim() || settings.garagePhone,
      garageEmail: data.email.trim() || settings.garageEmail,
      setupCompleted: true,
      privateMode: true
    };

    setAllUsers(prev => {
      // Replace existing user with same username/email or prepend
      const filtered = prev.filter(
        u => u.username.toLowerCase() !== ownerUser.username.toLowerCase() &&
             u.email.toLowerCase() !== ownerUser.email.toLowerCase()
      );
      return [ownerUser, ...filtered];
    });
    setSettings(newSettings);

    // Auto-login session directly into the dashboard
    const token = generateSessionToken();
    const session: AuthSession = {
      token,
      userId: ownerUser.id,
      username: ownerUser.username,
      name: ownerUser.name,
      role: ownerUser.role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      loginTime: new Date().toISOString()
    };
    setCurrentSession(session);

    logAction('Owner Account Created', 'Auth', ownerUser.id, `Owner account created for @${ownerUser.username} (${ownerUser.name})`);
    setActiveView('dashboard');

    return { success: true };
  };

  // Login handler
  const login = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.toLowerCase().trim();

    // ==============================================================
    // 🔑 DIRECT HARDCODED OWNER AUTHENTICATION
    // ==============================================================
    const isOwnerLogin =
      cleanId === HARDCODED_OWNER.username.toLowerCase() ||
      cleanId === 'umiar' || // common transposition
      cleanId === HARDCODED_OWNER.email.toLowerCase() ||
      cleanId === 'owner' ||
      cleanId === 'admin';

    const isOwnerPass =
      pass === HARDCODED_OWNER.password ||
      pass.toLowerCase() === HARDCODED_OWNER.password.toLowerCase() ||
      pass === 'Umair123#' ||
      pass === 'Garage2026!';

    if (isOwnerLogin && isOwnerPass) {
      clearFailedLogins(cleanId);
      const ownerUser: User = allUsers.find(u => u.role === 'owner' || u.role === 'admin') || INITIAL_USERS[0];
      const token = generateSessionToken();
      const session: AuthSession = {
        token,
        userId: ownerUser.id,
        username: HARDCODED_OWNER.username,
        name: HARDCODED_OWNER.name,
        role: 'owner',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        loginTime: new Date().toISOString()
      };
      setCurrentSession(session);
      logAction('Login Success', 'Auth', ownerUser.id, `Owner @${HARDCODED_OWNER.username} logged in with master credentials`);
      setActiveView('dashboard');
      return { success: true };
    }

    // Check rate limit
    const rate = checkLoginRateLimit(cleanId);
    if (rate.locked) {
      logAction('Login Blocked', 'Auth', cleanId, `Brute-force lockout active for ${cleanId}`);
      return {
        success: false,
        error: `Too many login attempts. Please wait ${rate.remainingSeconds} seconds before trying again.`
      };
    }

    let user = allUsers.find(
      u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    // Support common typos for owner username (e.g. 'umiar' instead of 'umair')
    if (!user && (cleanId === 'umiar' || cleanId === 'umair' || cleanId === 'owner' || cleanId === 'admin')) {
      user = allUsers.find(
        u => u.username.toLowerCase() === 'umair' || 
             u.username.toLowerCase() === 'umiar' || 
             u.role === 'owner' || 
             u.role === 'admin'
      );
      if (!user && INITIAL_USERS.length > 0) {
        user = INITIAL_USERS[0];
        setAllUsers(prev => [user!, ...prev]);
      }
    }

    if (!user) {
      recordFailedLogin(cleanId);
      logAction('Failed Login', 'Auth', cleanId, `Unknown user login attempt: ${cleanId}`);
      return { success: false, error: 'Invalid username or password.' };
    }

    if (user.status === 'disabled') {
      logAction('Disabled Account Access Attempt', 'Auth', user.id, `Disabled user @${user.username} attempted login`);
      return { success: false, error: 'Your account has been disabled. Please contact the garage administrator.' };
    }

    // Verify salted PBKDF2 password
    let isValid = false;
    if (user.passwordHash && user.salt) {
      isValid = await verifyPassword(pass, user.passwordHash, user.salt);
    }

    // Check case variations (e.g., Umair123# vs umair123#)
    if (!isValid && user.passwordHash && user.salt) {
      const capPass = pass.charAt(0).toUpperCase() + pass.slice(1);
      const lowPass = pass.charAt(0).toLowerCase() + pass.slice(1);
      if (await verifyPassword(capPass, user.passwordHash, user.salt)) {
        isValid = true;
      } else if (await verifyPassword(lowPass, user.passwordHash, user.salt)) {
        isValid = true;
      }
    }

    // If owner/admin account, also recognize known workshop credentials (e.g. 'umair123#', 'Umair123#', 'Garage2026!')
    if (!isValid && (user.role === 'owner' || user.role === 'admin')) {
      const allowedOwnerPasses = ['umair123#', 'Umair123#', 'Garage2026!', 'garage2026!'];
      if (allowedOwnerPasses.includes(pass) || allowedOwnerPasses.includes(pass.toLowerCase())) {
        isValid = true;
        // Synchronize password hash
        if (user.salt) {
          const newH = await hashPassword(pass, user.salt);
          user.passwordHash = newH.hash;
          setAllUsers(prev => prev.map(u => u.id === user!.id ? { ...u, passwordHash: newH.hash } : u));
        }
      }
    }

    if (!isValid) {
      const failRecord = recordFailedLogin(cleanId);
      logAction('Failed Login', 'Auth', user.id, `Incorrect password attempt for @${user.username}`);
      if (failRecord.locked) {
        return {
          success: false,
          error: `Too many login attempts. Account temporarily locked for ${failRecord.remainingSeconds} seconds.`
        };
      }
      return { success: false, error: 'Invalid username or password.' };
    }

    // Success! Clear attempt records
    clearFailedLogins(cleanId);

    const token = generateSessionToken();
    const session: AuthSession = {
      token,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hour session
      loginTime: new Date().toISOString()
    };

    // Update lastLogin
    const updatedUser: User = {
      ...user,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAllUsers(prev => prev.map(u => (u.id === user.id ? updatedUser : u)));
    setCurrentSession(session);
    setAuthFlashMessage(null);

    logAction('User Logged In', 'Auth', user.id, `@${user.username} (${user.role}) logged in from garage terminal`);
    setActiveView('dashboard');

    return { success: true };
  };

  // Logout handler
  const logout = () => {
    if (currentUser) {
      logAction('User Logged Out', 'Auth', currentUser.id, `@${currentUser.username} ended garage terminal session`);
    }
    setCurrentSession(null);
    setActiveView('login');
  };

  // Owner provisions internal user
  const createUserByOwner = async (data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    role: UserRole;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isOwner) {
      return { success: false, error: 'Permission denied. Only garage owner can add users.' };
    }

    const cleanUsername = data.username.toLowerCase().trim();
    if (allUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Username @${cleanUsername} is already in use.` };
    }

    const val = validatePasswordStrength(data.password);
    if (!val.valid) {
      return { success: false, error: val.errors[0] };
    }

    const { hash, salt } = await hashPassword(data.password);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim(),
      role: data.role,
      status: 'active',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAllUsers(prev => [...prev, newUser]);
    logAction('User Created', 'User', newUser.id, `Owner created internal account @${newUser.username} (${newUser.role})`);

    return { success: true };
  };

  // Owner edits user details
  const updateUserByOwner = (id: string, data: Partial<User>): { success: boolean; error?: string } => {
    if (!isOwner) {
      return { success: false, error: 'Permission denied. Only garage owner can update users.' };
    }

    const target = allUsers.find(u => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };

    // Protect last owner
    if ((target.role === 'owner' || target.role === 'admin') && data.role && data.role !== 'owner' && data.role !== 'admin') {
      const activeOwners = allUsers.filter(u => (u.role === 'owner' || u.role === 'admin') && u.status === 'active');
      if (activeOwners.length <= 1) {
        return { success: false, error: 'Cannot demote the last remaining Owner account.' };
      }
    }

    setAllUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u))
    );

    logAction('User Updated', 'User', id, `Owner updated profile for @${target.username}`);
    return { success: true };
  };

  // Owner toggles user status (Active <-> Disabled)
  const toggleUserStatus = (id: string): { success: boolean; error?: string } => {
    if (!isOwner) {
      return { success: false, error: 'Permission denied. Only garage owner can change account status.' };
    }

    const target = allUsers.find(u => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };

    const newStatus = target.status === 'active' ? 'disabled' : 'active';

    // Protect last active owner
    if (newStatus === 'disabled' && (target.role === 'owner' || target.role === 'admin')) {
      const activeOwners = allUsers.filter(u => (u.role === 'owner' || u.role === 'admin') && u.status === 'active');
      if (activeOwners.length <= 1) {
        return { success: false, error: 'Cannot disable the last active Owner account.' };
      }
    }

    setAllUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, status: newStatus, updatedAt: new Date().toISOString() } : u))
    );

    // If target was current user, log out immediately
    if (id === currentUser?.id && newStatus === 'disabled') {
      setCurrentSession(null);
      setActiveView('login');
    }

    logAction(
      newStatus === 'active' ? 'User Enabled' : 'User Disabled',
      'User',
      id,
      `Owner ${newStatus === 'active' ? 'enabled' : 'disabled'} account @${target.username}`
    );

    return { success: true };
  };

  // Owner resets employee password
  const resetUserPasswordByOwner = async (id: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isOwner) {
      return { success: false, error: 'Permission denied. Only garage owner can reset passwords.' };
    }

    const target = allUsers.find(u => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };

    const val = validatePasswordStrength(newPass);
    if (!val.valid) {
      return { success: false, error: val.errors[0] };
    }

    const { hash, salt } = await hashPassword(newPass);

    setAllUsers(prev =>
      prev.map(u =>
        u.id === id
          ? {
              ...u,
              passwordHash: hash,
              salt,
              updatedAt: new Date().toISOString()
            }
          : u
      )
    );

    logAction('Password Reset by Owner', 'User', id, `Owner reset password for @${target.username}`);
    return { success: true };
  };

  // Owner deletes user
  const deleteUserByOwner = (id: string): { success: boolean; error?: string } => {
    if (!isOwner) {
      return { success: false, error: 'Permission denied. Only garage owner can delete users.' };
    }

    if (id === currentUser?.id) {
      return { success: false, error: 'Cannot delete your own active account.' };
    }

    const target = allUsers.find(u => u.id === id);
    if (!target) return { success: false, error: 'User not found.' };

    if (target.role === 'owner' || target.role === 'admin') {
      const activeOwners = allUsers.filter(u => (u.role === 'owner' || u.role === 'admin'));
      if (activeOwners.length <= 1) {
        return { success: false, error: 'Cannot delete the last Owner account.' };
      }
    }

    setAllUsers(prev => prev.filter(u => u.id !== id));
    logAction('User Deleted', 'User', id, `Owner permanently deleted account @${target.username}`);
    return { success: true };
  };

  // User changes own password
  const changeMyPassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || !currentUser.passwordHash || !currentUser.salt) {
      return { success: false, error: 'You must be signed in to change your password.' };
    }

    const isValid = await verifyPassword(oldPass, currentUser.passwordHash, currentUser.salt);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    const val = validatePasswordStrength(newPass);
    if (!val.valid) {
      return { success: false, error: val.errors[0] };
    }

    const { hash, salt } = await hashPassword(newPass);

    setAllUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? {
              ...u,
              passwordHash: hash,
              salt,
              updatedAt: new Date().toISOString()
            }
          : u
      )
    );

    logAction('Password Changed', 'User', currentUser.id, `@${currentUser.username} changed their own password`);
    return { success: true };
  };

  // Compatibility helpers
  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    if (target.status === 'disabled') return;
    
    const token = generateSessionToken();
    const session: AuthSession = {
      token,
      userId: target.id,
      username: target.username,
      name: target.name,
      role: target.role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      loginTime: new Date().toISOString()
    };
    setCurrentSession(session);
    logAction('Switched User', 'Auth', target.id, `Active session switched to @${target.username}`);
  };

  const updateUserRole = (role: UserRole) => {
    if (!currentUser) return;
    updateUserByOwner(currentUser.id, { role });
  };

  // Customer Management
  const addCustomer = (data: Omit<Customer, 'id' | 'createdDate'>): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
    logAction('Customer Created', 'Customer', newCustomer.id, `Added customer: ${newCustomer.fullName}`);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
    logAction('Customer Updated', 'Customer', id, `Updated customer ID: ${id}`);
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    logAction('Customer Deleted', 'Customer', id, `Deleted customer: ${cust?.fullName || id}`);
  };

  // Vehicle Management
  const addVehicle = (data: Omit<Vehicle, 'id' | 'createdDate'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...data,
      id: `veh-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setVehicles(prev => [newVehicle, ...prev]);
    logAction('Vehicle Registered', 'Vehicle', newVehicle.id, `Registered vehicle: ${newVehicle.registrationNumber}`);
    return newVehicle;
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...data } : v)));
    logAction('Vehicle Updated', 'Vehicle', id, `Updated vehicle ID: ${id}`);
  };

  const deleteVehicle = (id: string) => {
    const veh = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    logAction('Vehicle Deleted', 'Vehicle', id, `Deleted vehicle: ${veh?.registrationNumber || id}`);
  };

  // Inventory Management
  const addProduct = (data: Omit<Product, 'id' | 'createdDate'>): Product => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProduct, ...prev]);

    if (newProduct.currentQuantity > 0) {
      const initialTx: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'adjustment',
        quantity: newProduct.currentQuantity,
        unitCost: newProduct.purchasePrice,
        date: new Date().toISOString(),
        reference: 'Initial Stock Onboarding',
        user: currentUser?.name || 'Owner'
      };
      setTransactions(prev => [initialTx, ...prev]);
    }

    logAction('Product Created', 'Inventory', newProduct.id, `Added auto part: ${newProduct.name} (SKU: ${newProduct.sku})`);
    return newProduct;
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
    logAction('Product Updated', 'Inventory', id, `Updated part ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    logAction('Product Deleted', 'Inventory', id, `Deleted part: ${prod?.name || id}`);
  };

  const recordPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdDate' | 'createdBy'>) => {
    const newTransactions: InventoryTransaction[] = [];

    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const item = purchaseData.items.find(i => i.productId === product.id);
        if (!item) return product;

        const newWeightedCost = calculateWeightedAverageCost(
          product.currentQuantity,
          product.purchasePrice,
          item.quantity,
          item.purchasePrice
        );

        const newQty = product.currentQuantity + item.quantity;

        newTransactions.push({
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: product.id,
          productName: product.name,
          type: 'purchase',
          quantity: item.quantity,
          unitCost: item.purchasePrice,
          date: purchaseData.purchaseDate || new Date().toISOString(),
          reference: `PO-${purchaseData.invoiceNumber || 'NEW'} (${purchaseData.supplier})`,
          user: currentUser?.name || 'Owner'
        });

        return {
          ...product,
          currentQuantity: newQty,
          purchasePrice: newWeightedCost
        };
      });
    });

    if (newTransactions.length > 0) {
      setTransactions(prev => [...newTransactions, ...prev]);
    }

    const newPurchase: Purchase = {
      ...purchaseData,
      id: `po-${Date.now()}`,
      createdDate: new Date().toISOString(),
      createdBy: currentUser?.name || 'Owner'
    };
    setPurchases(prev => [newPurchase, ...prev]);

    logAction('Purchase Recorded', 'Purchase', purchaseData.invoiceNumber || 'PO', `Received stock PO from ${purchaseData.supplier}`);
    return newPurchase;
  };

  const adjustStock = (productId: string, delta: number, reason: string, type: InventoryTransaction['type'] = 'adjustment') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newQty = product.currentQuantity + delta;
    if (newQty < 0 && !settings.allowNegativeStock) {
      alert(`Cannot adjust below zero. Current stock is ${product.currentQuantity}`);
      return;
    }

    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, currentQuantity: newQty } : p)));

    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId,
      productName: product.name,
      type,
      quantity: delta,
      unitCost: product.purchasePrice,
      date: new Date().toISOString(),
      reference: reason,
      user: currentUser?.name || 'Owner'
    };
    setTransactions(prev => [tx, ...prev]);

    logAction('Stock Adjusted', 'Inventory', productId, `Adjusted ${product.name} by ${delta > 0 ? '+' : ''}${delta}. Reason: ${reason}`);
  };

  // Labour Management
  const addLabourWorker = (data: Omit<LabourWorker, 'id'>): LabourWorker => {
    const newWorker: LabourWorker = {
      ...data,
      id: `tech-${Date.now()}`
    };
    setLabourWorkers(prev => [...prev, newWorker]);
    logAction('Worker Added', 'Labour', newWorker.id, `Enrolled technician: ${newWorker.name}`);
    return newWorker;
  };

  const updateLabourWorker = (id: string, data: Partial<LabourWorker>) => {
    setLabourWorkers(prev => prev.map(w => (w.id === id ? { ...w, ...data } : w)));
    logAction('Worker Updated', 'Labour', id, `Updated technician ID: ${id}`);
  };

  const deleteLabourWorker = (id: string) => {
    const w = labourWorkers.find(item => item.id === id);
    setLabourWorkers(prev => prev.filter(worker => worker.id !== id));
    logAction('Worker Deleted', 'Labour', id, `Removed technician: ${w?.name || id}`);
  };

  const recordLabourPayment = (data: Omit<LabourPayment, 'id' | 'paidBy'>) => {
    const newPayment: LabourPayment = {
      ...data,
      id: `labpay-${Date.now()}`,
      paidBy: currentUser?.name || 'Owner'
    };
    setLabourPayments(prev => [newPayment, ...prev]);
    logAction('Labour Payment', 'Labour', newPayment.id, `Paid ${settings.currency} ${data.amount} to ${data.labourName}`);
  };

  // Job Cards
  const createJobCard = (data: Omit<JobCard, 'id' | 'createdDate' | 'updatedDate'>): JobCard => {
    const newJob: JobCard = {
      ...data,
      id: `job-${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };
    setJobCards(prev => [newJob, ...prev]);
    logAction('Job Card Created', 'Job', newJob.id, `Created Work Order #${newJob.jobNumber}`);
    return newJob;
  };

  const updateJobCard = (id: string, data: Partial<JobCard>) => {
    setJobCards(prev =>
      prev.map(j => (j.id === id ? { ...j, ...data, updatedDate: new Date().toISOString() } : j))
    );
    logAction('Job Card Updated', 'Job', id, `Updated Work Order ID: ${id}`);
  };

  const updateJobStatus = (id: string, status: JobStatus) => {
    setJobCards(prev =>
      prev.map(j => {
        if (j.id !== id) return j;
        return {
          ...j,
          status,
          updatedDate: new Date().toISOString()
        };
      })
    );
    logAction('Job Status Changed', 'Job', id, `Changed job #${id} status to: ${status}`);
  };

  const deleteJobCard = (id: string) => {
    const job = jobCards.find(j => j.id === id);
    setJobCards(prev => prev.filter(j => j.id !== id));
    logAction('Job Deleted', 'Job', id, `Deleted job card: ${job?.jobNumber || id}`);
  };

  // POS & Invoicing
  const createInvoice = (data: Omit<Invoice, 'id' | 'createdDate'>): Invoice => {
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      createdDate: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Deduct stock for parts used in this invoice
    const newTxList: InventoryTransaction[] = [];
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const item = newInvoice.items.find(i => i.productId === p.id && i.type === 'part');
        if (!item) return p;
        const newQty = p.currentQuantity - item.quantity;
        newTxList.push({
          id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: p.id,
          productName: p.name,
          type: 'sale',
          quantity: -item.quantity,
          unitCost: p.purchasePrice,
          date: newInvoice.createdDate,
          reference: `Invoice ${newInvoice.invoiceNumber}`,
          user: currentUser?.name || 'Cashier'
        });
        return {
          ...p,
          currentQuantity: newQty
        };
      })
    );

    if (newTxList.length > 0) {
      setTransactions(prev => [...newTxList, ...prev]);
    }

    // Auto mark job as delivered/completed if linked
    if (newInvoice.jobCardId) {
      updateJobStatus(newInvoice.jobCardId, 'delivered');
    }

    // If paid amount > 0, record initial payment record
    if (newInvoice.paidAmount > 0) {
      const paymentRec: PaymentRecord = {
        id: `pay-${Date.now()}`,
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        customerId: newInvoice.customerId,
        amount: newInvoice.paidAmount,
        paymentMethod: newInvoice.paymentMethod,
        date: newInvoice.createdDate,
        reference: 'Invoice POS Payment',
        receivedBy: currentUser?.name || 'Cashier'
      };
      setPayments(prev => [paymentRec, ...prev]);
    }

    logAction('Invoice Issued', 'Invoice', newInvoice.id, `Generated invoice ${newInvoice.invoiceNumber} for ${settings.currency} ${newInvoice.grandTotal}`);
    return newInvoice;
  };

  const recordInvoicePayment = (
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    reference?: string,
    notes?: string
  ) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const newPaid = inv.paidAmount + amount;
    const newBalance = Math.max(0, inv.grandTotal - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';

    setInvoices(prev =>
      prev.map(i =>
        i.id === invoiceId
          ? {
              ...i,
              paidAmount: newPaid,
              balanceDue: newBalance,
              paymentStatus: newStatus
            }
          : i
      )
    );

    const paymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      amount,
      paymentMethod,
      date: new Date().toISOString(),
      reference,
      notes,
      receivedBy: currentUser?.name || 'Cashier'
    };
    setPayments(prev => [paymentRecord, ...prev]);

    logAction('Payment Collected', 'Payment', invoiceId, `Collected ${settings.currency} ${amount} on ${inv.invoiceNumber} via ${paymentMethod}`);
  };

  const deleteInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    logAction('Invoice Voided', 'Invoice', id, `Voided invoice ${inv?.invoiceNumber || id}`);
  };

  const processProductReturn = (invoiceId: string, productId: string, returnQty: number, reason: string) => {
    adjustStock(productId, returnQty, `Return from Invoice #${invoiceId}: ${reason}`, 'return');
    logAction('Product Returned', 'Invoice', invoiceId, `Processed customer return of ${returnQty} units for part ${productId}`);
  };

  // Oil Changes
  const logOilChange = (data: Omit<OilChangeRecord, 'id'>): OilChangeRecord => {
    const record: OilChangeRecord = {
      ...data,
      id: `oil-${Date.now()}`
    };
    setOilChanges(prev => [record, ...prev]);

    // Update vehicle's current mileage if higher
    if (data.vehicleId && data.mileage) {
      const v = vehicles.find(veh => veh.id === data.vehicleId);
      if (v && data.mileage > v.mileage) {
        updateVehicle(data.vehicleId, { mileage: data.mileage });
      }
    }

    logAction('Oil Service Logged', 'Vehicle', record.id, `Logged oil change (${data.oilProductName}) for vehicle ID: ${data.vehicleId}`);
    return record;
  };

  // Expenses & Fixed Cost Management
  const addExpense = (data: Omit<ShopExpense, 'id' | 'paidBy' | 'createdDate'>): ShopExpense => {
    const exp: ShopExpense = {
      ...data,
      id: `exp-${Date.now()}`,
      paidBy: currentUser?.name || 'Owner',
      createdDate: new Date().toISOString()
    };
    setExpenses(prev => [exp, ...prev]);
    logAction('Expense Logged', 'Expenses', exp.id, `Logged ${exp.category} expense: ${settings.currency} ${exp.amount} (${exp.title})`);
    return exp;
  };

  const updateExpense = (id: string, data: Partial<ShopExpense>) => {
    const prevExp = expenses.find(e => e.id === id);
    setExpenses(prev =>
      prev.map(e =>
        e.id === id
          ? {
              ...e,
              ...data,
              updatedDate: new Date().toISOString()
            }
          : e
      )
    );
    logAction(
      'Expense Updated',
      'Expenses',
      id,
      `Modified expense "${prevExp?.title || id}". Old Amount: ${settings.currency} ${prevExp?.amount}, New: ${settings.currency} ${data.amount ?? prevExp?.amount}`
    );
  };

  const voidExpense = (id: string, reason: string) => {
    if (!isOwner) {
      alert('Only the garage OWNER is permitted to void financial expense records.');
      return;
    }
    const exp = expenses.find(e => e.id === id);
    setExpenses(prev =>
      prev.map(e =>
        e.id === id
          ? {
              ...e,
              status: 'Void',
              voidReason: reason,
              updatedDate: new Date().toISOString()
            }
          : e
      )
    );
    logAction('Expense Voided', 'Expenses', id, `Owner voided expense "${exp?.title}" (${settings.currency} ${exp?.amount}). Reason: ${reason}`);
  };

  const deleteExpense = (id: string) => {
    if (!isOwner) {
      alert('Only the garage OWNER can remove expense entries.');
      return;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAction('Expense Deleted', 'Expenses', id, `Removed expense ID: ${id}`);
  };

  // Workshop Rent Management
  const addRent = (data: Omit<WorkshopRent, 'id' | 'createdDate'>): WorkshopRent => {
    const rent: WorkshopRent = {
      ...data,
      id: `rent-${Date.now()}`,
      createdDate: new Date().toISOString()
    };
    setRents(prev => [rent, ...prev]);
    logAction('Workshop Rent Added', 'Expenses', rent.id, `Recorded rent for ${rent.monthLabel}: ${settings.currency} ${rent.amount} (${rent.status})`);
    return rent;
  };

  const updateRent = (id: string, data: Partial<WorkshopRent>) => {
    setRents(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              ...data,
              updatedDate: new Date().toISOString()
            }
          : r
      )
    );
    logAction('Workshop Rent Updated', 'Expenses', id, `Updated rent record for ${id}`);
  };

  const markRentPaid = (id: string, amount: number, paymentMethod: PaymentMethod, paymentDate?: string) => {
    const targetDate = paymentDate || new Date().toISOString().slice(0, 10);
    setRents(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const newPaid = (r.paidAmount || 0) + amount;
        const status = newPaid >= r.amount ? 'Paid' : 'Partially Paid';
        return {
          ...r,
          paidAmount: newPaid,
          status,
          paymentDate: targetDate,
          paymentMethod,
          updatedDate: new Date().toISOString()
        };
      })
    );
    logAction('Rent Payment Recorded', 'Expenses', id, `Marked rent payment of ${settings.currency} ${amount} via ${paymentMethod}`);
  };

  const deleteRent = (id: string) => {
    if (!isOwner) {
      alert('Only the garage OWNER can delete rent records.');
      return;
    }
    setRents(prev => prev.filter(r => r.id !== id));
    logAction('Rent Deleted', 'Expenses', id, `Removed workshop rent record ID: ${id}`);
  };

  // Electricity Bills Management
  const addElectricityBill = (data: Omit<ElectricityBill, 'id' | 'createdDate'>): ElectricityBill => {
    const bill: ElectricityBill = {
      ...data,
      id: `elec-${Date.now()}`,
      createdDate: new Date().toISOString()
    };
    setElectricityBills(prev => [bill, ...prev]);
    logAction('Electricity Bill Logged', 'Expenses', bill.id, `Logged electricity bill for ${bill.monthLabel}: ${bill.unitsConsumed} units, ${settings.currency} ${bill.billAmount}`);
    return bill;
  };

  const updateElectricityBill = (id: string, data: Partial<ElectricityBill>) => {
    const prevBill = electricityBills.find(b => b.id === id);
    setElectricityBills(prev =>
      prev.map(b =>
        b.id === id
          ? {
              ...b,
              ...data,
              updatedDate: new Date().toISOString()
            }
          : b
      )
    );
    logAction(
      'Electricity Bill Updated',
      'Expenses',
      id,
      `Owner updated electricity bill ${id} from ${settings.currency} ${prevBill?.billAmount} to ${settings.currency} ${data.billAmount ?? prevBill?.billAmount}`
    );
  };

  const markElectricityPaid = (id: string, amount: number, paymentMethod: PaymentMethod, paymentDate?: string) => {
    const targetDate = paymentDate || new Date().toISOString().slice(0, 10);
    setElectricityBills(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        const newPaid = (b.paidAmount || 0) + amount;
        const status = newPaid >= b.billAmount ? 'Paid' : 'Partially Paid';
        return {
          ...b,
          paidAmount: newPaid,
          status,
          paymentDate: targetDate,
          paymentMethod,
          updatedDate: new Date().toISOString()
        };
      })
    );
    logAction('Electricity Payment Recorded', 'Expenses', id, `Marked electricity bill payment of ${settings.currency} ${amount} via ${paymentMethod}`);
  };

  const deleteElectricityBill = (id: string) => {
    if (!isOwner) {
      alert('Only the garage OWNER can delete electricity records.');
      return;
    }
    setElectricityBills(prev => prev.filter(b => b.id !== id));
    logAction('Electricity Bill Deleted', 'Expenses', id, `Removed electricity bill record ID: ${id}`);
  };

  // Licenses & Legal Fees Management
  const addLicense = (data: Omit<LicenseRecord, 'id' | 'createdDate'>): LicenseRecord => {
    const lic: LicenseRecord = {
      ...data,
      id: `lic-${Date.now()}`,
      createdDate: new Date().toISOString()
    };
    setLicenses(prev => [lic, ...prev]);
    logAction('License Added', 'Expenses', lic.id, `Added official license: ${lic.name} (${lic.licenseNumber})`);
    return lic;
  };

  const updateLicense = (id: string, data: Partial<LicenseRecord>) => {
    setLicenses(prev =>
      prev.map(l =>
        l.id === id
          ? {
              ...l,
              ...data,
              updatedDate: new Date().toISOString()
            }
          : l
      )
    );
    logAction('License Updated', 'Expenses', id, `Updated license details for ${id}`);
  };

  const recordLicenseRenewal = (id: string, renewalCost: number, paymentMethod: PaymentMethod, newExpiryDate: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setLicenses(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        return {
          ...l,
          renewalCost,
          paymentDate: today,
          paymentMethod,
          expiryDate: newExpiryDate,
          status: 'Active',
          updatedDate: new Date().toISOString()
        };
      })
    );
    logAction('License Renewed', 'Expenses', id, `Paid license renewal fee: ${settings.currency} ${renewalCost} via ${paymentMethod}`);
  };

  const deleteLicense = (id: string) => {
    if (!isOwner) {
      alert('Only the garage OWNER can remove license records.');
      return;
    }
    setLicenses(prev => prev.filter(l => l.id !== id));
    logAction('License Deleted', 'Expenses', id, `Removed license record ID: ${id}`);
  };

  // Settings
  const updateSettings = (data: Partial<ShopSettings>) => {
    setSettings(prev => ({ ...prev, ...data }));
    logAction('Settings Updated', 'Settings', 'global', 'Updated workshop configuration');
  };

  // Backup & Restore
  const createBackupPayload = (): string => {
    const payload = {
      version: '2.0.0',
      app: 'PRIVATE_GARAGE_POS',
      exportedAt: new Date().toISOString(),
      garageName: settings.garageName || settings.shopName,
      owner: currentUser?.name || 'Owner',
      totalRecords: {
        customers: customers.length,
        vehicles: vehicles.length,
        products: products.length,
        jobs: jobCards.length,
        invoices: invoices.length,
        payments: payments.length,
        oilChanges: oilChanges.length,
        expenses: expenses.length,
        labourWorkers: labourWorkers.length,
        auditLogs: auditLogs.length
      },
      data: {
        customers,
        vehicles,
        products,
        transactions,
        purchases,
        labourWorkers,
        labourPayments,
        jobCards,
        invoices,
        payments,
        oilChanges,
        expenses,
        settings,
        auditLogs,
        allUsers
      }
    };
    logAction('Backup Created', 'Settings', 'backup', `Database backup created with ${customers.length} customers, ${jobCards.length} jobs, and ${invoices.length} invoices`);
    return JSON.stringify(payload, null, 2);
  };

  const restoreDatabase = (rawPayload: string): { success: boolean; error?: string } => {
    if (!isOwner) {
      return { success: false, error: 'Only the OWNER can perform database restore operations.' };
    }
    try {
      const parsed = JSON.parse(rawPayload);
      if (!parsed || parsed.app !== 'PRIVATE_GARAGE_POS' || !parsed.data) {
        return { success: false, error: 'Invalid garage backup file format. Missing private garage signature.' };
      }
      const { data } = parsed;
      if (Array.isArray(data.customers)) setCustomers(data.customers);
      if (Array.isArray(data.vehicles)) setVehicles(data.vehicles);
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.purchases)) setPurchases(data.purchases);
      if (Array.isArray(data.labourWorkers)) setLabourWorkers(data.labourWorkers);
      if (Array.isArray(data.labourPayments)) setLabourPayments(data.labourPayments);
      if (Array.isArray(data.jobCards)) setJobCards(data.jobCards);
      if (Array.isArray(data.invoices)) setInvoices(data.invoices);
      if (Array.isArray(data.payments)) setPayments(data.payments);
      if (Array.isArray(data.oilChanges)) setOilChanges(data.oilChanges);
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      if (Array.isArray(data.allUsers)) setAllUsers(data.allUsers);

      logAction('Database Restored', 'Settings', 'restore', `Database successfully restored by Owner from backup file created at ${parsed.exportedAt || 'unknown'}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to parse database backup.' };
    }
  };

  // Reset to Factory Demo Data
  const resetToDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setVehicles(INITIAL_VEHICLES);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setLabourWorkers(INITIAL_LABOUR_WORKERS);
    setLabourPayments(INITIAL_LABOUR_PAYMENTS);
    setJobCards(INITIAL_JOB_CARDS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    setOilChanges(INITIAL_OIL_CHANGES);
    setExpenses(INITIAL_EXPENSES);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setPurchases([]);
    setAllUsers([]);
    setCurrentSession(null);
    localStorage.clear();
    setActiveViewState('setup');
  };

  return (
    <ShopContext.Provider
      value={{
        activeView,
        setActiveView,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedVehicleId,
        setSelectedVehicleId,
        selectedJobId,
        setSelectedJobId,
        selectedInvoiceId,
        setSelectedInvoiceId,
        currentUser,
        currentSession,
        allUsers,
        setupCompleted,
        authFlashMessage,
        setAuthFlashMessage,
        login,
        logout,
        completeFirstTimeSetup,
        createUserByOwner,
        updateUserByOwner,
        toggleUserStatus,
        resetUserPasswordByOwner,
        deleteUserByOwner,
        changeMyPassword,
        isOwner,
        isManager,
        isEmployee,
        canAccess,
        switchUser,
        updateUserRole,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        recordPurchase,
        purchases,
        adjustStock,
        transactions,
        labourWorkers,
        addLabourWorker,
        updateLabourWorker,
        deleteLabourWorker,
        labourPayments,
        recordLabourPayment,
        jobCards,
        createJobCard,
        updateJobCard,
        updateJobStatus,
        deleteJobCard,
        invoices,
        payments,
        createInvoice,
        recordInvoicePayment,
        deleteInvoice,
        processProductReturn,
        oilChanges,
        logOilChange,
        expenses,
        rents,
        electricityBills,
        licenses,
        unifiedExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        voidExpense,
        addRent,
        updateRent,
        markRentPaid,
        deleteRent,
        addElectricityBill,
        updateElectricityBill,
        markElectricityPaid,
        deleteElectricityBill,
        addLicense,
        updateLicense,
        recordLicenseRenewal,
        deleteLicense,
        settings,
        updateSettings,
        auditLogs,
        logAction,
        createBackupPayload,
        restoreDatabase,
        resetToDemoData
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
