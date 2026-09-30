import { Invoice, Purchase } from '../types';
import { UnifiedExpenseItem } from './expenseCalculations';

export type ProfitPeriodType = 'weekly' | 'monthly' | 'yearly';

export interface PeriodProfitRecord {
  key: string;              // e.g. "2026-W39" or "2026-09" or "2026"
  label: string;            // e.g. "Week 39 (22 Sep - 28 Sep 2026)", "September 2026", "Year 2026"
  subLabel?: string;
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  invoiceCount: number;

  // Revenue Streams
  revenue: number;
  partsRevenue: number;
  labourRevenue: number;
  servicesRevenue: number;
  discount: number;

  // Investment / Cost Streams
  partsCost: number;        // Parts cost incurred on sold jobs/invoices (COGS)
  labourCost: number;       // Labour cost paid/allocated for jobs
  servicesCost: number;
  cogs: number;             // Total direct job costs (parts + labour + services)
  stockPurchasedCost: number; // Raw supplier stock PO purchases in this period

  // Operating Expenses (Deduplicated Unified Source of Truth)
  foodAndTeaExpenses: number;   // Breakfast, Tea rounds, Lunch, Dinner, Staff/Guest food
  conveyanceExpenses: number;   // Petrol, Rickshaw, Delivery, Vehicle transport
  workshopSuppliesExpenses: number; // Tools, Cleaning, Maintenance, Stationery
  rentExpenses: number;         // Workshop premises rent
  electricityExpenses: number;  // Electricity utility bills
  licenseExpenses: number;      // Trade licenses & legal permits
  otherFixedExpenses: number;   // Internet, security, software, insurance
  dailyExpensesTotal: number;   // All daily operational costs
  fixedExpensesTotal: number;   // Rent + Electricity + Licenses + Other fixed
  totalOperatingExpenses: number; // All paid expenses combined

  // Total Investment & Profit Metrics
  grossProfit: number;          // Revenue - COGS
  totalInvestment: number;      // Total capital invested/spent = COGS + totalOperatingExpenses
  netProfit: number;            // Gross Profit - totalOperatingExpenses
  marginPercent: number;        // (Net Profit / Revenue) * 100
  roiPercent: number;           // (Net Profit / Total Investment) * 100
}

/**
 * Calculates ISO Week Number and Monday/Sunday dates
 */
export function getISOWeekDetails(dateInput: Date | string): {
  weekKey: string;
  label: string;
  startDateStr: string;
  endDateStr: string;
} {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    return getISOWeekDetails(fallback);
  }

  // Set date to day of week (Monday as 1, Sunday as 7)
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Compute ISO Week Number
  const target = new Date(monday.valueOf());
  const dayNr = (monday.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = monday.getFullYear();

  const startDateStr = monday.toISOString().slice(0, 10);
  const endDateStr = sunday.toISOString().slice(0, 10);

  const formatShort = (dt: Date) =>
    dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return {
    weekKey: `${year}-W${String(weekNum).padStart(2, '0')}`,
    label: `Week ${weekNum} (${formatShort(monday)} - ${formatShort(sunday)}, ${year})`,
    startDateStr,
    endDateStr
  };
}

/**
 * Formats YYYY-MM into Month Year label
 */
export function getMonthDetails(dateInput: Date | string): {
  monthKey: string;
  label: string;
  startDateStr: string;
  endDateStr: string;
} {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const label = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    monthKey,
    label,
    startDateStr: startDate.toISOString().slice(0, 10),
    endDateStr: endDate.toISOString().slice(0, 10)
  };
}

/**
 * Formats YYYY into Year label
 */
export function getYearDetails(dateInput: Date | string): {
  yearKey: string;
  label: string;
  startDateStr: string;
  endDateStr: string;
} {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  return {
    yearKey: String(year),
    label: `Year ${year}`,
    startDateStr: `${year}-01-01`,
    endDateStr: `${year}-12-31`
  };
}

/**
 * Main engine to compute Period Profit & Investment Analysis
 * for Weekly, Monthly, or Yearly breakdown
 */
