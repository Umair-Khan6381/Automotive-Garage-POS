import {
  ShopExpense,
  WorkshopRent,
  LicenseRecord,
  ElectricityBill,
  PaymentMethod
} from '../types';

export interface UnifiedExpenseItem {
  id: string;
  sourceType: 'daily' | 'rent' | 'electricity' | 'license';
  sourceId: string;
  title: string;
  category: string;
  typeGroup: 'DAILY' | 'FIXED' | 'LEGAL' | 'WORKSHOP';
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  date: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue' | 'Void' | 'Cancelled' | 'Unpaid';
  paidBy?: string;
  notes?: string;
  attachment?: string;
  metadata?: Record<string, any>;
}

export interface MonthlyExpenseAggregate {
  monthKey: string; // e.g. "2026-09"
  monthLabel: string; // e.g. "September 2026"
  dailyExpenses: number;
  rent: number;
  electricity: number;
  licenseLegal: number;
  otherFixed: number;
  workshopSupplies: number;
  foodAndTea: number;
  conveyance: number;
  totalExpenses: number; // Sum of all PAID expenses contributing to P&L
  pendingExpenses: number;
  overdueBills: number;
  fixedMonthlyCost: number; // Rent + Electricity + Licenses + Recurring Fixed
  operatingExpenses: number; // All paid business expenses
}

/**
 * Builds the canonical list of all paid and pending expenses by unifying:
 * 1. General/Daily/Workshop ShopExpenses
 * 2. Dedicated WorkshopRent records (source of truth)
 * 3. Dedicated ElectricityBill records (source of truth)
 * 4. Dedicated LicenseRecord fees (source of truth)
 *
 * CRITICAL ACCOUNTING RULE:
 * Never duplicate records. If a ShopExpense was auto-linked to rent/electricity/license,
 * it is filtered out so the dedicated module remains the single source of truth.
 */
