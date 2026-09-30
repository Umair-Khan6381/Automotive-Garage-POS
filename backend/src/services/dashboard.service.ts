import prisma from '../database/prisma';
import { profitService } from './profit.service';

export const dashboardService = {
  getStatistics: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const currentMonthKey = new Date().toISOString().slice(0, 7);

    // 1. Repair Jobs
    const activeJobsCount = await prisma.repairJob.count({
      where: {
        status: { in: ['draft', 'waiting', 'in_progress'] }
      }
    });

    const totalJobsCount = await prisma.repairJob.count();

    // 2. Inventory Alert
    const lowStockCount = await prisma.product.count({
      where: {
        currentQuantity: { lte: 5 }
      }
    });

    // 3. Receivables
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        paymentStatus: { in: ['unpaid', 'partial', 'Partially Paid', 'Unpaid'] }
      },
      select: {
        balanceDue: true
      }
    });

    const pendingReceivables = unpaidInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

    // 4. Overdue Services
    const overdueOilCount = await prisma.oilChange.count({
      where: {
        OR: [
          { status: 'overdue' },
          { nextRecommendedDate: { lt: new Date() } }
        ]
      }
    });

    // 5. Daily & Fixed Operating Expenses (Requirement 22)
    // Today's paid expenses
    const todayExpensesRecords = await prisma.expense.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        status: 'Paid',
        linkedEntityId: null
      }
    });
    const todayExpenses = todayExpensesRecords.reduce((sum, e) => sum + e.amount, 0);

    // This month's direct expenses
    const monthExpensesRecords = await prisma.expense.findMany({
      where: {
        date: { gte: new Date(`${currentMonthKey}-01T00:00:00.000Z`) },
        status: 'Paid',
        linkedEntityId: null
      }
    });

    // Fixed Overheads this month
    const thisMonthRent = await prisma.workshopRent.findFirst({
      where: { month: currentMonthKey }
    });

    const thisMonthElectricity = await prisma.electricityBill.findFirst({
      where: { billingMonth: currentMonthKey }
    });

    const rentPaid = thisMonthRent ? thisMonthRent.paidAmount : 0;
    const electricityPaid = thisMonthElectricity ? thisMonthElectricity.paidAmount : 0;
    const thisMonthExpenses = monthExpensesRecords.reduce((sum, e) => sum + e.amount, 0) + rentPaid + electricityPaid;

    // Fixed monthly cost baseline
    const fixedMonthlyCost = (thisMonthRent ? thisMonthRent.amount : 80000) + (thisMonthElectricity ? thisMonthElectricity.billAmount : 38500);

    // Pending Liabilities
    const pendingDirectExpenses = await prisma.expense.findMany({
      where: { status: 'Pending' }
    });
    let pendingLiabilities = pendingDirectExpenses.reduce((sum, e) => sum + e.amount, 0);
    if (thisMonthRent && thisMonthRent.status !== 'Paid') {
      pendingLiabilities += Math.max(0, thisMonthRent.amount - thisMonthRent.paidAmount);
    }
    if (thisMonthElectricity && thisMonthElectricity.status !== 'Paid') {
      pendingLiabilities += Math.max(0, thisMonthElectricity.billAmount - thisMonthElectricity.paidAmount);
    }

    // Overdue Bills
    let overdueBills = 0;
    if (thisMonthElectricity && thisMonthElectricity.status !== 'Paid' && thisMonthElectricity.dueDate < new Date()) {
      overdueBills += Math.max(0, thisMonthElectricity.billAmount - thisMonthElectricity.paidAmount);
    }

    // 6. Comprehensive Profit Calculations
    const profitSummary = await profitService.calculateGrandAndMonthlyProfit();

    return {
      activeJobsCount,
      totalJobsCount,
      lowStockCount,
      pendingReceivables,
      unpaidInvoicesCount: unpaidInvoices.length,
      overdueOilCount,
      todayExpenses,
      thisMonthExpenses,
      pendingLiabilities,
      overdueBills,
      fixedMonthlyCost,
      grandNetProfit: profitSummary.grandNetProfit,
      grandRevenue: profitSummary.totalRevenue,
      grossProfit: profitSummary.grossProfit,
      monthlyBreakdown: profitSummary.monthlyBreakdown
    };
  }
};
