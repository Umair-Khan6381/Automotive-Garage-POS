import { Request } from 'express';

export type UserRole = 'owner' | 'manager' | 'employee';

export interface AuthenticatedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  timestamp: string;
}

// -------------------------------------------------------------
// Financial, Profit & Expense DTOs
// -------------------------------------------------------------
export type ExpenseCategory =
  | 'Breakfast'
  | 'Tea'
  | 'Lunch'
  | 'Dinner'
  | 'Staff Food'
  | 'Guest Food'
  | 'Conveyance'
  | 'Petrol/Fuel'
  | 'Delivery'
  | 'Vehicle Transport'
  | 'Other Travel'
  | 'Cleaning'
  | 'Water'
  | 'Tools'
  | 'Small Repairs'
  | 'Maintenance'
  | 'Stationery'
  | 'Shop Supplies'
  | 'Miscellaneous'
  | 'Rent'
  | 'Electricity'
  | 'Internet'
  | 'Security'
  | 'Software Subscription'
  | 'Telephone'
  | 'Insurance'
  | 'License & Legal'
  | 'Other Fixed';

export type ExpenseType = 'daily' | 'fixed' | 'workshop' | 'legal';
export type ExpenseStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Void';

export interface ProfitBreakdownDTO {
  monthKey: string;
  label: string;
  invoiceCount: number;
  revenue: number;
  partsRevenue: number;
  partsCost: number;
  labourRevenue: number;
  labourCost: number;
  servicesRevenue: number;
  servicesCost: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  marginPercent: number;
}

export interface PeriodProfitDTO {
  periodType: 'weekly' | 'monthly' | 'yearly';
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  invoiceCount: number;
  revenue: number;
  partsRevenue: number;
  partsCost: number;
  labourRevenue: number;
  labourCost: number;
  servicesRevenue: number;
  servicesCost: number;
  discount: number;
  cogs: number;
  foodAndTeaExpenses: number;
  conveyanceExpenses: number;
  workshopSuppliesExpenses: number;
  rentExpenses: number;
  electricityExpenses: number;
  licenseExpenses: number;
  otherFixedExpenses: number;
  dailyExpensesTotal: number;
  fixedExpensesTotal: number;
  expenses: number;
  grossProfit: number;
  totalInvestment: number;
  netProfit: number;
  marginPercent: number;
  roiPercent: number;
}

export interface GrandProfitDTO {
  totalInvoices: number;
  totalRevenue: number;
  totalCOGS: number;
  totalExpenses: number;
  totalInvestment: number;
  grossProfit: number;
  grandNetProfit: number;
  grandMargin: number;
  grandRoi: number;
  periodType: 'weekly' | 'monthly' | 'yearly';
  breakdown: PeriodProfitDTO[];
  monthlyBreakdown: ProfitBreakdownDTO[];
}

export interface MonthlyExpenseSummaryDTO {
  monthKey: string;
  monthLabel: string;
  dailyExpenses: number;
  rent: number;
  electricity: number;
  licenses: number;
  otherFixed: number;
  foodAndTea: number;
  conveyance: number;
  workshopSupplies: number;
  totalPaidExpenses: number;
  pendingLiabilities: number;
  overdueBills: number;
  fixedMonthlyOverhead: number;
}

export interface DashboardStatsDTO {
  todaySales: number;
  thisMonthSales: number;
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  todayExpenses: number;
  thisMonthExpenses: number;
  pendingReceivables: number;
  unpaidInvoicesCount: number;
  activeJobsCount: number;
  lowStockCount: number;
  overdueServicesCount: number;
  fixedMonthlyCost: number;
}