export const getUnifiedExpensesList = (
  expenses: ShopExpense[],
  rents: WorkshopRent[],
  electricityBills: ElectricityBill[],
  licenses: LicenseRecord[]
): UnifiedExpenseItem[] => {
  const unified: UnifiedExpenseItem[] = [];

  // 1. Direct Shop Expenses (excluding any that are linked to dedicated tables to prevent double counting)
  expenses.forEach(exp => {
    if (exp.linkedEntityId) {
      // Skip because the linked table is the canonical source
      return;
    }

    // Determine high-level group
    let typeGroup: UnifiedExpenseItem['typeGroup'] = 'DAILY';
    if (exp.type === 'fixed' || exp.category === 'Rent' || exp.category === 'Electricity' || exp.category === 'Internet' || exp.category === 'Security' || exp.category === 'Other Fixed') {
      typeGroup = 'FIXED';
    } else if (exp.type === 'legal' || exp.category === 'License & Legal') {
      typeGroup = 'LEGAL';
    } else if (exp.type === 'workshop' || exp.category === 'Cleaning' || exp.category === 'Tools' || exp.category === 'Maintenance' || exp.category === 'Shop Supplies') {
      typeGroup = 'WORKSHOP';
    }

    const isPaid = exp.status === 'Paid';
    const paidAmt = isPaid ? exp.amount : exp.status === 'Partially Paid' ? exp.amount * 0.5 : 0;
    const pendingAmt = exp.amount - paidAmt;

    const dateStr = exp.date ? exp.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const monthKey = dateStr.slice(0, 7);

    unified.push({
      id: `exp-${exp.id}`,
      sourceType: 'daily',
      sourceId: exp.id,
      title: exp.title,
      category: exp.category,
      typeGroup,
      amount: exp.amount,
      paidAmount: paidAmt,
      pendingAmount: pendingAmt,
      date: dateStr,
      monthKey,
      paymentMethod: exp.paymentMethod,
      paymentStatus: exp.status,
      paidBy: exp.paidBy,
      notes: exp.notes,
      attachment: exp.attachment
    });
  });

  // 2. Dedicated Workshop Rents
  rents.forEach(r => {
    const isPaid = r.status === 'Paid';
    const isPartial = r.status === 'Partially Paid';
    const paidAmt = isPaid ? r.amount : isPartial ? (r.paidAmount || 0) : 0;
    const pendingAmt = Math.max(0, r.amount - paidAmt);
    const dateStr = r.paymentDate || `${r.month}-05`;

    unified.push({
      id: `rent-${r.id}`,
      sourceType: 'rent',
      sourceId: r.id,
      title: `Workshop Premises Rent (${r.monthLabel || r.month})`,
      category: 'Rent',
      typeGroup: 'FIXED',
      amount: r.amount,
      paidAmount: paidAmt,
      pendingAmount: pendingAmt,
      date: dateStr,
      monthKey: r.month,
      paymentMethod: r.paymentMethod || 'Bank Transfer',
      paymentStatus: r.status,
      paidBy: 'Workshop Owner',
      notes: r.notes,
      attachment: r.attachment,
      metadata: { rentRecord: r }
    });
  });

  // 3. Dedicated Electricity Bills
  electricityBills.forEach(b => {
    const isPaid = b.status === 'Paid';
    const isPartial = b.status === 'Partially Paid';
    const paidAmt = isPaid ? b.billAmount : isPartial ? (b.paidAmount || 0) : 0;
    const pendingAmt = Math.max(0, b.billAmount - paidAmt);

    // If unpaid and past due date, status is Overdue
    let computedStatus: UnifiedExpenseItem['paymentStatus'] = b.status;
    if (b.status === 'Unpaid') {
      const due = new Date(b.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today) {
        computedStatus = 'Overdue';
      }
    }

    const dateStr = b.paymentDate || b.issueDate || `${b.billingMonth}-10`;

    unified.push({
      id: `elec-${b.id}`,
      sourceType: 'electricity',
      sourceId: b.id,
      title: `Electricity Bill (${b.monthLabel || b.billingMonth}) — ${b.unitsConsumed} Units Consumed`,
      category: 'Electricity',
      typeGroup: 'FIXED',
      amount: b.billAmount,
      paidAmount: paidAmt,
      pendingAmount: pendingAmt,
      date: dateStr,
      monthKey: b.billingMonth,
      paymentMethod: b.paymentMethod || 'Bank Transfer',
      paymentStatus: computedStatus,
      paidBy: 'Workshop Account',
      notes: b.notes,
      attachment: b.attachment,
      metadata: { electricityRecord: b }
    });
  });

  // 4. Dedicated Licenses & Regulatory Fees
  licenses.forEach(l => {
    const isPaid = !!l.paymentDate;
    const paidAmt = isPaid ? l.renewalCost : 0;
    const pendingAmt = isPaid ? 0 : l.renewalCost;
    const dateStr = l.paymentDate || l.issueDate || new Date().toISOString().slice(0, 10);
    const monthKey = dateStr.slice(0, 7);

    unified.push({
      id: `lic-${l.id}`,
      sourceType: 'license',
      sourceId: l.id,
      title: `${l.name} (${l.licenseNumber})`,
      category: 'License & Legal',
      typeGroup: 'LEGAL',
      amount: l.renewalCost,
      paidAmount: paidAmt,
      pendingAmount: pendingAmt,
      date: dateStr,
      monthKey,
      paymentMethod: l.paymentMethod || 'Bank Transfer',
      paymentStatus: isPaid ? 'Paid' : 'Pending',
      paidBy: 'Workshop Owner',
      notes: l.notes,
      attachment: l.attachment,
      metadata: { licenseRecord: l }
    });
  });

  // Sort descending by date
  return unified.sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Calculates monthly expense aggregates exactly matching the prompt's specifications:
 * - Daily Expenses (Breakfast, Tea, Food, Conveyance, Misc)
 * - Rent (From Workshop Rent module)
 * - Electricity (From Electricity Bills module)
 * - License/Legal (From License & Legal Fees module)
 * - Other Fixed (Internet, Security, Water, Software)
 * - Total Expenses (Actual paid cash outflow for the month)
 */
export const calculateMonthlyExpenseSummary = (
  monthKey: string,
  unifiedList: UnifiedExpenseItem[]
): MonthlyExpenseAggregate => {
  const [yearStr, monthStr] = monthKey.split('-');
  const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let dailyExpenses = 0;
  let rent = 0;
  let electricity = 0;
  let licenseLegal = 0;
  let otherFixed = 0;
  let workshopSupplies = 0;
  let foodAndTea = 0;
  let conveyance = 0;
  let totalExpenses = 0;
  let pendingExpenses = 0;
  let overdueBills = 0;
  let fixedMonthlyCost = 0;

  unifiedList.forEach(item => {
    if (item.monthKey !== monthKey) return;

    // Only count non-void expenses
    if (item.paymentStatus === 'Void' || item.paymentStatus === 'Cancelled') return;

    const paidAmt = item.paidAmount;
    const isPaid = item.paymentStatus === 'Paid';

    if (item.paymentStatus === 'Pending' || item.paymentStatus === 'Unpaid') {
      pendingExpenses += item.pendingAmount;
    }
    if (item.paymentStatus === 'Overdue') {
      overdueBills += item.amount;
      pendingExpenses += item.amount;
    }

    // Only paid amount impacts actual operating expenses & P&L
    totalExpenses += paidAmt;

    // Categorize
    if (item.category === 'Rent') {
      rent += paidAmt;
      fixedMonthlyCost += item.amount;
    } else if (item.category === 'Electricity') {
      electricity += paidAmt;
      fixedMonthlyCost += item.amount;
    } else if (item.category === 'License & Legal') {
      licenseLegal += paidAmt;
      fixedMonthlyCost += item.amount;
    } else if (
      item.category === 'Internet' ||
      item.category === 'Security' ||
      item.category === 'Software Subscription' ||
      item.category === 'Telephone' ||
      item.category === 'Insurance' ||
      item.category === 'Other Fixed' ||
      (item.category === 'Water' && item.typeGroup === 'FIXED')
    ) {
      otherFixed += paidAmt;
      fixedMonthlyCost += item.amount;
    } else if (
      item.category === 'Breakfast' ||
      item.category === 'Tea' ||
      item.category === 'Lunch' ||
      item.category === 'Dinner' ||
      item.category === 'Staff Food' ||
      item.category === 'Guest Food'
    ) {
      dailyExpenses += paidAmt;
      foodAndTea += paidAmt;
    } else if (
      item.category === 'Conveyance' ||
      item.category === 'Petrol/Fuel' ||
      item.category === 'Delivery' ||
      item.category === 'Vehicle Transport' ||
      item.category === 'Other Travel'
    ) {
      dailyExpenses += paidAmt;
      conveyance += paidAmt;
    } else if (item.typeGroup === 'WORKSHOP') {
      workshopSupplies += paidAmt;
      dailyExpenses += paidAmt;
    } else {
      dailyExpenses += paidAmt;
    }
  });

  return {
    monthKey,
    monthLabel,
    dailyExpenses,
    rent,
    electricity,
    licenseLegal,
    otherFixed,
    workshopSupplies,
    foodAndTea,
    conveyance,
    totalExpenses,
    pendingExpenses,
    overdueBills,
    fixedMonthlyCost,
    operatingExpenses: totalExpenses
  };
};

/**
 * Calculates dashboard high-level expense metrics
 */
export const calculateDashboardExpenseSummary = (
  unifiedList: UnifiedExpenseItem[]
) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthKey = todayStr.slice(0, 7);

  let todayExpenses = 0;
  let thisMonthExpenses = 0;
  let pendingExpenses = 0;
  let overdueBills = 0;
  let thisMonthFixed = 0;

  unifiedList.forEach(item => {
    if (item.paymentStatus === 'Void' || item.paymentStatus === 'Cancelled') return;

    if (item.date === todayStr && item.paymentStatus === 'Paid') {
      todayExpenses += item.paidAmount;
    }

    if (item.monthKey === currentMonthKey) {
      thisMonthExpenses += item.paidAmount;

      if (item.typeGroup === 'FIXED' || item.typeGroup === 'LEGAL') {
        thisMonthFixed += item.amount;
      }
    }

    if (item.paymentStatus === 'Pending' || item.paymentStatus === 'Unpaid') {
      pendingExpenses += item.pendingAmount;
    }

    if (item.paymentStatus === 'Overdue') {
      overdueBills += item.amount;
    }
  });

  return {
    todayExpenses,
    thisMonthExpenses,
    pendingExpenses,
    overdueBills,
    fixedMonthlyCost: thisMonthFixed
  };
};