export function calculateProfitByPeriod(
  periodType: ProfitPeriodType,
  invoices: Invoice[],
  paidExpenses: UnifiedExpenseItem[],
  purchases: Purchase[] = []
): PeriodProfitRecord[] {
  // Collect all unique period keys across invoices, expenses, and purchases
  const periodMap = new Map<
    string,
    {
      key: string;
      label: string;
      startDate: string;
      endDate: string;
      invoices: Invoice[];
      expenses: UnifiedExpenseItem[];
      purchases: Purchase[];
    }
  >();

  const getPeriodKeyAndDetails = (dateStr: string) => {
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return null;

    if (periodType === 'weekly') {
      const details = getISOWeekDetails(dt);
      return {
        key: details.weekKey,
        label: details.label,
        startDate: details.startDateStr,
        endDate: details.endDateStr
      };
    } else if (periodType === 'yearly') {
      const details = getYearDetails(dt);
      return {
        key: details.yearKey,
        label: details.label,
        startDate: details.startDateStr,
        endDate: details.endDateStr
      };
    } else {
      // Monthly
      const details = getMonthDetails(dt);
      return {
        key: details.monthKey,
        label: details.label,
        startDate: details.startDateStr,
        endDate: details.endDateStr
      };
    }
  };

  // Helper to ensure bucket exists in map
  const ensureBucket = (dateStr: string) => {
    const details = getPeriodKeyAndDetails(dateStr);
    if (!details) return null;
    if (!periodMap.has(details.key)) {
      periodMap.set(details.key, {
        key: details.key,
        label: details.label,
        startDate: details.startDate,
        endDate: details.endDate,
        invoices: [],
        expenses: [],
        purchases: []
      });
    }
    return periodMap.get(details.key)!;
  };

  // 1. Assign invoices to periods
  invoices.forEach(inv => {
    const dStr = inv.date || inv.createdDate || '';
    const bucket = ensureBucket(dStr);
    if (bucket) {
      bucket.invoices.push(inv);
    }
  });

  // 2. Assign paid expenses to periods
  paidExpenses.forEach(exp => {
    if (exp.paymentStatus !== 'Paid') return;
    const dStr = exp.date || '';
    const bucket = ensureBucket(dStr);
    if (bucket) {
      bucket.expenses.push(exp);
    }
  });

  // 3. Assign purchases to periods
  purchases.forEach(p => {
    const dStr = p.purchaseDate || p.createdDate || '';
    const bucket = ensureBucket(dStr);
    if (bucket) {
      bucket.purchases.push(p);
    }
  });

  // If map is empty, create current period bucket
  if (periodMap.size === 0) {
    const nowStr = new Date().toISOString().slice(0, 10);
    ensureBucket(nowStr);
  }

  // Sort periods in reverse chronological order (newest first)
  const sortedBuckets = Array.from(periodMap.values()).sort((a, b) =>
    b.key.localeCompare(a.key)
  );

  return sortedBuckets.map(b => {
    // 1. Revenues
    const partsRevenue = b.invoices.reduce((sum, i) => sum + (i.partsTotal || 0), 0);
    const labourRevenue = b.invoices.reduce((sum, i) => sum + (i.labourTotal || 0), 0);
    const servicesRevenue = b.invoices.reduce((sum, i) => sum + (i.servicesTotal || 0), 0);
    const discount = b.invoices.reduce((sum, i) => sum + (i.discount || 0), 0);
    const revenue = b.invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);

    // 2. Direct Costs (COGS)
    const partsCost = b.invoices.reduce((sum, i) => sum + (i.partsCost || 0), 0);
    const labourCost = b.invoices.reduce((sum, i) => sum + (i.labourCost || 0), 0);
    const servicesCost = b.invoices.reduce((sum, i) => sum + (i.servicesCost || 0), 0);
    const cogs = partsCost + labourCost + servicesCost;

    // Supplier Stock Purchases in this period
    const stockPurchasedCost = b.purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);

    // 3. Operating Expenses Breakdown
    let foodAndTeaExpenses = 0;
    let conveyanceExpenses = 0;
    let workshopSuppliesExpenses = 0;
    let rentExpenses = 0;
    let electricityExpenses = 0;
    let licenseExpenses = 0;
    let otherFixedExpenses = 0;

    b.expenses.forEach(e => {
      const amt = e.paidAmount || e.amount || 0;
      const cat = e.category;

      if (['Breakfast', 'Tea', 'Lunch', 'Dinner', 'Staff Food', 'Guest Food'].includes(cat)) {
        foodAndTeaExpenses += amt;
      } else if (['Conveyance', 'Petrol/Fuel', 'Delivery', 'Vehicle Transport', 'Other Travel'].includes(cat)) {
        conveyanceExpenses += amt;
      } else if (['Cleaning', 'Water', 'Tools', 'Small Repairs', 'Maintenance', 'Stationery', 'Shop Supplies', 'Miscellaneous'].includes(cat)) {
        workshopSuppliesExpenses += amt;
      } else if (cat === 'Rent') {
        rentExpenses += amt;
      } else if (cat === 'Electricity') {
        electricityExpenses += amt;
      } else if (cat === 'License & Legal') {
        licenseExpenses += amt;
      } else {
        otherFixedExpenses += amt;
      }
    });

    const dailyExpensesTotal = foodAndTeaExpenses + conveyanceExpenses + workshopSuppliesExpenses;
    const fixedExpensesTotal = rentExpenses + electricityExpenses + licenseExpenses + otherFixedExpenses;
    const totalOperatingExpenses = dailyExpensesTotal + fixedExpensesTotal;

    // 4. Profit & Investment Metrics
    const grossProfit = (partsRevenue - partsCost) + (labourRevenue - labourCost) + (servicesRevenue - servicesCost) - discount;
    const totalInvestment = cogs + totalOperatingExpenses;
    const netProfit = grossProfit - totalOperatingExpenses;
    const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const roiPercent = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    return {
      key: b.key,
      label: b.label,
      startDate: b.startDate,
      endDate: b.endDate,
      invoiceCount: b.invoices.length,
      revenue,
      partsRevenue,
      labourRevenue,
      servicesRevenue,
      discount,
      partsCost,
      labourCost,
      servicesCost,
      cogs,
      stockPurchasedCost,
      foodAndTeaExpenses,
      conveyanceExpenses,
      workshopSuppliesExpenses,
      rentExpenses,
      electricityExpenses,
      licenseExpenses,
      otherFixedExpenses,
      dailyExpensesTotal,
      fixedExpensesTotal,
      totalOperatingExpenses,
      grossProfit,
      totalInvestment,
      netProfit,
      marginPercent,
      roiPercent
    };
  });
}
