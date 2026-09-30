import prisma from '../database/prisma';
import { GrandProfitDTO, ProfitBreakdownDTO } from '../types';

export const profitService = {
  calculateGrandAndMonthlyProfit: async (): Promise<GrandProfitDTO> => {
    // 1. Fetch all invoices
    const invoices = await prisma.invoice.findMany({
      include: {
        items: true
      },
      orderBy: { date: 'desc' }
    });

    // 2. Fetch all expenses, rents, electricity bills, and licenses
    const directExpenses = await prisma.expense.findMany({
      where: {
        status: 'Paid',
        linkedEntityId: null
      },
      orderBy: { date: 'desc' }
    });

    const rents = await prisma.workshopRent.findMany({
      where: {
        status: { in: ['Paid', 'Partially Paid'] }
      }
    });

    const electricityBills = await prisma.electricityBill.findMany({
      where: {
        status: { in: ['Paid', 'Partially Paid'] }
      }
    });

    const licenses = await prisma.licenseRecord.findMany({
      where: {
        paymentDate: { not: null }
      }
    });

    // Unified list of paid expense outflows
    interface PaidOutflow {
      monthKey: string;
      amount: number;
    }

    const outflows: PaidOutflow[] = [];

    directExpenses.forEach(exp => {
      outflows.push({
        monthKey: exp.date.toISOString().slice(0, 7),
        amount: exp.amount
      });
    });

    rents.forEach(r => {
      const monthKey = r.paymentDate ? r.paymentDate.toISOString().slice(0, 7) : r.month;
      outflows.push({
        monthKey,
        amount: r.paidAmount > 0 ? r.paidAmount : r.amount
      });
    });

    electricityBills.forEach(b => {
      const monthKey = b.paymentDate ? b.paymentDate.toISOString().slice(0, 7) : b.billingMonth;
      outflows.push({
        monthKey,
        amount: b.paidAmount > 0 ? b.paidAmount : b.billAmount
      });
    });

    licenses.forEach(l => {
      if (l.paymentDate) {
        outflows.push({
          monthKey: l.paymentDate.toISOString().slice(0, 7),
          amount: l.renewalCost
        });
      }
    });

    const monthKeySet = new Set<string>();

    invoices.forEach(inv => {
      monthKeySet.add(inv.date.toISOString().slice(0, 7));
    });

    outflows.forEach(outflow => {
      monthKeySet.add(outflow.monthKey);
    });

    if (monthKeySet.size === 0) {
      monthKeySet.add(new Date().toISOString().slice(0, 7));
    }

    const sortedMonthKeys = Array.from(monthKeySet).sort((a, b) => b.localeCompare(a));

    const monthlyBreakdown: ProfitBreakdownDTO[] = sortedMonthKeys.map(key => {
      const monthInvoices = invoices.filter(i => i.date.toISOString().startsWith(key));
      const monthOutflows = outflows.filter(o => o.monthKey === key);

      let partsRevenue = 0;
      let partsCost = 0;
      let labourRevenue = 0;
      let labourCost = 0;
      let servicesRevenue = 0;
      let servicesCost = 0;
      let discount = 0;
      let revenue = 0;

      monthInvoices.forEach(inv => {
        partsRevenue += inv.partsTotal;
        partsCost += inv.partsCost;
        labourRevenue += inv.labourTotal;
        labourCost += inv.labourCost;
        servicesRevenue += inv.servicesTotal;
        servicesCost += inv.servicesCost;
        discount += inv.discount;
        revenue += inv.grandTotal;
      });

      const cogs = partsCost + labourCost + servicesCost;
      const grossProfit = (partsRevenue - partsCost) + (labourRevenue - labourCost) + (servicesRevenue - servicesCost) - discount;
      const expenseAmount = monthOutflows.reduce((sum, o) => sum + o.amount, 0);
      const netProfit = grossProfit - expenseAmount;
      const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      const [year, month] = key.split('-');
      const labelDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const label = labelDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      return {
        monthKey: key,
        label,
        invoiceCount: monthInvoices.length,
        revenue,
        partsRevenue,
        partsCost,
        labourRevenue,
        labourCost,
        servicesRevenue,
        servicesCost,
        cogs,
        grossProfit,
        expenses: expenseAmount,
        netProfit,
        marginPercent
      };
    });

    // Grand Totals across all months
    const totalInvoices = invoices.length;
    let grandRevenue = 0;
    let grandPartsCost = 0;
    let grandLabourCost = 0;
    let grandServicesCost = 0;
    let grandGrossProfit = 0;

    monthlyBreakdown.forEach(m => {
      grandRevenue += m.revenue;
      grandPartsCost += m.partsCost;
      grandLabourCost += m.labourCost;
      grandServicesCost += m.servicesCost;
      grandGrossProfit += m.grossProfit;
    });

    const totalCOGS = grandPartsCost + grandLabourCost + grandServicesCost;
    const totalExpenses = outflows.reduce((sum, o) => sum + o.amount, 0);
    const grandNetProfit = grandGrossProfit - totalExpenses;
    const grandMargin = grandRevenue > 0 ? (grandNetProfit / grandRevenue) * 100 : 0;

    return {
      totalInvoices,
      totalRevenue: grandRevenue,
      totalCOGS,
      grossProfit: grandGrossProfit,
      totalExpenses,
      grandNetProfit,
      grandMargin,
      monthlyBreakdown
    };
  }
};
