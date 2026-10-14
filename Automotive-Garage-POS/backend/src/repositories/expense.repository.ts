import prisma from '../database/prisma';

export const expenseRepository = {
  // --- Standard / Daily / Workshop Expenses ---
  findAll: async (filters?: {
    month?: string; // YYYY-MM
    category?: string;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    const where: any = {};

    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }
    if (filters?.type && filters.type !== 'all') {
      where.type = filters.type;
    }
    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }

    return prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });
  },

  findById: async (id: string) => {
    return prisma.expense.findUnique({ where: { id } });
  },

  create: async (data: {
    title: string;
    category: string;
    type?: string;
    amount: number;
    date?: Date;
    paymentMethod?: string;
    status?: string;
    paidBy?: string;
    recipient?: string;
    receiptNumber?: string;
    notes?: string;
    attachment?: string;
    linkedEntityId?: string;
    linkedEntityType?: string;
  }) => {
    return prisma.expense.create({
      data: {
        title: data.title,
        category: data.category,
        type: data.type || 'daily',
        amount: data.amount,
        date: data.date || new Date(),
        paymentMethod: data.paymentMethod || 'Cash',
        status: data.status || 'Paid',
        paidBy: data.paidBy || 'Owner',
        recipient: data.recipient,
        receiptNumber: data.receiptNumber,
        notes: data.notes,
        attachment: data.attachment,
        linkedEntityId: data.linkedEntityId,
        linkedEntityType: data.linkedEntityType
      }
    });
  },

  update: async (id: string, data: any) => {
    return prisma.expense.update({
      where: { id },
      data
    });
  },

  voidExpense: async (id: string, voidReason: string) => {
    return prisma.expense.update({
      where: { id },
      data: {
        status: 'Void',
        voidReason
      }
    });
  },

  delete: async (id: string) => {
    return prisma.expense.delete({ where: { id } });
  },

  // --- Dedicated Workshop Rent Sub-Module ---
  findAllRents: async () => {
    return prisma.workshopRent.findMany({
      orderBy: { month: 'desc' }
    });
  },

  findRentById: async (id: string) => {
    return prisma.workshopRent.findUnique({ where: { id } });
  },

  findRentByMonth: async (month: string) => {
    return prisma.workshopRent.findFirst({ where: { month } });
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
    return prisma.workshopRent.create({
      data: {
        month: data.month,
        monthLabel: data.monthLabel,
        amount: data.amount,
        paidAmount: data.paidAmount ?? 0,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        status: data.status || 'Pending',
        notes: data.notes,
        attachment: data.attachment
      }
    });
  },

  updateRent: async (id: string, data: any) => {
    return prisma.workshopRent.update({
      where: { id },
      data
    });
  },

  deleteRent: async (id: string) => {
    return prisma.workshopRent.delete({ where: { id } });
  },

  // --- Dedicated Electricity Bills Sub-Module ---
  findAllElectricityBills: async () => {
    return prisma.electricityBill.findMany({
      orderBy: { billingMonth: 'desc' }
    });
  },

  findElectricityBillById: async (id: string) => {
    return prisma.electricityBill.findUnique({ where: { id } });
  },

  createElectricityBill: async (data: {
    billingMonth: string;
    monthLabel: string;
    billNumber?: string;
    previousReading?: number;
    currentReading?: number;
    unitsConsumed: number;
    billAmount: number;
    paidAmount?: number;
    issueDate?: Date;
    dueDate: Date;
    paymentDate?: Date;
    paymentMethod?: string;
    status?: string;
    notes?: string;
    attachment?: string;
  }) => {
    return prisma.electricityBill.create({
      data: {
        billingMonth: data.billingMonth,
        monthLabel: data.monthLabel,
        billNumber: data.billNumber,
        previousReading: data.previousReading,
        currentReading: data.currentReading,
        unitsConsumed: data.unitsConsumed,
        billAmount: data.billAmount,
        paidAmount: data.paidAmount ?? 0,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        status: data.status || 'Unpaid',
        notes: data.notes,
        attachment: data.attachment
      }
    });
  },

  updateElectricityBill: async (id: string, data: any) => {
    return prisma.electricityBill.update({
      where: { id },
      data
    });
  },

  deleteElectricityBill: async (id: string) => {
    return prisma.electricityBill.delete({ where: { id } });
  },

  // --- Dedicated Licenses & Permits Sub-Module ---
  findAllLicenses: async () => {
    return prisma.licenseRecord.findMany({
      orderBy: { expiryDate: 'asc' }
    });
  },

  findLicenseById: async (id: string) => {
    return prisma.licenseRecord.findUnique({ where: { id } });
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
    return prisma.licenseRecord.create({
      data: {
        name: data.name,
        licenseNumber: data.licenseNumber,
        issuingAuthority: data.issuingAuthority,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        renewalCost: data.renewalCost,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        status: data.status || 'Active',
        notes: data.notes,
        attachment: data.attachment
      }
    });
  },

  updateLicense: async (id: string, data: any) => {
    return prisma.licenseRecord.update({
      where: { id },
      data
    });
  },

  deleteLicense: async (id: string) => {
    return prisma.licenseRecord.delete({ where: { id } });
  }
};
