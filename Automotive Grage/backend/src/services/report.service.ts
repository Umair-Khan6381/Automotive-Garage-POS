import prisma from '../database/prisma';
import { profitService } from './profit.service';
import { expenseService } from './expense.service';

export const reportService = {
  getProfitAndLoss: async (periodType: 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
    return profitService.calculateGrandAndMonthlyProfit(periodType);
  },

  getSalesSummary: async (startDate?: Date, endDate?: Date) => {
    const where: any = {};
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        items: true,
        payments: true
      },
      orderBy: { date: 'desc' }
    });

    const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    return {
      invoiceCount: invoices.length,
      totalSales,
      totalCollected,
      totalOutstanding,
      invoices
    };
  },

  getInventoryValuation: async () => {
    const products = await prisma.product.findMany({
      include: { category: true, supplier: true }
    });

    const totalProducts = products.length;
    let totalStockUnits = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;
    const lowStockItems: typeof products = [];

    products.forEach(p => {
      totalStockUnits += p.currentQuantity;
      totalCostValue += p.currentQuantity * p.purchasePrice;
      totalRetailValue += p.currentQuantity * p.sellingPrice;
      if (p.currentQuantity <= p.minStockLevel) {
        lowStockItems.push(p);
      }
    });

    return {
      totalProducts,
      totalStockUnits,
      totalCostValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalCostValue,
      lowStockCount: lowStockItems.length,
      lowStockItems
    };
  },

  getLabourPayrollSummary: async () => {
    const workers = await prisma.labourWorker.findMany({
      include: {
        payments: { orderBy: { date: 'desc' } },
        assignments: true
      }
    });

    const allPayments = await prisma.labourPayment.findMany({
      include: { worker: true },
      orderBy: { date: 'desc' }
    });

    const totalDisbursed = allPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      workerCount: workers.length,
      totalDisbursed,
      workers,
      recentPayments: allPayments.slice(0, 20)
    };
  },

  getExpenseReport: async (monthKey?: string) => {
    const targetMonth = monthKey || new Date().toISOString().slice(0, 7);
    return expenseService.getMonthlySummary(targetMonth);
  }
};
