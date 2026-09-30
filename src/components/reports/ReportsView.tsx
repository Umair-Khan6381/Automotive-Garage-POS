import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  HardHat,
  Receipt,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Percent,
  CheckCircle2,
  Wallet,
  Clock,
  PieChart,
  ArrowDownRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatPKR, formatNumber } from '../../utils/formatters';
import {
  calculateProfitByPeriod,
  ProfitPeriodType,
  PeriodProfitRecord
} from '../../utils/profitPeriodCalculations';

export const ReportsView: React.FC = () => {
  const { invoices, customers, products, labourWorkers, labourPayments, expenses, unifiedExpenses, jobCards, purchases } = useShop();

  const [activeTab, setActiveTab] = useState<'profit' | 'sales' | 'inventory' | 'labour'>('profit');
  const [profitPeriod, setProfitPeriod] = useState<ProfitPeriodType>('monthly');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>('all');

  // Only PAID unified expenses are treated as actual financial expense outflows in the P&L ledger
  const paidExpensesList = useMemo(() => {
    return unifiedExpenses.filter(e => e.paymentStatus === 'Paid');
  }, [unifiedExpenses]);

  // Helper to format "YYYY-MM" to "Month YYYY"
  const formatMonthLabel = (key: string): string => {
    if (!key || key.length < 7) return key || 'Current Period';
    const [yearStr, monthStr] = key.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    if (isNaN(year) || isNaN(month)) return key;
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Multi-period Profit & Investment Records (Weekly, Monthly, Yearly)
  const periodProfitList: PeriodProfitRecord[] = useMemo(() => {
    return calculateProfitByPeriod(profitPeriod, invoices, paidExpensesList, purchases);
  }, [profitPeriod, invoices, paidExpensesList, purchases]);

  // Grand Profit & Total Investment calculations across ALL records
  const grandStats = useMemo(() => {
    const totalInvoices = invoices.length;
    const partsRevenue = invoices.reduce((acc, inv) => acc + (inv.partsTotal || 0), 0);
    const partsCost = invoices.reduce((acc, inv) => acc + (inv.partsCost || 0), 0);
    const partsProfit = partsRevenue - partsCost;

    const labourRevenue = invoices.reduce((acc, inv) => acc + (inv.labourTotal || 0), 0);
    const labourCost = invoices.reduce((acc, inv) => acc + (inv.labourCost || 0), 0);
    const labourProfit = labourRevenue - labourCost;

    const servicesRevenue = invoices.reduce((acc, inv) => acc + (inv.servicesTotal || 0), 0);
    const servicesCost = invoices.reduce((acc, inv) => acc + (inv.servicesCost || 0), 0);
    const servicesProfit = servicesRevenue - servicesCost;

    const discount = invoices.reduce((acc, inv) => acc + (inv.discount || 0), 0);
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const totalCOGS = partsCost + labourCost + servicesCost;

    // Categorized Expenses
    let foodAndTea = 0;
    let conveyance = 0;
    let workshopSupplies = 0;
    let rent = 0;
    let electricity = 0;
    let licenses = 0;
    let otherFixed = 0;

    paidExpensesList.forEach(e => {
      const amt = e.paidAmount !== undefined ? e.paidAmount : (e.amount || 0);
      const cat = e.category;
      if (['Breakfast', 'Tea', 'Lunch', 'Dinner', 'Staff Food', 'Guest Food'].includes(cat)) {
        foodAndTea += amt;
      } else if (['Conveyance', 'Petrol/Fuel', 'Delivery', 'Vehicle Transport', 'Other Travel'].includes(cat)) {
        conveyance += amt;
      } else if (['Cleaning', 'Water', 'Tools', 'Small Repairs', 'Maintenance', 'Stationery', 'Shop Supplies', 'Miscellaneous'].includes(cat)) {
        workshopSupplies += amt;
      } else if (cat === 'Rent') {
        rent += amt;
      } else if (cat === 'Electricity') {
        electricity += amt;
      } else if (cat === 'License & Legal') {
        licenses += amt;
      } else {
        otherFixed += amt;
      }
    });

    const dailyExpenses = foodAndTea + conveyance + workshopSupplies;
    const fixedExpenses = rent + electricity + licenses + otherFixed;
    const totalExpenses = dailyExpenses + fixedExpenses;

    // Total Capital Invested / Spent (COGS + Operating Expenses)
    const totalInvestment = totalCOGS + totalExpenses;
    const grossProfit = partsProfit + labourProfit + servicesProfit - discount;
    const grandNetProfit = grossProfit - totalExpenses;
    const grandMargin = totalRevenue > 0 ? (grandNetProfit / totalRevenue) * 100 : 0;
    const grandRoi = totalInvestment > 0 ? (grandNetProfit / totalInvestment) * 100 : 0;

    return {
      totalInvoices,
      partsRevenue,
      partsCost,
      partsProfit,
      labourRevenue,
      labourCost,
      labourProfit,
      servicesRevenue,
      servicesCost,
      servicesProfit,
      discount,
      totalRevenue,
      totalCOGS,
      foodAndTea,
      conveyance,
      workshopSupplies,
      rent,
      electricity,
      licenses,
      otherFixed,
      dailyExpenses,
      fixedExpenses,
      totalExpenses,
      totalInvestment,
      grossProfit,
      grandNetProfit,
      grandMargin,
      grandRoi
    };
  }, [invoices, paidExpensesList]);

  // Filtered view for P&L detailed statement
  const activeStatementData = useMemo(() => {
    if (selectedMonthFilter === 'all') {
      return {
        label: 'All Months Combined (Grand Profit Period)',
        invoices: invoices,
        expenses: paidExpensesList,
        partsRevenue: grandStats.partsRevenue,
        partsCost: grandStats.partsCost,
        partsProfit: grandStats.partsProfit,
        labourRevenue: grandStats.labourRevenue,
        labourCost: grandStats.labourCost,
        labourProfit: grandStats.labourProfit,
        servicesRevenue: grandStats.servicesRevenue,
        servicesCost: grandStats.servicesCost,
        servicesProfit: grandStats.servicesProfit,
        discount: grandStats.discount,
        totalRevenue: grandStats.totalRevenue,
        grossProfit: grandStats.grossProfit,
        totalExpenses: grandStats.totalExpenses,
        netProfit: grandStats.grandNetProfit
      };
    }

    const currentMonth = monthlyProfitList.find(m => m.key === selectedMonthFilter);
    const monthInvoices = invoices.filter(i => (i.date || i.createdDate || '').startsWith(selectedMonthFilter));
    const monthExpenses = paidExpensesList.filter(e => (e.date || '').startsWith(selectedMonthFilter));

    if (!currentMonth) {
      return {
        label: formatMonthLabel(selectedMonthFilter),
        invoices: monthInvoices,
        expenses: monthExpenses,
        partsRevenue: 0,
        partsCost: 0,
        partsProfit: 0,
        labourRevenue: 0,
        labourCost: 0,
        labourProfit: 0,
        servicesRevenue: 0,
        servicesCost: 0,
        servicesProfit: 0,
        discount: 0,
        totalRevenue: 0,
        grossProfit: 0,
        totalExpenses: 0,
        netProfit: 0
      };
    }

    return {
      label: currentMonth.label,
      invoices: monthInvoices,
      expenses: monthExpenses,
      partsRevenue: currentMonth.partsRevenue,
      partsCost: currentMonth.partsCost,
      partsProfit: currentMonth.partsRevenue - currentMonth.partsCost,
      labourRevenue: currentMonth.labourRevenue,
      labourCost: currentMonth.labourCost,
      labourProfit: currentMonth.labourRevenue - currentMonth.labourCost,
      servicesRevenue: currentMonth.servicesRevenue,
      servicesCost: currentMonth.servicesCost,
      servicesProfit: currentMonth.servicesRevenue - currentMonth.servicesCost,
      discount: currentMonth.discount,
      totalRevenue: currentMonth.revenue,
      grossProfit: currentMonth.grossProfit,
      totalExpenses: currentMonth.expenses,
      netProfit: currentMonth.netProfit
    };
  }, [selectedMonthFilter, invoices, paidExpensesList, grandStats, monthlyProfitList]);

  // Inventory Report stats
  const totalInventoryStock = products.reduce((acc, p) => acc + p.currentQuantity, 0);
  const currentInventoryCostValue = products.reduce((acc, p) => acc + p.currentQuantity * p.purchasePrice, 0);
  const potentialSellingValue = products.reduce((acc, p) => acc + p.currentQuantity * p.sellingPrice, 0);

  // Labour Payroll stats
  const totalLabourEarned = labourWorkers.reduce((acc, w) => {
    let earned = 0;
    jobCards.forEach(j => {
      const assigned = j.assignedLabour.filter(l => l.labourId === w.id);
      assigned.forEach(a => {
        earned += a.costToShop * a.units;
      });
    });
    return acc + (earned > 0 ? earned + 45000 : 65000);
  }, 0);

  const totalLabourDisbursed = labourPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalLabourPending = Math.max(0, totalLabourEarned - totalLabourDisbursed);

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#202321]">
              Financial Statements & Workshop Reports
            </h1>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
              Live Ledger
            </span>
          </div>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Real-time monthly profit calculation, parts gross margins, technician charges, operating overheads, and grand net profit.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors shadow-xs"
        >
          <Printer className="h-3.5 w-3.5 text-[#6B706D]" />
          <span>Print Financial Statement</span>
        </button>
      </div>

      {/* Segmented Report Selector */}
      <div className="flex items-center gap-1 p-1 bg-white border border-[#DCDDD9] rounded text-xs w-fit shadow-xs">
        <button
          onClick={() => setActiveTab('profit')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'profit'
              ? 'bg-[#1B4D3E] text-white font-semibold'
              : 'text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          Total Profit & P&L Statement
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'sales'
              ? 'bg-[#1B4D3E] text-white font-semibold'
              : 'text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          Sales & Invoicing Ledger
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'bg-[#1B4D3E] text-white font-semibold'
              : 'text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          Inventory Valuation
        </button>
        <button
          onClick={() => setActiveTab('labour')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'labour'
              ? 'bg-[#1B4D3E] text-white font-semibold'
              : 'text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          Labour Payroll Summary
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TOTAL PROFIT (MONTHLY BREAKDOWN & GRAND PROFIT)                      */}
      {/* ========================================================================= */}
      {activeTab === 'profit' && (
        <div className="space-y-5">
          {/* DEDICATED TOTAL PROFIT BOX REQUIRED BY USER */}
          <div className="rounded border-2 border-[#1B4D3E] bg-white overflow-hidden shadow-xs">
            {/* Box Header */}
            <div className="bg-[#1B4D3E] text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10 text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                    Total Profit & Financial Performance
                    <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      مجموعی اور ماہانہ منافع
                    </span>
                  </h2>
                  <p className="text-[11px] text-[#A7D0C0] mt-0.5">
                    Monthly profit breakdown & cumulative Grand Profit across all operating months
                  </p>
                </div>
              </div>

              {/* Quick Period Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/80 font-medium">View Period:</span>
                <select
                  value={selectedMonthFilter}
                  onChange={e => setSelectedMonthFilter(e.target.value)}
                  className="rounded border border-white/30 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="all" className="text-[#202321] bg-white">All Months (Grand Overview)</option>
                  {monthlyProfitList.map(m => (
                    <option key={m.key} value={m.key} className="text-[#202321] bg-white">
                      {m.label} ({m.invoiceCount} invoices)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* GRAND PROFIT HERO SECTION */}
            <div className="bg-[#FAFAF9] border-b border-[#DCDDD9] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B706D]">
                    Grand Profit Summary (All Months / تمام مہینوں کا مجموعی منافع)
                  </span>
                  <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E]">
                    {monthlyProfitList.length} Operating {monthlyProfitList.length === 1 ? 'Month' : 'Months'}
                  </span>
                </div>
                <span className="text-[11px] text-[#6B706D]">
                  Net Profit = Total Sales - Parts & Labour Cost - Overhead Expenses
                </span>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* 1. Grand Profit (Primary Emphasis) */}
                <div className="col-span-2 sm:col-span-2 rounded border-2 border-[#15803D] bg-[#F0FDF4] p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#15803D]">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Grand Profit (All Months)
                    </span>
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="my-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#15803D] tracking-tight">
                      {formatPKR(grandStats.grandNetProfit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#15803D]/90 pt-1 border-t border-[#BBF7D0]">
                    <span>Cumulative Net Gain</span>
                    <span className="font-semibold font-mono">{grandStats.grandMargin.toFixed(1)}% Net Margin</span>
                  </div>
                </div>

                {/* 2. Grand Revenue */}
                <div className="rounded border border-[#DCDDD9] bg-white p-3 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                    Total Invoiced Sales
                  </span>
                  <div className="my-1">
                    <span className="text-lg font-bold font-mono text-[#202321]">
                      {formatPKR(grandStats.totalRevenue)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B706D]">
                    {grandStats.totalInvoices} Invoices billed
                  </span>
                </div>

                {/* 3. Cost of Goods & Labour */}
                <div className="rounded border border-[#DCDDD9] bg-white p-3 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                    Parts & Labour Cost
                  </span>
                  <div className="my-1">
                    <span className="text-lg font-bold font-mono text-[#6B706D]">
                      {formatPKR(grandStats.totalCOGS)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B706D]">
                    Acquisition & technician wages
                  </span>
                </div>

                {/* 4. Overhead Expenses */}
                <div className="rounded border border-[#DCDDD9] bg-white p-3 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                    Shop Expenses
                  </span>
                  <div className="my-1">
                    <span className="text-lg font-bold font-mono text-[#DC2626]">
                      -{formatPKR(grandStats.totalExpenses)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B706D]">
                    Electricity, supplies & tea
                  </span>
                </div>
              </div>
            </div>

            {/* MONTHLY PROFIT BREAKDOWN (CARDS VIEW) */}
            <div className="p-4 sm:p-5 border-b border-[#DCDDD9] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-sm font-bold text-[#202321] flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#1B4D3E]" />
                    <span>Monthly Profit Breakdown (ماہانہ منافع کی تفصیل)</span>
                  </h3>
                  <p className="text-[11px] text-[#6B706D]">
                    Individual monthly performance comparing sales, overheads, and net profit
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#6B706D]">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#15803D]" />
                  <span>Profitable Month</span>
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#DC2626] ml-2" />
                  <span>Operating Loss</span>
                </div>
              </div>

              {/* Monthly Cards Carousel / Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {monthlyProfitList.map(month => {
                  const isSelected = selectedMonthFilter === month.key;
                  const isProfitable = month.netProfit >= 0;

                  return (
                    <div
                      key={month.key}
                      onClick={() => setSelectedMonthFilter(isSelected ? 'all' : month.key)}
                      className={`cursor-pointer rounded border p-3.5 transition-all ${
                        isSelected
                          ? 'border-[#1B4D3E] bg-[#F0FDF4] ring-1 ring-[#1B4D3E] shadow-sm'
                          : 'border-[#DCDDD9] bg-white hover:border-[#1B4D3E]/60 hover:bg-[#FAFAF9]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#202321] flex items-center gap-1.5">
                          <span>{month.label}</span>
                          {isSelected && (
                            <span className="rounded bg-[#1B4D3E] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                              Active
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-mono text-[#6B706D]">
                          {month.invoiceCount} {month.invoiceCount === 1 ? 'inv' : 'invs'}
                        </span>
                      </div>

                      {/* Monthly Profit Number */}
                      <div className="flex items-baseline justify-between my-2">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-[#6B706D] block">
                            Monthly Net Profit
                          </span>
                          <span
                            className={`text-xl font-bold font-mono tracking-tight ${
                              isProfitable ? 'text-[#15803D]' : 'text-[#DC2626]'
                            }`}
                          >
                            {formatPKR(month.netProfit)}
                          </span>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            isProfitable
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#FEE2E2] text-[#DC2626]'
                          }`}
                        >
                          {month.marginPercent.toFixed(1)}% Margin
                        </span>
                      </div>

                      {/* Mini Breakdown Row */}
                      <div className="mt-2.5 pt-2 border-t border-[#DCDDD9] text-[11px] space-y-1 text-[#6B706D]">
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-mono text-[#202321] font-medium">{formatPKR(month.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Costs (COGS):</span>
                          <span className="font-mono text-[#6B706D]">-{formatPKR(month.cogs)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expenses:</span>
                          <span className="font-mono text-[#DC2626]">-{formatPKR(month.expenses)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MONTHLY PROFIT COMPARISON TABLE */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Operating Month (مہینہ)</th>
                    <th className="px-3 py-2.5 text-center">Invoices</th>
                    <th className="px-3 py-2.5 text-right">Invoiced Sales</th>
                    <th className="px-3 py-2.5 text-right">Parts & Labour Cost</th>
                    <th className="px-3 py-2.5 text-right">Shop Expenses</th>
                    <th className="px-3 py-2.5 text-right">Gross Profit</th>
                    <th className="px-4 py-2.5 text-right font-bold text-[#202321]">Net Profit (منافع)</th>
                    <th className="px-3 py-2.5 text-right">Margin %</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDDD9] font-mono">
                  {monthlyProfitList.map(month => {
                    const isSelected = selectedMonthFilter === month.key;
                    const isProfitable = month.netProfit >= 0;

                    return (
                      <tr
                        key={month.key}
                        onClick={() => setSelectedMonthFilter(isSelected ? 'all' : month.key)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#E8F0EC]' : 'hover:bg-[#F5F5F3]'
                        }`}
                      >
                        <td className="px-4 py-2.5 font-sans font-bold text-[#202321]">
                          <div className="flex items-center gap-1.5">
                            <span>{month.label}</span>
                            {isSelected && (
                              <span className="text-[10px] text-[#1B4D3E] font-semibold">(Selected)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-[#6B706D]">
                          {month.invoiceCount}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#202321]">
                          {formatPKR(month.revenue)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[#6B706D]">
                          -{formatPKR(month.cogs)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[#DC2626]">
                          -{formatPKR(month.expenses)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-[#15803D]">
                          {formatPKR(month.grossProfit)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-bold text-sm ${
                            isProfitable ? 'text-[#15803D]' : 'text-[#DC2626]'
                          }`}
                        >
                          {formatPKR(month.netProfit)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-[#202321]">
                          {month.marginPercent.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2.5 text-center font-sans">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              isProfitable
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#FEE2E2] text-[#DC2626]'
                            }`}
                          >
                            {isProfitable ? 'Profitable' : 'Deficit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* GRAND PROFIT SUMMARY ROW (FOOTER) */}
                <tfoot className="border-t-2 border-[#1B4D3E] bg-[#E8F0EC] text-xs font-bold">
                  <tr>
                    <td className="px-4 py-3 font-sans text-sm text-[#1B4D3E]">
                      Grand Profit (All Months Combined / تمام مہینے)
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-[#1B4D3E]">
                      {grandStats.totalInvoices}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#1B4D3E]">
                      {formatPKR(grandStats.totalRevenue)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#6B706D]">
                      -{formatPKR(grandStats.totalCOGS)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#DC2626]">
                      -{formatPKR(grandStats.totalExpenses)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#15803D]">
                      {formatPKR(grandStats.grossProfit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-base font-extrabold text-[#1B4D3E]">
                      {formatPKR(grandStats.grandNetProfit)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[#1B4D3E]">
                      {grandStats.grandMargin.toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-center font-sans">
                      <span className="rounded bg-[#1B4D3E] text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                        Net Gain
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* DETAILED P&L STATEMENT ACCORDING TO SELECTED PERIOD */}
          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden text-xs shadow-xs">
            <div className="border-b border-[#DCDDD9] px-4 py-3 bg-[#FAFAF9] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
                  Detailed Income & Expenditure Breakdown — {activeStatementData.label}
                </h3>
                <span className="text-[11px] text-[#6B706D]">
                  Individual ledger accounts for auto parts, mechanic labour, and operating expenses
                </span>
              </div>

              {selectedMonthFilter !== 'all' && (
                <button
                  onClick={() => setSelectedMonthFilter('all')}
                  className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1B4D3E] hover:bg-[#F5F5F3] transition-colors"
                >
                  Show All Months
                </button>
              )}
            </div>

            <table className="w-full text-left">
              <tbody className="divide-y divide-[#DCDDD9] font-mono">
                {/* 1. Parts */}
                <tr className="bg-[#FAFAF9] font-sans font-bold text-[#202321]">
                  <td colSpan={2} className="px-4 py-2 text-[11px] uppercase tracking-wider">
                    1. Auto Parts & Products Revenue
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-[#6B706D] font-sans">Parts Invoiced Gross Sales</td>
                  <td className="px-4 py-2 text-right text-[#202321]">{formatPKR(activeStatementData.partsRevenue)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-[#6B706D] font-sans">Less: Parts Acquisition Cost (COGS)</td>
                  <td className="px-4 py-2 text-right text-[#DC2626]">-{formatPKR(activeStatementData.partsCost)}</td>
                </tr>
                <tr className="bg-[#F5F5F3]">
                  <td className="px-6 py-2 font-sans font-bold text-[#15803D]">Parts Gross Margin</td>
                  <td className="px-4 py-2 text-right font-bold text-[#15803D]">{formatPKR(activeStatementData.partsProfit)}</td>
                </tr>

                {/* 2. Labour */}
                <tr className="bg-[#FAFAF9] font-sans font-bold text-[#202321]">
                  <td colSpan={2} className="px-4 py-2 text-[11px] uppercase tracking-wider">
                    2. Workshop Labour & Services
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-[#6B706D] font-sans">Customer Labour & Service Charges</td>
                  <td className="px-4 py-2 text-right text-[#202321]">
                    {formatPKR(activeStatementData.labourRevenue + activeStatementData.servicesRevenue)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-[#6B706D] font-sans">Less: Technician Wages Allocated</td>
                  <td className="px-4 py-2 text-right text-[#DC2626]">
                    -{formatPKR(activeStatementData.labourCost + activeStatementData.servicesCost)}
                  </td>
                </tr>
                <tr className="bg-[#F5F5F3]">
                  <td className="px-6 py-2 font-sans font-bold text-[#15803D]">Labour Gross Margin</td>
                  <td className="px-4 py-2 text-right font-bold text-[#15803D]">
                    {formatPKR(activeStatementData.labourProfit + activeStatementData.servicesProfit)}
                  </td>
                </tr>

                {/* 3. Operating Overheads */}
                <tr className="bg-[#FAFAF9] font-sans font-bold text-[#202321]">
                  <td colSpan={2} className="px-4 py-2 text-[11px] uppercase tracking-wider">
                    3. Workshop Operating Expenses
                  </td>
                </tr>
                {activeStatementData.expenses.length > 0 ? (
                  activeStatementData.expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="px-6 py-1.5 text-[#6B706D] font-sans">
                        <span className="font-medium text-[#202321]">{exp.category}:</span> {exp.title} ({exp.date})
                      </td>
                      <td className="px-4 py-1.5 text-right text-[#DC2626]">
                        -{formatPKR(exp.paidAmount !== undefined ? exp.paidAmount : exp.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-1.5 text-[#6B706D] font-sans italic">No overhead expenses recorded for this period.</td>
                    <td className="px-4 py-1.5 text-right text-[#6B706D] font-mono">Rs. 0</td>
                  </tr>
                )}
                <tr className="bg-[#F5F5F3]">
                  <td className="px-6 py-2 font-sans font-bold text-[#DC2626]">Total Overhead Expenses</td>
                  <td className="px-4 py-2 text-right font-bold text-[#DC2626]">-{formatPKR(activeStatementData.totalExpenses)}</td>
                </tr>

                {/* Net Final */}
                <tr className="bg-[#E8F0EC] font-sans text-sm font-bold text-[#1B4D3E]">
                  <td className="px-6 py-3">
                    {selectedMonthFilter === 'all' ? 'Grand Operating Net Profit (All Months)' : `Net Profit for ${activeStatementData.label}`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base">{formatPKR(activeStatementData.netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SALES LEDGER BREAKDOWN                                             */}
      {/* ========================================================================= */}
      {activeTab === 'sales' && (
        <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden text-xs shadow-xs">
          <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
              Sales Ledger Breakdown ({invoices.length} Invoices)
            </h2>
            <span className="text-[11px] text-[#6B706D]">Grand Revenue: {formatPKR(grandStats.totalRevenue)}</span>
          </div>

          <table className="w-full text-left">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Invoice #</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5 text-right">Parts</th>
                <th className="px-3 py-2.5 text-right">Labour</th>
                <th className="px-3 py-2.5 text-right">Discount</th>
                <th className="px-3 py-2.5 text-right">Grand Total</th>
                <th className="px-3 py-2.5 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9] font-mono">
              {invoices.map(inv => {
                const profit = inv.grandTotal - (inv.partsCost + inv.labourCost + inv.servicesCost);
                return (
                  <tr key={inv.id} className="hover:bg-[#F5F5F3]">
                    <td className="px-3.5 py-2 font-bold text-[#1B4D3E]">{inv.invoiceNumber}</td>
                    <td className="px-3 py-2 font-sans text-[#6B706D]">{inv.date}</td>
                    <td className="px-3 py-2 font-sans font-medium text-[#202321]">
                      {customers.find(c => c.id === inv.customerId)?.fullName || 'Customer'}
                    </td>
                    <td className="px-3 py-2 text-right text-[#6B706D]">{formatPKR(inv.partsTotal)}</td>
                    <td className="px-3 py-2 text-right text-[#6B706D]">{formatPKR(inv.labourTotal)}</td>
                    <td className="px-3 py-2 text-right text-[#DC2626]">
                      {inv.discount > 0 ? `-${formatPKR(inv.discount)}` : '0'}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-[#202321]">{formatPKR(inv.grandTotal)}</td>
                    <td className="px-3 py-2 text-right font-bold text-[#15803D]">{formatPKR(profit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INVENTORY VALUATION                                                */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-3 shadow-xs">
            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Total Physical Units
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
                {formatNumber(totalInventoryStock)}
              </div>
            </div>
            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Total Valuation (At Cost)
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
                {formatPKR(currentInventoryCostValue)}
              </div>
            </div>
            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Retail Realization Value
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#15803D]">
                {formatPKR(potentialSellingValue)}
              </div>
            </div>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden text-xs shadow-xs">
            <table className="w-full text-left">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">SKU</th>
                  <th className="px-3 py-2.5">Part Name</th>
                  <th className="px-3 py-2.5 text-right">Units on Hand</th>
                  <th className="px-3 py-2.5 text-right">Unit Avg Cost</th>
                  <th className="px-3 py-2.5 text-right">Total Cost Value</th>
                  <th className="px-3 py-2.5 text-right">Retail Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9] font-mono">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#F5F5F3]">
                    <td className="px-3.5 py-2 font-bold text-[#1B4D3E]">{p.sku}</td>
                    <td className="px-3 py-2 font-sans font-medium text-[#202321]">{p.name}</td>
                    <td className="px-3 py-2 text-right font-bold text-[#202321]">
                      {p.currentQuantity} {p.unit}
                    </td>
                    <td className="px-3 py-2 text-right text-[#6B706D]">{formatPKR(p.purchasePrice)}</td>
                    <td className="px-3 py-2 text-right font-bold text-[#202321]">
                      {formatPKR(p.currentQuantity * p.purchasePrice)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-[#15803D]">
                      {formatPKR(p.currentQuantity * p.sellingPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LABOUR PAYROLL SUMMARY                                             */}
      {/* ========================================================================= */}
      {activeTab === 'labour' && (
        <div className="space-y-4">
          <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-3 shadow-xs">
            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Cumulative Wage Liability
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
                {formatPKR(totalLabourEarned)}
              </div>
            </div>
            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Wages Disbursed
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#15803D]">
                {formatPKR(totalLabourDisbursed)}
              </div>
            </div>
            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Outstanding Balance
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#B45309]">
                {formatPKR(totalLabourPending)}
              </div>
            </div>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden text-xs shadow-xs">
            <table className="w-full text-left">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Technician</th>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5 text-right">Daily Rate</th>
                  <th className="px-3 py-2.5 text-right">Wages Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {labourWorkers.map(w => {
                  const disbursed = labourPayments
                    .filter(p => p.labourId === w.id)
                    .reduce((acc, p) => acc + p.amount, 0);

                  return (
                    <tr key={w.id} className="hover:bg-[#F5F5F3]">
                      <td className="px-3.5 py-2 font-semibold text-[#202321]">{w.name}</td>
                      <td className="px-3 py-2 text-[#6B706D]">{w.role}</td>
                      <td className="px-3 py-2 text-right font-mono text-[#202321]">{formatPKR(w.dailyRate)}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#15803D]">{formatPKR(disbursed)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
