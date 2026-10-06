import prisma from '../database/prisma';
import { expenseRepository } from '../repositories/expense.repository';
import { MonthlyExpenseSummaryDTO } from '../types';

export const expenseService = {
  // 1. Get All Unified Expenses
  getUnifiedExpenses: async (filters?: {
    month?: string;
    category?: string;
    type?: string;
    status?: string;
  }) => {
    const expenses = await expenseRepository.findAll(filters);
    const rents = await expenseRepository.findAllRents();
    const electricityBills = await expenseRepository.findAllElectricityBills();
    const licenses = await expenseRepository.findAllLicenses();

    return {
      expenses,
      rents,
      electricityBills,
      licenses
    };
  },

  // 2. Daily Operational Expense Operations
  createDailyExpense: async (data: {
    title: string;
    category: string;
    amount: number;
    date?: Date;
    paymentMethod?: string;
    status?: string;
    paidBy?: string;
    notes?: string;
    attachment?: string;
  }) => {
    // Auto categorize group
    let type = 'daily';
    const cat = data.category;
    if (['Rent', 'Electricity', 'Internet', 'Security', 'Software Subscription', 'Telephone', 'Insurance', 'Other Fixed'].includes(cat)) {
      type = 'fixed';
    } else if (cat === 'License & Legal') {
      type = 'legal';
    } else if (['Cleaning', 'Water', 'Tools', 'Small Repairs', 'Maintenance', 'Shop Supplies'].includes(cat)) {
      type = 'workshop';
    }

    return expenseRepository.create({
      ...data,
      type
    });
  },

  updateDailyExpense: async (id: string, data: any) => {
    return expenseRepository.update(id, data);
  },

  voidExpense: async (id: string, reason: string) => {
    return expenseRepository.voidExpense(id, reason);
  },

  deleteExpense: async (id: string) => {
    return expenseRepository.delete(id);
  },

  // 3. Workshop Rent
  getAllRents: async () => {
    return expenseRepository.findAllRents();
  },

  createRent: async (data: {
    month: string;
    monthLabel: string;
    amount: number;
    paidAmount?: number;
    paymentDate?: Date;
    paymentMethod?: string;
    status?: string;
    notes?: string;
    attachment?: string;
  }) => {
    return expenseRepository.createRent(data);
  },

  recordRentPayment: async (
    id: string,
    paidAmount: number,
    paymentMethod: string,
    paymentDate: Date = new Date()
  ) => {
    const rent = await expenseRepository.findRentById(id);
    if (!rent) throw new Error('Rent record not found');

    const totalPaid = (rent.paidAmount || 0) + paidAmount;
    const status = totalPaid >= rent.amount ? 'Paid' : 'Partially Paid';

    return expenseRepository.updateRent(id, {
      paidAmount: totalPaid,
      status,
      paymentMethod,
      paymentDate
    });
  },

  // 4. Electricity Bills
  getAllElectricityBills: async () => {
    return expenseRepository.findAllElectricityBills();
  },

  createElectricityBill: async (data: {
    billingMonth: string;
    monthLabel: string;
    billNumber?: string;
    previousReading?: number;
    currentReading?: number;
    unitsConsumed: number;
    billAmount: number;
    dueDate: Date;
    paymentDate?: Date;
    paymentMethod?: string;
    status?: string;
    notes?: string;
    attachment?: string;
  }) => {
    return expenseRepository.createElectricityBill(data);
  },

  recordElectricityPayment: async (
    id: string,
    paidAmount: number,
    paymentMethod: string,
    paymentDate: Date = new Date()
  ) => {
    const bill = await expenseRepository.findElectricityBillById(id);
    if (!bill) throw new Error('Electricity bill not found');

    const totalPaid = (bill.paidAmount || 0) + paidAmount;
    const status = totalPaid >= bill.billAmount ? 'Paid' : 'Partially Paid';

    return expenseRepository.updateElectricityBill(id, {
      paidAmount: totalPaid,
      status,
      paymentMethod,
      paymentDate
    });
  },

  // 5. Licenses & Legal Fees
  getAllLicenses: async () => {
    return expenseRepository.findAllLicenses();
  },

  createLicense: async (data: {
    name: string;
    licenseNumber: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate: Date;
    renewalCost: number;
    paymentDate?: Date;
    paymentMethod?: string;
    status?: string;
    notes?: string;
    attachment?: string;
  }) => {
    return expenseRepository.createLicense(data);
  },

  recordLicenseRenewal: async (
    id: string,
    renewalCost: number,
    newExpiryDate: Date,
    paymentMethod: string,
    paymentDate: Date = new Date()
  ) => {
    return expenseRepository.updateLicense(id, {
      renewalCost,
      expiryDate: newExpiryDate,
      paymentDate,
      paymentMethod,
      status: 'Active'
    });
  },

  // 6. Monthly Expense Aggregation (No double-counting)
  getMonthlySummary: async (monthKey: string): Promise<MonthlyExpenseSummaryDTO> => {
    const directExpenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: new Date(`${monthKey}-01T00:00:00.000Z`),
          lt: new Date(new Date(`${monthKey}-01`).setMonth(new Date(`${monthKey}-01`).getMonth() + 1))
        },
        linkedEntityId: null
      }
    });

    const rents = await prisma.workshopRent.findMany({
      where: { month: monthKey }
    });

    const electricity = await prisma.electricityBill.findMany({
      where: { billingMonth: monthKey }
    });

    const licenses = await prisma.licenseRecord.findMany();

    let dailyExpenses = 0;
    let rentPaid = 0;
    let electricityPaid = 0;
    let licensesPaid = 0;
    let otherFixed = 0;
    let foodAndTea = 0;
    let conveyance = 0;
    let workshopSupplies = 0;
    let pendingLiabilities = 0;
    let overdueBills = 0;
    let fixedMonthlyOverhead = 0;

    // Process direct expenses
    directExpenses.forEach(e => {
      if (e.status === 'Void') return;

      const isPaid = e.status === 'Paid';
      if (isPaid) {
        if (['Breakfast', 'Tea', 'Lunch', 'Dinner', 'Staff Food', 'Guest Food'].includes(e.category)) {
          foodAndTea += e.amount;
          dailyExpenses += e.amount;
        } else if (['Conveyance', 'Petrol/Fuel', 'Delivery', 'Vehicle Transport', 'Other Travel'].includes(e.category)) {
          conveyance += e.amount;
          dailyExpenses += e.amount;
        } else if (['Cleaning', 'Water', 'Tools', 'Small Repairs', 'Maintenance', 'Shop Supplies', 'Stationery', 'Miscellaneous'].includes(e.category)) {
          workshopSupplies += e.amount;
          dailyExpenses += e.amount;
        } else if (['Internet', 'Security', 'Software Subscription', 'Telephone', 'Insurance', 'Other Fixed'].includes(e.category)) {
          otherFixed += e.amount;
          fixedMonthlyOverhead += e.amount;
        } else {
          dailyExpenses += e.amount;
        }
      } else {
        pendingLiabilities += e.amount;
      }
    });

    // Process dedicated rent
    rents.forEach(r => {
      fixedMonthlyOverhead += r.amount;
      rentPaid += r.paidAmount;
      if (r.status !== 'Paid') {
        pendingLiabilities += Math.max(0, r.amount - r.paidAmount);
      }
    });

    // Process dedicated electricity
    const now = new Date();
    electricity.forEach(b => {
      fixedMonthlyOverhead += b.billAmount;
      electricityPaid += b.paidAmount;
      if (b.status !== 'Paid') {
        const remaining = Math.max(0, b.billAmount - b.paidAmount);
        pendingLiabilities += remaining;
        if (b.dueDate < now) {
          overdueBills += remaining;
        }
      }
    });

    // Process licenses
    licenses.forEach(l => {
      if (l.paymentDate && l.paymentDate.toISOString().startsWith(monthKey)) {
        licensesPaid += l.renewalCost;
        fixedMonthlyOverhead += l.renewalCost;
      }
    });

    const totalPaidExpenses = dailyExpenses + rentPaid + electricityPaid + licensesPaid + otherFixed;

    const [year, month] = monthKey.split('-');
    const labelDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const monthLabel = labelDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      monthKey,
      monthLabel,
      dailyExpenses,
      rent: rentPaid,
      electricity: electricityPaid,
      licenses: licensesPaid,
      otherFixed,
      foodAndTea,
      conveyance,
      workshopSupplies,
      totalPaidExpenses,
      pendingLiabilities,
      overdueBills,
      fixedMonthlyOverhead
    };
  }
};
