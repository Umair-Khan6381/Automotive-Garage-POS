import prisma from '../database/prisma';
import { GrandProfitDTO, ProfitBreakdownDTO, PeriodProfitDTO } from '../types';

// Helper to compute ISO week
function getISOWeekDetails(dateInput: Date): { weekKey: string; label: string; startDate: string; endDate: string } {
  const d = new Date(dateInput);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

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
  const formatShort = (dt: Date) => dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return {
    weekKey: `${year}-W${String(weekNum).padStart(2, '0')}`,
    label: `Week ${weekNum} (${formatShort(monday)} - ${formatShort(sunday)}, ${year})`,
    startDate: startDateStr,
    endDate: endDateStr
  };
}

export const profitService = {
  calculateGrandAndMonthlyProfit: async (periodType: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<GrandProfitDTO> => {
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

    // Helper to extract period key and details
    const getPeriodInfo = (date: Date) => {
      if (periodType === 'weekly') {
        const details = getISOWeekDetails(date);
        return {
          key: details.weekKey,
          label: details.label,
          startDate: details.startDate,
          endDate: details.endDate
        };
      } else if (periodType === 'yearly') {
        const y = date.getFullYear();
        return {
          key: String(y),
          label: `Year ${y}`,
          startDate: `${y}-01-01`,
          endDate: `${y}-12-31`
        };
      } else {
        const y = date.getFullYear();
        const m = date.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, '0')}`;
        const startDate = new Date(y, m, 1);
        const endDate = new Date(y, m + 1, 0);
        return {
          key,
          label: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10)
        };
      }
    };

    // Collect all periods
    const periodMap = new Map<string, {
      key: string;
      label: string;
      startDate: string;
      endDate: string;
      invoices: typeof invoices;
      directExpenses: typeof directExpenses;
      rentAmount: number;
      electricityAmount: number;
      licenseAmount: number;
    }>();

    const ensurePeriod = (date: Date) => {
      const info = getPeriodInfo(date);
      if (!periodMap.has(info.key)) {
        periodMap.set(info.key, {
          key: info.key,
          label: info.label,
          startDate: info.startDate,
          endDate: info.endDate,
          invoices: [],
          directExpenses: [],
          rentAmount: 0,
          electricityAmount: 0,
          licenseAmount: 0
        });
      }
      return periodMap.get(info.key)!;
    };

    invoices.forEach(inv => {
      ensurePeriod(inv.date).invoices.push(inv);
    });

    directExpenses.forEach(exp => {
      ensurePeriod(exp.date).directExpenses.push(exp);
    });

    rents.forEach(r => {
      const dt = r.paymentDate || new Date(`${r.month}-01T00:00:00Z`);
      const amt = r.paidAmount > 0 ? r.paidAmount : r.amount;
      ensurePeriod(dt).rentAmount += amt;
    });

    electricityBills.forEach(b => {
      const dt = b.paymentDate || new Date(`${b.billingMonth}-01T00:00:00Z`);
      const amt = b.paidAmount > 0 ? b.paidAmount : b.billAmount;
      ensurePeriod(dt).electricityAmount += amt;
    });

    licenses.forEach(l => {
      if (l.paymentDate) {
        ensurePeriod(l.paymentDate).licenseAmount += l.renewalCost;
      }
    });

    if (periodMap.size === 0) {
      ensurePeriod(new Date());
    }

    const sortedPeriods = Array.from(periodMap.values()).sort((a, b) => b.key.localeCompare(a.key));

    const breakdown: PeriodProfitDTO[] = sortedPeriods.map(p => {
      let partsRevenue = 0;
      let partsCost = 0;
      let labourRevenue = 0;
      let labourCost = 0;
      let servicesRevenue = 0;
      let servicesCost = 0;
      let discount = 0;
      let revenue = 0;

      p.invoices.forEach(inv => {
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

      let foodAndTea = 0;
      let conveyance = 0;
      let workshopSupplies = 0;
      let otherFixed = 0;

      p.directExpenses.forEach(e => {
        const cat = e.category;
        if (['Breakfast', 'Tea', 'Lunch', 'Dinner', 'Staff Food', 'Guest Food'].includes(cat)) {
          foodAndTea += e.amount;
        } else if (['Conveyance', 'Petrol/Fuel', 'Delivery', 'Vehicle Transport', 'Other Travel'].includes(cat)) {
          conveyance += e.amount;
        } else if (['Cleaning', 'Water', 'Tools', 'Small Repairs', 'Maintenance', 'Stationery', 'Shop Supplies', 'Miscellaneous'].includes(cat)) {
          workshopSupplies += e.amount;
        } else {
          otherFixed += e.amount;
        }
      });

      const dailyExpensesTotal = foodAndTea + conveyance + workshopSupplies;
      const fixedExpensesTotal = p.rentAmount + p.electricityAmount + p.licenseAmount + otherFixed;
      const expenses = dailyExpensesTotal + fixedExpensesTotal;

      const grossProfit = (partsRevenue - partsCost) + (labourRevenue - labourCost) + (servicesRevenue - servicesCost) - discount;
      const totalInvestment = cogs + expenses;
      const netProfit = grossProfit - expenses;
      const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
      const roiPercent = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

      return {
        periodType,
        key: p.key,
        label: p.label,
        startDate: p.startDate,
        endDate: p.endDate,
        invoiceCount: p.invoices.length,
        revenue,
        partsRevenue,
        partsCost,
        labourRevenue,
        labourCost,
        servicesRevenue,
        servicesCost,
        discount,
        cogs,
        foodAndTeaExpenses: foodAndTea,
        conveyanceExpenses: conveyance,
        workshopSuppliesExpenses: workshopSupplies,
        rentExpenses: p.rentAmount,
        electricityExpenses: p.electricityAmount,
        licenseExpenses: p.licenseAmount,
        otherFixedExpenses: otherFixed,
        dailyExpensesTotal,
        fixedExpensesTotal,
        expenses,
        grossProfit,
        totalInvestment,
        netProfit,
        marginPercent,
        roiPercent
      };
    });

    // Grand Totals
    const totalInvoices = invoices.length;
    let grandRevenue = 0;
    let grandPartsCost = 0;
    let grandLabourCost = 0;
    let grandServicesCost = 0;
    let grandGrossProfit = 0;
    let grandExpenses = 0;
    let grandInvestment = 0;

    breakdown.forEach(b => {
      grandRevenue += b.revenue;
      grandPartsCost += b.partsCost;
      grandLabourCost += b.labourCost;
      grandServicesCost += b.servicesCost;
      grandGrossProfit += b.grossProfit;
      grandExpenses += b.expenses;
      grandInvestment += b.totalInvestment;
    });

    const totalCOGS = grandPartsCost + grandLabourCost + grandServicesCost;
    const grandNetProfit = grandGrossProfit - grandExpenses;
    const grandMargin = grandRevenue > 0 ? (grandNetProfit / grandRevenue) * 100 : 0;
    const grandRoi = grandInvestment > 0 ? (grandNetProfit / grandInvestment) * 100 : 0;

    // Backward compatible monthlyBreakdown
    const monthlyBreakdown: ProfitBreakdownDTO[] = breakdown.map(b => ({
      monthKey: b.key,
      label: b.label,
      invoiceCount: b.invoiceCount,
      revenue: b.revenue,
      partsRevenue: b.partsRevenue,
      partsCost: b.partsCost,
      labourRevenue: b.labourRevenue,
      labourCost: b.labourCost,
      servicesRevenue: b.servicesRevenue,
      servicesCost: b.servicesCost,
      cogs: b.cogs,
      grossProfit: b.grossProfit,
      expenses: b.expenses,
      netProfit: b.netProfit,
      marginPercent: b.marginPercent
    }));

    return {
      totalInvoices,
      totalRevenue: grandRevenue,
      totalCOGS,
      totalExpenses: grandExpenses,
      totalInvestment: grandInvestment,
      grossProfit: grandGrossProfit,
      grandNetProfit,
      grandMargin,
      grandRoi,
      periodType,
      breakdown,
      monthlyBreakdown
    };
  }
};
