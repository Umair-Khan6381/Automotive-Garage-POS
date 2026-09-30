import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Wrench,
  AlertTriangle,
  Package,
  Droplet,
  Plus,
  ArrowRight,
  HardHat,
  CreditCard,
  CheckCircle2,
  Clock,
  Car,
  Wallet
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatPKR, formatNumber } from '../../utils/formatters';
import { evaluateServiceDueStatus } from '../../utils/calculations';
import { calculateDashboardExpenseSummary } from '../../utils/expenseCalculations';

export const DashboardView: React.FC = () => {
  const {
    products,
    jobCards,
    invoices,
    oilChanges,
    vehicles,
    customers,
    expenses,
    rents,
    electricityBills,
    licenses,
    unifiedExpenses,
    setActiveView,
    setSelectedJobId,
    labourWorkers,
    settings
  } = useShop();

  // Financial calculations
  const totalSales = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalProductCost = invoices.reduce((acc, inv) => acc + inv.partsCost, 0);
  const totalLabourCost = invoices.reduce((acc, inv) => acc + inv.labourCost, 0);
  
  // Total Operating Expenses directly derived from unified canonical paid expenses
  const paidUnifiedExpenses = unifiedExpenses.filter(e => e.paymentStatus === 'Paid');
  const totalExpenses = paidUnifiedExpenses.reduce((acc, exp) => acc + exp.paidAmount, 0);

  const grossProfit = totalSales - (totalProductCost + totalLabourCost);
  const netProfit = grossProfit - totalExpenses;

  // Dedicated Expense Dashboard Summary
  const expenseSummary = calculateDashboardExpenseSummary(unifiedExpenses);

  // Receivables
  const pendingPaymentsAmount = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);
  const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'Paid');

  // Job Cards
  const openJobs = jobCards.filter(j => j.status !== 'completed' && j.status !== 'delivered' && j.status !== 'cancelled');

  // Inventory Health
  const lowStockProducts = products.filter(p => p.currentQuantity <= p.minStockLevel);
  const totalStockQuantity = products.reduce((acc, p) => acc + p.currentQuantity, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.currentQuantity * p.purchasePrice, 0);

  // Service Reminders
  const serviceStatuses = oilChanges.map(oc => {
    const v = vehicles.find(veh => veh.id === oc.vehicleId);
    const mileage = v ? v.mileage : oc.mileage;
    const evaluation = evaluateServiceDueStatus(mileage, oc.nextRecommendedMileage, oc.nextRecommendedDate);
    return {
      ...oc,
      vehicle: v,
      customer: customers.find(c => c.id === oc.customerId),
      evaluation
    };
  });

  const overdueServices = serviceStatuses.filter(s => s.evaluation.status === 'overdue');
  const dueServices = serviceStatuses.filter(s => s.evaluation.status === 'due');

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="page-title">
            Workshop Operations Console
          </h1>
          <div className="flex items-center gap-2 text-[12px] text-[#6B706D] mt-0.5">
            <span>{settings.shopName}</span>
            <span>·</span>
            <span>Floor Terminal</span>
            <span>·</span>
            <span className="font-mono">{todayStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('pos')}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-[14px] font-medium text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Counter POS Desk</span>
          </button>
          <button
            onClick={() => setActiveView('jobs')}
            className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-[14px] font-medium text-[#202321] hover:bg-[#F5F5F3] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-[#6B706D]" />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      {/* Operational Metrics Strip (Unified single-elevation ribbon) */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 lg:grid-cols-5">
        <div className="p-3.5">
          <div className="text-[13px] font-medium text-[#6B706D] tracking-wide">
            Total Revenue
          </div>
          <div className="mt-1 text-[26px] font-semibold font-mono text-[#202321] tabular-nums leading-tight">
            {formatPKR(totalSales)}
          </div>
          <div className="text-[12px] text-[#6B706D] mt-0.5">
            {invoices.length} invoices issued
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[13px] font-medium text-[#6B706D] tracking-wide">
            Gross Margin
          </div>
          <div className="mt-1 text-[26px] font-semibold font-mono text-[#15803D] tabular-nums leading-tight">
            {formatPKR(grossProfit)}
          </div>
          <div className="text-[12px] text-[#6B706D] mt-0.5">
            Parts + Labour
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[13px] font-medium text-[#6B706D] tracking-wide">
            Receivables (Unpaid)
          </div>
          <div className="mt-1 text-[26px] font-semibold font-mono text-[#B45309] tabular-nums leading-tight">
            {formatPKR(pendingPaymentsAmount)}
          </div>
          <div className="text-[12px] text-[#6B706D] mt-0.5">
            {unpaidInvoices.length} pending receipts
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[13px] font-medium text-[#6B706D] tracking-wide">
            Active Jobs
          </div>
          <div className="mt-1 text-[26px] font-semibold font-mono text-[#202321] tabular-nums leading-tight">
            {openJobs.length} <span className="text-[12px] font-normal text-[#6B706D]">in bays</span>
          </div>
          <div className="text-[12px] text-[#6B706D] mt-0.5">
            {jobCards.length - openJobs.length} completed
          </div>
        </div>

        <div className="p-3.5 col-span-2 lg:col-span-1">
          <div className="text-[13px] font-medium text-[#6B706D] tracking-wide">
            Inventory Alert
          </div>
          <div className="mt-1 text-[26px] font-semibold font-mono text-[#DC2626] tabular-nums leading-tight">
            {lowStockProducts.length} <span className="text-[12px] font-normal text-[#6B706D]">reorders</span>
          </div>
          <div className="text-[12px] text-[#6B706D] mt-0.5">
            {overdueServices.length} oil services overdue
          </div>
        </div>
      </div>

      {/* DASHBOARD EXPENSE & FIXED COST SUMMARY (Requirement 22) */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
        <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#1B4D3E]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
              Daily & Fixed Operating Expenses Summary
            </h2>
          </div>
          <button
            onClick={() => setActiveView('expenses')}
            className="text-xs font-medium text-[#1B4D3E] hover:underline inline-flex items-center gap-1"
          >
            Manage Expenses & Fixed Costs <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 lg:grid-cols-5">
          {/* 1. Today's Expenses */}
          <div className="p-3.5">
            <div className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
              Today's Expenses
            </div>
            <div className="mt-1 text-[20px] font-bold font-mono text-[#202321] tabular-nums">
              {formatPKR(expenseSummary.todayExpenses)}
            </div>
            <div className="text-[11px] text-[#6B706D] mt-0.5">
              Breakfast, tea, conveyance
            </div>
          </div>

          {/* 2. This Month */}
          <div className="p-3.5">
            <div className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
              This Month's Outflow
            </div>
            <div className="mt-1 text-[20px] font-bold font-mono text-[#DC2626] tabular-nums">
              {formatPKR(expenseSummary.thisMonthExpenses)}
            </div>
            <div className="text-[11px] text-[#6B706D] mt-0.5">
              Daily + Paid fixed overheads
            </div>
          </div>

          {/* 3. Pending Expenses */}
          <div className="p-3.5">
            <div className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
              Pending Expenses
            </div>
            <div className="mt-1 text-[20px] font-bold font-mono text-[#B45309] tabular-nums">
              {formatPKR(expenseSummary.pendingExpenses)}
            </div>
            <div className="text-[11px] text-[#6B706D] mt-0.5">
              Unpaid liabilities
            </div>
          </div>

          {/* 4. Overdue Bills */}
          <div className="p-3.5">
            <div className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
              Overdue Bills
            </div>
            <div className="mt-1 text-[20px] font-bold font-mono text-[#DC2626] tabular-nums">
              {formatPKR(expenseSummary.overdueBills)}
            </div>
            <div className="text-[11px] text-[#6B706D] mt-0.5">
              Past payment deadline
            </div>
          </div>

          {/* 5. Fixed Monthly Cost */}
          <div className="p-3.5 col-span-2 lg:col-span-1 bg-[#FAFAF9]">
            <div className="text-[12px] font-semibold text-[#1B4D3E] uppercase tracking-wider">
              Fixed Monthly Cost
            </div>
            <div className="mt-1 text-[20px] font-bold font-mono text-[#1B4D3E] tabular-nums">
              {formatPKR(expenseSummary.fixedMonthlyCost)}
            </div>
            <div className="text-[11px] text-[#6B706D] mt-0.5">
              Rent + Electricity + Licenses
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Work Orders & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Active Workshop Jobs */}
        <div className="lg:col-span-2 rounded border border-[#DCDDD9] bg-white">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
                Active Repair Floor ({openJobs.length})
              </h2>
            </div>
            <button
              onClick={() => setActiveView('jobs')}
              className="text-xs font-medium text-[#1B4D3E] hover:underline inline-flex items-center gap-1"
            >
              All Job Cards <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {openJobs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B706D]">
              No active jobs in the workshop floor. Click "New Job Card" to check in a vehicle.
            </div>
          ) : (
            <div className="divide-y divide-[#DCDDD9]">
              {openJobs.map(job => {
                const vehicle = vehicles.find(v => v.id === job.vehicleId);
                const customer = customers.find(c => c.id === job.customerId);

                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setActiveView('jobs');
                    }}
                    className="p-3 hover:bg-[#F5F5F3] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1B4D3E]">
                          {job.jobNumber}
                        </span>
                        <span className="font-semibold text-[#202321]">
                          {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                        </span>
                        <span className="font-mono text-[11px] bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded font-medium">
                          {vehicle?.registrationNumber}
                        </span>
                      </div>
                      <div className="text-[#6B706D] mt-1 text-[11px] truncate">
                        <span className="font-medium text-[#202321]">{customer?.fullName}</span>
                        {customer?.phone && <span> · {customer.phone}</span>}
                        <span> · {job.complaint}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#202321] tabular-nums">
                          {formatPKR(job.finalCost || job.estimatedCost)}
                        </div>
                        <div className="text-[10px] text-[#6B706D]">
                          {job.partsUsed.length} parts · {job.assignedLabour.length} tech
                        </div>
                      </div>

                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                          job.status === 'in_progress'
                            ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                            : job.status === 'waiting_for_parts'
                            ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                            : 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Preventative Service Reminders */}
        <div className="rounded border border-[#DCDDD9] bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-[#1B4D3E]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
                  Service & Oil Status
                </h2>
              </div>
              <button
                onClick={() => setActiveView('oil_changes')}
                className="text-xs font-medium text-[#1B4D3E] hover:underline"
              >
                Log Service
              </button>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="border border-[#FEE2E2] bg-[#FEF2F2] p-2 text-center rounded">
                  <div className="text-base font-bold font-mono text-[#DC2626]">{overdueServices.length}</div>
                  <div className="text-[10px] text-[#DC2626] font-medium">Overdue</div>
                </div>
                <div className="border border-[#FEF3C7] bg-[#FFFBEB] p-2 text-center rounded">
                  <div className="text-base font-bold font-mono text-[#B45309]">{dueServices.length}</div>
                  <div className="text-[10px] text-[#B45309] font-medium">Due Soon</div>
                </div>
                <div className="border border-[#DCFCE7] bg-[#F0FDF4] p-2 text-center rounded">
                  <div className="text-base font-bold font-mono text-[#15803D]">
                    {serviceStatuses.filter(s => s.evaluation.status === 'upcoming').length}
                  </div>
                  <div className="text-[10px] text-[#15803D] font-medium">Nominal</div>
                </div>
              </div>

              <div className="divide-y divide-[#DCDDD9] text-xs">
                {serviceStatuses.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#202321] flex items-center gap-1.5">
                        <span className="font-mono">{item.vehicle?.registrationNumber}</span>
                        <span className="text-[11px] text-[#6B706D]">({item.vehicle?.make})</span>
                      </div>
                      <div className="text-[11px] text-[#6B706D]">{item.customer?.fullName}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          item.evaluation.status === 'overdue'
                            ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                            : item.evaluation.status === 'due'
                            ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                            : 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                        }`}
                      >
                        {item.evaluation.status.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-[#6B706D] mt-0.5 font-mono">
                        {item.evaluation.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-[#DCDDD9] bg-[#FAFAF9]">
            <button
              onClick={() => setActiveView('oil_changes')}
              className="w-full rounded border border-[#DCDDD9] bg-white py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
            >
              + Log New Oil Change
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Alert & Recent Invoices Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Parts Inventory Reorder Watchlist */}
        <div className="rounded border border-[#DCDDD9] bg-white">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
                Stock Reorder Watchlist ({lowStockProducts.length})
              </h2>
            </div>
            <button
              onClick={() => setActiveView('inventory')}
              className="text-xs font-medium text-[#1B4D3E] hover:underline"
            >
              View Full Stock
            </button>
          </div>

          <div className="p-3 divide-y divide-[#DCDDD9] text-xs">
            {products.slice(0, 4).map(prod => {
              const isLow = prod.currentQuantity <= prod.minStockLevel;
              return (
                <div key={prod.id} className="py-2 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <div className="font-semibold text-[#202321] truncate">{prod.name}</div>
                    <div className="text-[11px] text-[#6B706D] font-mono flex items-center gap-2 mt-0.5">
                      <span>{prod.sku}</span>
                      <span>·</span>
                      <span>Avg Cost: {formatPKR(prod.purchasePrice)}</span>
                      <span>·</span>
                      <span>Retail: {formatPKR(prod.sellingPrice)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-xs ${
                        isLow ? 'text-[#DC2626]' : 'text-[#202321]'
                      }`}
                    >
                      {prod.currentQuantity} {prod.unit}
                    </span>
                    <div className="text-[10px] text-[#6B706D]">
                      Min: {prod.minStockLevel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-[#DCDDD9] bg-[#FAFAF9] flex items-center justify-between text-xs text-[#6B706D]">
            <span>Total Value: <strong className="text-[#202321] font-mono">{formatPKR(totalInventoryValue)}</strong></span>
            <button
              onClick={() => setActiveView('purchases')}
              className="font-medium text-[#1B4D3E] hover:underline"
            >
              + Create Supplier PO
            </button>
          </div>
        </div>

        {/* Workshop Technicians & Bays */}
        <div className="rounded border border-[#DCDDD9] bg-white">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
            <div className="flex items-center gap-2">
              <HardHat className="h-4 w-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
                Workshop Labour & Floor Staff
              </h2>
            </div>
            <button
              onClick={() => setActiveView('labour')}
              className="text-xs font-medium text-[#1B4D3E] hover:underline"
            >
              Manage Staff
            </button>
          </div>

          <div className="p-3 divide-y divide-[#DCDDD9] text-xs">
            {labourWorkers.map(w => (
              <div key={w.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#202321]">{w.name}</div>
                  <div className="text-[11px] text-[#6B706D]">{w.role}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[#202321] font-medium">
                    {formatPKR(w.dailyRate)} <span className="text-[10px] text-[#6B706D]">/ day</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#15803D]">
                    On Duty
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[#DCDDD9] bg-[#FAFAF9] flex items-center justify-between text-xs text-[#6B706D]">
            <span>Active Mechanics: <strong className="text-[#202321]">{labourWorkers.length}</strong></span>
            <button
              onClick={() => setActiveView('labour_payroll')}
              className="font-medium text-[#1B4D3E] hover:underline"
            >
              View Payroll Ledger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
