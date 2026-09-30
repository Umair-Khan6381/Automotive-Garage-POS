import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Building2,
  Zap,
  FileCheck2,
  Calendar,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  Printer,
  ChevronDown,
  X,
  FileText,
  DollarSign,
  Coffee,
  Utensils,
  Car,
  Sparkles,
  Ban,
  Check,
  AlertTriangle
} from 'lucide-react';
import {
  useShop
} from '../../context/ShopContext';
import {
  ExpenseCategory,
  ExpenseType,
  PaymentMethod,
  WorkshopRent,
  ElectricityBill,
  LicenseRecord,
  ShopExpense
} from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';
import {
  calculateMonthlyExpenseSummary,
  calculateDashboardExpenseSummary,
  UnifiedExpenseItem
} from '../../utils/expenseCalculations';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    rents,
    electricityBills,
    licenses,
    unifiedExpenses,
    addExpense,
    updateExpense,
    voidExpense,
    deleteExpense,
    addRent,
    markRentPaid,
    updateRent,
    deleteRent,
    addElectricityBill,
    markElectricityPaid,
    updateElectricityBill,
    deleteElectricityBill,
    addLicense,
    updateLicense,
    recordLicenseRenewal,
    deleteLicense,
    currentUser,
    isOwner,
    settings
  } = useShop();

  // Active section tabs
  const [activeTab, setActiveTab] = useState<'daily' | 'rent' | 'electricity' | 'licenses' | 'reports'>('daily');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('this_month'); // 'all', 'today', 'this_month', 'last_month', '2026'

  // Modal Dialogs
  const [isAddDailyModalOpen, setIsAddDailyModalOpen] = useState(false);
  const [isAddRentModalOpen, setIsAddRentModalOpen] = useState(false);
  const [isAddElectricityModalOpen, setIsAddElectricityModalOpen] = useState(false);
  const [isAddLicenseModalOpen, setIsAddLicenseModalOpen] = useState(false);
  const [selectedItemForPayment, setSelectedItemForPayment] = useState<UnifiedExpenseItem | null>(null);
  const [selectedExpenseForVoid, setSelectedExpenseForVoid] = useState<ShopExpense | null>(null);
  const [voidReasonText, setVoidReasonText] = useState('');

  // Daily Expense Form State
  const [dailyForm, setDailyForm] = useState({
    title: '',
    category: 'Tea' as ExpenseCategory,
    type: 'daily' as ExpenseType,
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Cash' as PaymentMethod,
    paidBy: currentUser?.name || 'Owner',
    notes: '',
    attachment: ''
  });

  // Workshop Rent Form State
  const [rentForm, setRentForm] = useState({
    month: '2026-10',
    amount: '80000',
    paidAmount: '80000',
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank Transfer' as PaymentMethod,
    status: 'Paid' as 'Paid' | 'Pending' | 'Partially Paid',
    notes: ''
  });

  // Electricity Bill Form State
  const [electricityForm, setElectricityForm] = useState({
    billingMonth: '2026-10',
    billNumber: 'LESCO-',
    previousReading: '',
    currentReading: '',
    unitsConsumed: '750',
    billAmount: '28500',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    paymentDate: '',
    paymentMethod: 'Bank Transfer' as PaymentMethod,
    status: 'Unpaid' as 'Paid' | 'Unpaid' | 'Partially Paid',
    notes: ''
  });

  // License Form State
  const [licenseForm, setLicenseForm] = useState({
    name: '',
    licenseNumber: '',
    issuingAuthority: 'Municipal Corporation',
    issueDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    renewalCost: '15000',
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank Transfer' as PaymentMethod,
    notes: ''
  });

  // Payment settle form
  const [paymentSettleAmount, setPaymentSettleAmount] = useState('');
  const [paymentSettleMethod, setPaymentSettleMethod] = useState<PaymentMethod>('Cash');

  // Collect available unique months from all unified expenses
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    unifiedExpenses.forEach(e => {
      if (e.monthKey) set.add(e.monthKey);
    });
    set.add(new Date().toISOString().slice(0, 7));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [unifiedExpenses]);

  // Monthly Summary for the chosen month
  const monthlySummary = useMemo(() => {
    return calculateMonthlyExpenseSummary(selectedMonth, unifiedExpenses);
  }, [selectedMonth, unifiedExpenses]);

  // Dashboard top KPIs
  const dashboardStats = useMemo(() => {
    return calculateDashboardExpenseSummary(unifiedExpenses);
  }, [unifiedExpenses]);

  // Category breakdown for active month
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    unifiedExpenses.forEach(item => {
      if (item.monthKey !== selectedMonth) return;
      if (item.paymentStatus === 'Void' || item.paymentStatus === 'Cancelled') return;

      const current = map.get(item.category) || 0;
      map.set(item.category, current + item.paidAmount);
    });

    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [selectedMonth, unifiedExpenses]);

  // Filtered Unified Expenses
  const filteredExpenses = useMemo(() => {
    return unifiedExpenses.filter(item => {
      // Tab filter
      if (activeTab === 'daily' && item.typeGroup !== 'DAILY' && item.typeGroup !== 'WORKSHOP') {
        return false;
      }
      if (activeTab === 'rent' && item.sourceType !== 'rent') {
        return false;
      }
      if (activeTab === 'electricity' && item.sourceType !== 'electricity') {
        return false;
      }
      if (activeTab === 'licenses' && item.sourceType !== 'license') {
        return false;
      }

      // Date Range / Month Filter
      if (dateRangeFilter === 'this_month') {
        const thisMonth = new Date().toISOString().slice(0, 7);
        if (item.monthKey !== thisMonth) return false;
      } else if (dateRangeFilter === 'today') {
        const today = new Date().toISOString().slice(0, 10);
        if (item.date !== today) return false;
      } else if (dateRangeFilter === 'selected_month') {
        if (item.monthKey !== selectedMonth) return false;
      } else if (dateRangeFilter === '2026') {
        if (!item.date.startsWith('2026')) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.paymentStatus !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          item.amount.toString().includes(q)
        );
      }

      return true;
    });
  }, [unifiedExpenses, activeTab, dateRangeFilter, selectedMonth, categoryFilter, statusFilter, searchQuery]);

  // Quick Daily Preset Handlers (Breakfast, Tea, Lunch, Petrol)
  const handleQuickAdd = (category: ExpenseCategory, defaultAmount: number, title: string) => {
    setDailyForm({
      title,
      category,
      type: 'daily',
      amount: defaultAmount.toString(),
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Cash',
      paidBy: currentUser?.name || 'Owner',
      notes: `${category} recorded via quick entry`,
      attachment: ''
    });
    setIsAddDailyModalOpen(true);
  };

  // Submit Daily Expense Form
  const handleSubmitDailyExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(dailyForm.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    addExpense({
      title: dailyForm.title.trim() || `${dailyForm.category} Expense`,
      category: dailyForm.category,
      type: dailyForm.type,
      amount: amt,
      date: dailyForm.date,
      paymentMethod: dailyForm.paymentMethod,
      status: 'Paid',
      notes: dailyForm.notes,
      attachment: dailyForm.attachment || undefined
    });

    setIsAddDailyModalOpen(false);
    setDailyForm({
      title: '',
      category: 'Tea',
      type: 'daily',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Cash',
      paidBy: currentUser?.name || 'Owner',
      notes: '',
      attachment: ''
    });
  };

  // Submit Rent Form
  const handleSubmitRent = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(rentForm.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid rent amount.');
      return;
    }

    const [y, m] = rentForm.month.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    addRent({
      month: rentForm.month,
      monthLabel,
      amount: amt,
      paidAmount: rentForm.status === 'Paid' ? amt : 0,
      paymentDate: rentForm.status === 'Paid' ? rentForm.paymentDate : undefined,
      paymentMethod: rentForm.paymentMethod,
      status: rentForm.status,
      notes: rentForm.notes
    });

    setIsAddRentModalOpen(false);
  };

  // Submit Electricity Bill Form
  const handleSubmitElectricity = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(electricityForm.billAmount);
    const units = parseInt(electricityForm.unitsConsumed, 10) || 0;
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid bill amount.');
      return;
    }

    const [y, m] = electricityForm.billingMonth.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    addElectricityBill({
      billingMonth: electricityForm.billingMonth,
      monthLabel,
      billNumber: electricityForm.billNumber || undefined,
      previousReading: electricityForm.previousReading ? parseInt(electricityForm.previousReading, 10) : undefined,
      currentReading: electricityForm.currentReading ? parseInt(electricityForm.currentReading, 10) : undefined,
      unitsConsumed: units,
      billAmount: amt,
      paidAmount: electricityForm.status === 'Paid' ? amt : 0,
      issueDate: electricityForm.issueDate,
      dueDate: electricityForm.dueDate,
      paymentDate: electricityForm.status === 'Paid' ? electricityForm.paymentDate || new Date().toISOString().slice(0, 10) : undefined,
      paymentMethod: electricityForm.paymentMethod,
      status: electricityForm.status,
      notes: electricityForm.notes
    });

    setIsAddElectricityModalOpen(false);
  };

  // Submit License Form
  const handleSubmitLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(licenseForm.renewalCost);
    if (!licenseForm.name.trim() || isNaN(cost) || cost <= 0) {
      alert('Please enter a valid license name and renewal cost.');
      return;
    }

    addLicense({
      name: licenseForm.name.trim(),
      licenseNumber: licenseForm.licenseNumber.trim() || `LIC-${Date.now().toString().slice(-4)}`,
      issuingAuthority: licenseForm.issuingAuthority.trim(),
      issueDate: licenseForm.issueDate,
      expiryDate: licenseForm.expiryDate,
      renewalCost: cost,
      paymentDate: licenseForm.paymentDate || new Date().toISOString().slice(0, 10),
      paymentMethod: licenseForm.paymentMethod,
      status: 'Active',
      notes: licenseForm.notes
    });

    setIsAddLicenseModalOpen(false);
  };

  // Settle Payment Handler
  const handleSettlePayment = () => {
    if (!selectedItemForPayment) return;
    const amt = parseFloat(paymentSettleAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    if (selectedItemForPayment.sourceType === 'rent') {
      markRentPaid(selectedItemForPayment.sourceId, amt, paymentSettleMethod);
    } else if (selectedItemForPayment.sourceType === 'electricity') {
      markElectricityPaid(selectedItemForPayment.sourceId, amt, paymentSettleMethod);
    } else if (selectedItemForPayment.sourceType === 'daily') {
      updateExpense(selectedItemForPayment.sourceId, {
        status: 'Paid',
        paymentMethod: paymentSettleMethod
      });
    }

    setSelectedItemForPayment(null);
  };

  // Void Handler
  const handleConfirmVoid = () => {
    if (!selectedExpenseForVoid) return;
    if (!voidReasonText.trim()) {
      alert('Please specify an official reason for voiding this expense.');
      return;
    }
    voidExpense(selectedExpenseForVoid.id, voidReasonText.trim());
    setSelectedExpenseForVoid(null);
    setVoidReasonText('');
  };

  return (
    <div className="space-y-4 font-sans text-[#202321]">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#202321]">
              Daily & Fixed Operating Expenses
            </h1>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[11px] font-bold text-[#1B4D3E] uppercase tracking-wide">
              P&L Integrated
            </span>
          </div>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Single central ledger for workshop petty cash, daily food & tea, conveyance, workshop rent, electricity bills, and regulatory licenses.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Action Presets */}
          <button
            onClick={() => handleQuickAdd('Tea', 300, 'Workshop Morning & Evening Tea')}
            className="inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] shadow-xs"
          >
            <Coffee className="h-3.5 w-3.5 text-[#B45309]" />
            <span>+ Tea (Rs. 300)</span>
          </button>

          <button
            onClick={() => handleQuickAdd('Breakfast', 800, 'Staff Morning Breakfast')}
            className="inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] shadow-xs"
          >
            <Utensils className="h-3.5 w-3.5 text-[#15803D]" />
            <span>+ Breakfast (Rs. 800)</span>
          </button>

          <button
            onClick={() => handleQuickAdd('Conveyance', 1000, 'Parts Pickup Petrol / Conveyance')}
            className="inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] shadow-xs"
          >
            <Car className="h-3.5 w-3.5 text-[#1B4D3E]" />
            <span>+ Petrol / Travel (Rs. 1,000)</span>
          </button>

          {/* Primary Add Expense Button */}
          <button
            onClick={() => setIsAddDailyModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Ribbon (Month Overview & Grand Outflow) */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 lg:grid-cols-5 shadow-xs">
        {/* Today's Expenses */}
        <div className="p-3.5">
          <div className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Today's Expenses
          </div>
          <div className="mt-1 text-[22px] font-bold font-mono text-[#202321] tabular-nums">
            {formatPKR(dashboardStats.todayExpenses)}
          </div>
          <div className="text-[11px] text-[#6B706D] mt-0.5">
            Petty cash, tea & conveyance
          </div>
        </div>

        {/* Selected Month Total */}
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
              {monthlySummary.monthLabel} Outflow
            </span>
          </div>
          <div className="mt-1 text-[22px] font-bold font-mono text-[#DC2626] tabular-nums">
            {formatPKR(monthlySummary.totalExpenses)}
          </div>
          <div className="text-[11px] text-[#6B706D] mt-0.5">
            Daily + Paid fixed overheads
          </div>
        </div>

        {/* Pending Expenses */}
        <div className="p-3.5">
          <div className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Pending Liabilities
          </div>
          <div className="mt-1 text-[22px] font-bold font-mono text-[#B45309] tabular-nums">
            {formatPKR(monthlySummary.pendingExpenses)}
          </div>
          <div className="text-[11px] text-[#6B706D] mt-0.5">
            Unpaid rent & bills
          </div>
        </div>

        {/* Overdue Bills */}
        <div className="p-3.5">
          <div className="text-[12px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Overdue Bills
          </div>
          <div className="mt-1 text-[22px] font-bold font-mono text-[#DC2626] tabular-nums">
            {formatPKR(monthlySummary.overdueBills)}
          </div>
          <div className="text-[11px] text-[#6B706D] mt-0.5">
            Past payment due date
          </div>
        </div>

        {/* Fixed Monthly Cost */}
        <div className="p-3.5 bg-[#FAFAF9] col-span-2 lg:col-span-1">
          <div className="text-[12px] font-semibold text-[#1B4D3E] uppercase tracking-wider">
            Fixed Monthly Cost
          </div>
          <div className="mt-1 text-[22px] font-bold font-mono text-[#1B4D3E] tabular-nums">
            {formatPKR(monthlySummary.fixedMonthlyCost)}
          </div>
          <div className="text-[11px] text-[#6B706D] mt-0.5">
            Rent + Power + Licenses + Utilities
          </div>
        </div>
      </div>

      {/* 3. Section Navigation & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 rounded border border-[#DCDDD9] shadow-xs">
        {/* Module Sub-tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Daily & Workshop Expenses</span>
          </button>

          <button
            onClick={() => setActiveTab('rent')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rent'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Workshop Rent</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {rents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('electricity')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'electricity'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Electricity Bills</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {electricityBills.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('licenses')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'licenses'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>License & Legal Fees</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {licenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Yearly Breakdown</span>
          </button>
        </div>

        {/* Global Month & Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#6B706D]">
            <span className="font-semibold text-[#202321]">Month:</span>
            <select
              value={selectedMonth}
              onChange={e => {
                setSelectedMonth(e.target.value);
                setDateRangeFilter('selected_month');
              }}
              className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-semibold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
            >
              {availableMonths.map(m => {
                const [y, mm] = m.split('-');
                const d = new Date(parseInt(y, 10), parseInt(mm, 10) - 1, 1);
                const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Context Add button based on tab */}
          {activeTab === 'rent' && (
            <button
              onClick={() => setIsAddRentModalOpen(true)}
              className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#153E32]"
            >
              <Plus className="h-3 w-3" />
              <span>Record Rent</span>
            </button>
          )}

          {activeTab === 'electricity' && (
            <button
              onClick={() => setIsAddElectricityModalOpen(true)}
              className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#153E32]"
            >
              <Plus className="h-3 w-3" />
              <span>Add Bill</span>
            </button>
          )}

          {activeTab === 'licenses' && (
            <button
              onClick={() => setIsAddLicenseModalOpen(true)}
              className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#153E32]"
            >
              <Plus className="h-3 w-3" />
              <span>Add License</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Monthly Expense Summary & Category Breakdown Cards (Requirements 17 & 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Monthly Cost Matrix */}
        <div className="lg:col-span-2 rounded border border-[#DCDDD9] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2.5 mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#202321]">
                {monthlySummary.monthLabel} Expense Summary (ماہانہ اخراجات کا خلاصہ)
              </h2>
              <span className="text-[11px] text-[#6B706D]">
                Detailed breakdown across operational daily costs and fixed workshop overheads
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-[#6B706D] block">
                Total Month Expenses
              </span>
              <span className="text-lg font-bold font-mono text-[#DC2626]">
                {formatPKR(monthlySummary.totalExpenses)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9]">
              <span className="text-[10px] uppercase font-semibold text-[#6B706D] block">
                Daily Expenses
              </span>
              <span className="text-base font-bold font-mono text-[#202321] mt-1 block">
                {formatPKR(monthlySummary.dailyExpenses)}
              </span>
              <span className="text-[10px] text-[#6B706D]">Food, tea, travel</span>
            </div>

            <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9]">
              <span className="text-[10px] uppercase font-semibold text-[#6B706D] block">
                Workshop Rent
              </span>
              <span className="text-base font-bold font-mono text-[#1B4D3E] mt-1 block">
                {formatPKR(monthlySummary.rent)}
              </span>
              <span className="text-[10px] text-[#6B706D]">Premises rent</span>
            </div>

            <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9]">
              <span className="text-[10px] uppercase font-semibold text-[#6B706D] block">
                Electricity
              </span>
              <span className="text-base font-bold font-mono text-[#202321] mt-1 block">
                {formatPKR(monthlySummary.electricity)}
              </span>
              <span className="text-[10px] text-[#6B706D]">Commercial power</span>
            </div>

            <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9]">
              <span className="text-[10px] uppercase font-semibold text-[#6B706D] block">
                License & Legal
              </span>
              <span className="text-base font-bold font-mono text-[#202321] mt-1 block">
                {formatPKR(monthlySummary.licenseLegal)}
              </span>
              <span className="text-[10px] text-[#6B706D]">Permits & renewals</span>
            </div>

            <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9]">
              <span className="text-[10px] uppercase font-semibold text-[#6B706D] block">
                Other Fixed
              </span>
              <span className="text-base font-bold font-mono text-[#202321] mt-1 block">
                {formatPKR(monthlySummary.otherFixed)}
              </span>
              <span className="text-[10px] text-[#6B706D]">Net, water, guard</span>
            </div>
          </div>
        </div>

        {/* Right Col: Category Breakdown Table (Requirement 18) */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2.5 mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
              Expense Category Breakdown
            </h3>
            <span className="text-[11px] font-mono font-semibold text-[#6B706D]">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          <div className="divide-y divide-[#DCDDD9] text-xs max-h-48 overflow-y-auto">
            {categoryBreakdown.length === 0 ? (
              <div className="py-4 text-center text-[#6B706D] italic">
                No paid expenses recorded for this month.
              </div>
            ) : (
              categoryBreakdown.map(item => (
                <div key={item.category} className="py-1.5 flex items-center justify-between">
                  <span className="text-[#202321] font-medium">{item.category}</span>
                  <span className="font-mono font-semibold text-[#DC2626]">
                    {formatPKR(item.amount)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t-2 border-[#1B4D3E] pt-2 mt-2 flex items-center justify-between text-xs font-bold">
            <span className="text-[#1B4D3E]">Total Paid Expenses</span>
            <span className="font-mono text-sm text-[#1B4D3E]">
              {formatPKR(monthlySummary.totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Sub-Module Content Views */}

      {/* ========================================================================= */}
      {/* VIEW 1: DAILY & WORKSHOP EXPENSES TABLE                                  */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
          {/* Table Header Filter Toolbar */}
          <div className="p-3 border-b border-[#DCDDD9] bg-[#FAFAF9] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#6B706D]" />
                <input
                  type="text"
                  placeholder="Search daily expenses, tea, petrol, description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-medium text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Tea">Tea (چائے)</option>
                <option value="Breakfast">Breakfast (ناشتہ)</option>
                <option value="Lunch">Lunch (دوپہر کا کھانا)</option>
                <option value="Dinner">Dinner (رات کا کھانا)</option>
                <option value="Conveyance">Conveyance / Petrol (پٹرول / کرایہ)</option>
                <option value="Cleaning">Cleaning & Waste</option>
                <option value="Shop Supplies">Shop Supplies</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateRangeFilter}
                onChange={e => setDateRangeFilter(e.target.value)}
                className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-medium text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
              >
                <option value="this_month">This Month</option>
                <option value="today">Today</option>
                <option value="selected_month">Month: {monthlySummary.monthLabel}</option>
                <option value="2026">Year 2026</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-3 py-2.5 text-right font-mono">Amount</th>
                  <th className="px-3 py-2.5 text-center">Payment Method</th>
                  <th className="px-3 py-2.5">Paid By</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#6B706D]">
                      No daily expenses found matching your active filters.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(item => {
                    const isVoid = item.paymentStatus === 'Void';
                    const rawExp = expenses.find(e => e.id === item.sourceId);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#F5F5F3] transition-colors ${
                          isVoid ? 'bg-[#FEF2F2]/50 opacity-60 line-through' : ''
                        }`}
                      >
                        <td className="px-4 py-2 font-mono text-[#6B706D]">
                          {item.date}
                        </td>
                        <td className="px-3 py-2 font-semibold text-[#202321]">
                          <span className="inline-block rounded bg-[#F5F5F3] px-2 py-0.5 text-[11px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium text-[#202321]">
                          <div>{item.title}</div>
                          {item.notes && (
                            <div className="text-[10px] text-[#6B706D] no-underline">
                              {item.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-[#DC2626]">
                          {formatPKR(item.amount)}
                        </td>
                        <td className="px-3 py-2 text-center text-[#6B706D]">
                          {item.paymentMethod}
                        </td>
                        <td className="px-3 py-2 text-[#6B706D]">
                          {item.paidBy || 'Owner'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              item.paymentStatus === 'Paid'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : item.paymentStatus === 'Void'
                                ? 'bg-[#FEE2E2] text-[#DC2626]'
                                : 'bg-[#FEF3C7] text-[#B45309]'
                            }`}
                          >
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isVoid && isOwner && rawExp && (
                              <button
                                onClick={() => {
                                  setSelectedExpenseForVoid(rawExp);
                                  setVoidReasonText('');
                                }}
                                className="text-[11px] font-semibold text-[#DC2626] hover:underline"
                                title="Void/Reverse transaction"
                              >
                                Void
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: WORKSHOP RENT MANAGEMENT (Requirement 8, 9, 10)                  */}
      {/* ========================================================================= */}
      {activeTab === 'rent' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Monthly Rent Liability
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-[#1B4D3E]">
                {formatPKR(80000)}
              </div>
              <span className="text-[10px] text-[#6B706D]">Fixed monthly premises lease</span>
            </div>

            <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Active Leased Premises
              </span>
              <div className="mt-1 text-xl font-bold text-[#202321]">
                Main Service Bay Complex
              </div>
              <span className="text-[10px] text-[#6B706D]">Landlord: Malik Jahangir</span>
            </div>

            <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Current Rent Status
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#15803D]" />
                <span className="text-base font-bold text-[#15803D]">
                  September 2026 Paid
                </span>
              </div>
              <span className="text-[10px] text-[#6B706D]">Cleared on 05 Sep 2026 via Bank</span>
            </div>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
            <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between text-xs">
              <h3 className="font-bold text-[#202321] uppercase tracking-wider">
                Workshop Rent History & Records
              </h3>
              <button
                onClick={() => setIsAddRentModalOpen(true)}
                className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#153E32]"
              >
                <Plus className="h-3 w-3" />
                <span>Add Rent Month</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Month</th>
                  <th className="px-3 py-2.5 text-right font-mono">Rent Amount</th>
                  <th className="px-3 py-2.5 text-right font-mono">Paid Amount</th>
                  <th className="px-3 py-2.5 text-center">Payment Date</th>
                  <th className="px-3 py-2.5 text-center">Payment Method</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5">Notes</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {rents.map(r => (
                  <tr key={r.id} className="hover:bg-[#F5F5F3]">
                    <td className="px-4 py-2 font-semibold text-[#202321]">
                      {r.monthLabel || r.month}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-[#202321]">
                      {formatPKR(r.amount)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-[#15803D]">
                      {formatPKR(r.paidAmount || 0)}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-[#6B706D]">
                      {r.paymentDate || '—'}
                    </td>
                    <td className="px-3 py-2 text-center text-[#6B706D]">
                      {r.paymentMethod}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          r.status === 'Paid'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : r.status === 'Pending'
                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                            : 'bg-[#FEF3C7] text-[#B45309]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#6B706D] text-[11px]">
                      {r.notes || '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.status !== 'Paid' && (
                        <button
                          onClick={() => {
                            setSelectedItemForPayment({
                              id: r.id,
                              sourceType: 'rent',
                              sourceId: r.id,
                              title: `Workshop Rent (${r.monthLabel})`,
                              category: 'Rent',
                              typeGroup: 'FIXED',
                              amount: r.amount,
                              paidAmount: r.paidAmount,
                              pendingAmount: r.amount - r.paidAmount,
                              date: new Date().toISOString().slice(0, 10),
                              monthKey: r.month,
                              paymentMethod: r.paymentMethod,
                              paymentStatus: r.status
                            });
                            setPaymentSettleAmount((r.amount - (r.paidAmount || 0)).toString());
                          }}
                          className="rounded bg-[#1B4D3E] px-2 py-0.5 text-[10px] font-bold text-white hover:bg-[#153E32]"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ELECTRICITY BILLS (Requirement 14, 15, 16)                        */}
      {/* ========================================================================= */}
      {activeTab === 'electricity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Connection Type
              </span>
              <div className="mt-1 text-base font-bold text-[#202321]">
                3-Phase Industrial / Commercial
              </div>
              <span className="text-[10px] text-[#6B706D]">DISCO: LESCO Workshop Feeder</span>
            </div>

            <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                September Consumption
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-[#202321]">
                780 Units (kWh)
              </div>
              <span className="text-[10px] text-[#6B706D]">Reading: 14,200 → 14,980</span>
            </div>

            <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                September Bill Amount
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-[#1B4D3E]">
                {formatPKR(27400)}
              </div>
              <span className="text-[10px] text-[#15803D] font-semibold">Cleared on 15 Sep 2026</span>
            </div>

            <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
              <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Overdue Status
              </span>
              <div className="mt-1 text-xl font-bold font-mono text-[#15803D]">
                Rs. 0 Overdue
              </div>
              <span className="text-[10px] text-[#6B706D]">All electricity bills up to date</span>
            </div>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
            <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between text-xs">
              <h3 className="font-bold text-[#202321] uppercase tracking-wider">
                Commercial Electricity Meter Ledger
              </h3>
              <button
                onClick={() => setIsAddElectricityModalOpen(true)}
                className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#153E32]"
              >
                <Plus className="h-3 w-3" />
                <span>Log New Bill</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Billing Month</th>
                  <th className="px-3 py-2.5 text-right font-mono">Meter Reading</th>
                  <th className="px-3 py-2.5 text-right font-mono">Units (kWh)</th>
                  <th className="px-3 py-2.5 text-right font-mono">Bill Amount</th>
                  <th className="px-3 py-2.5 text-center">Due Date</th>
                  <th className="px-3 py-2.5 text-center">Payment Date</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {electricityBills.map(b => {
                  const isPaid = b.status === 'Paid';
                  return (
                    <tr key={b.id} className="hover:bg-[#F5F5F3]">
                      <td className="px-4 py-2 font-semibold text-[#202321]">
                        {b.monthLabel || b.billingMonth}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[#6B706D]">
                        {b.previousReading || '—'} → {b.currentReading || '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#202321]">
                        {b.unitsConsumed}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#DC2626]">
                        {formatPKR(b.billAmount)}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-[#6B706D]">
                        {b.dueDate}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-[#15803D]">
                        {b.paymentDate || '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isPaid
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : b.status === 'Overdue'
                              ? 'bg-[#FEE2E2] text-[#DC2626]'
                              : 'bg-[#FEF3C7] text-[#B45309]'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {!isPaid && (
                          <button
                            onClick={() => {
                              setSelectedItemForPayment({
                                id: b.id,
                                sourceType: 'electricity',
                                sourceId: b.id,
                                title: `Electricity Bill (${b.monthLabel})`,
                                category: 'Electricity',
                                typeGroup: 'FIXED',
                                amount: b.billAmount,
                                paidAmount: b.paidAmount,
                                pendingAmount: b.billAmount - (b.paidAmount || 0),
                                date: new Date().toISOString().slice(0, 10),
                                monthKey: b.billingMonth,
                                paymentMethod: b.paymentMethod,
                                paymentStatus: b.status
                              });
                              setPaymentSettleAmount((b.billAmount - (b.paidAmount || 0)).toString());
                            }}
                            className="rounded bg-[#1B4D3E] px-2 py-0.5 text-[10px] font-bold text-white hover:bg-[#153E32]"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: LICENSE & LEGAL FEES (Requirement 11, 12, 13)                    */}
      {/* ========================================================================= */}
      {activeTab === 'licenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {licenses.map(lic => {
              const isExpiring = lic.status === 'Expiring Soon';
              const isExpired = lic.status === 'Expired';
              const isActive = lic.status === 'Active';

              return (
                <div
                  key={lic.id}
                  className={`rounded border p-3.5 bg-white ${
                    isExpiring
                      ? 'border-[#FDE68A] bg-[#FFFBEB]/40'
                      : isExpired
                      ? 'border-[#FECACA] bg-[#FEF2F2]/40'
                      : 'border-[#DCDDD9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isActive
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : isExpiring
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#FEE2E2] text-[#DC2626]'
                      }`}
                    >
                      {lic.status}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B706D]">
                      {lic.licenseNumber}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#202321] text-xs mt-1">
                    {lic.name}
                  </h3>
                  <div className="text-[11px] text-[#6B706D] mt-0.5">
                    Authority: {lic.issuingAuthority}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#DCDDD9] flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-[#6B706D] block">Expiry Date:</span>
                      <span className="font-mono font-semibold text-[#202321]">
                        {lic.expiryDate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#6B706D] block">Renewal Fee:</span>
                      <span className="font-mono font-bold text-[#1B4D3E]">
                        {formatPKR(lic.renewalCost)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
            <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between text-xs">
              <h3 className="font-bold text-[#202321] uppercase tracking-wider">
                Official Regulatory Permits & License Register
              </h3>
              <button
                onClick={() => setIsAddLicenseModalOpen(true)}
                className="inline-flex items-center gap-1 rounded bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#153E32]"
              >
                <Plus className="h-3 w-3" />
                <span>Add Official License</span>
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">License Title</th>
                  <th className="px-3 py-2.5">License #</th>
                  <th className="px-3 py-2.5">Issuing Authority</th>
                  <th className="px-3 py-2.5 text-center">Issue Date</th>
                  <th className="px-3 py-2.5 text-center">Expiry Date</th>
                  <th className="px-3 py-2.5 text-right font-mono">Renewal Cost</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {licenses.map(lic => (
                  <tr key={lic.id} className="hover:bg-[#F5F5F3]">
                    <td className="px-4 py-2 font-semibold text-[#202321]">
                      {lic.name}
                    </td>
                    <td className="px-3 py-2 font-mono text-[#6B706D]">
                      {lic.licenseNumber}
                    </td>
                    <td className="px-3 py-2 text-[#6B706D]">
                      {lic.issuingAuthority}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-[#6B706D]">
                      {lic.issueDate}
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-semibold text-[#202321]">
                      {lic.expiryDate}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-[#1B4D3E]">
                      {formatPKR(lic.renewalCost)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          lic.status === 'Active'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : lic.status === 'Expiring Soon'
                            ? 'bg-[#FEF3C7] text-[#B45309]'
                            : 'bg-[#FEE2E2] text-[#DC2626]'
                        }`}
                      >
                        {lic.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => {
                          const newExp = prompt('Enter new expiry date (YYYY-MM-DD):', '2027-10-14');
                          if (newExp) {
                            recordLicenseRenewal(lic.id, lic.renewalCost, 'Bank Transfer', newExp);
                          }
                        }}
                        className="rounded border border-[#DCDDD9] bg-white px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] hover:bg-[#F5F5F3]"
                      >
                        Renew & Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: YEARLY EXPENSE REPORT & P&L COMPARISON (Requirement 21)           */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
          <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between text-xs">
            <h3 className="font-bold text-[#202321] uppercase tracking-wider">
              2026 Annual Operational & Fixed Cost Matrix (سالانہ حساب کتاب)
            </h3>
            <span className="text-[11px] text-[#6B706D]">
              Generated automatically from actual transaction ledgers without duplicate counting
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Operating Month</th>
                <th className="px-3 py-2.5 text-right font-mono">Daily / Food / Tea</th>
                <th className="px-3 py-2.5 text-right font-mono">Workshop Rent</th>
                <th className="px-3 py-2.5 text-right font-mono">Electricity</th>
                <th className="px-3 py-2.5 text-right font-mono">License & Legal</th>
                <th className="px-3 py-2.5 text-right font-mono">Other Fixed</th>
                <th className="px-4 py-2.5 text-right font-mono font-bold text-[#DC2626]">Total Expenses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9] font-mono">
              {availableMonths.map(m => {
                const summary = calculateMonthlyExpenseSummary(m, unifiedExpenses);
                return (
                  <tr key={m} className="hover:bg-[#F5F5F3]">
                    <td className="px-4 py-2 font-sans font-bold text-[#202321]">
                      {summary.monthLabel}
                    </td>
                    <td className="px-3 py-2 text-right text-[#202321]">
                      {formatPKR(summary.dailyExpenses)}
                    </td>
                    <td className="px-3 py-2 text-right text-[#1B4D3E]">
                      {formatPKR(summary.rent)}
                    </td>
                    <td className="px-3 py-2 text-right text-[#202321]">
                      {formatPKR(summary.electricity)}
                    </td>
                    <td className="px-3 py-2 text-right text-[#202321]">
                      {formatPKR(summary.licenseLegal)}
                    </td>
                    <td className="px-3 py-2 text-right text-[#6B706D]">
                      {formatPKR(summary.otherFixed)}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-sm text-[#DC2626]">
                      {formatPKR(summary.totalExpenses)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD DAILY EXPENSE                                                */}
      {/* ========================================================================= */}
      {isAddDailyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl border border-[#DCDDD9]">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#202321]">
                Record Workshop Operating Expense
              </h3>
              <button
                onClick={() => setIsAddDailyModalOpen(false)}
                className="text-[#6B706D] hover:text-[#202321]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDailyExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Expense Category *
                </label>
                <select
                  value={dailyForm.category}
                  onChange={e => setDailyForm({ ...dailyForm, category: e.target.value as ExpenseCategory })}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                >
                  <optgroup label="Food & Refreshments">
                    <option value="Breakfast">Breakfast (ناشتہ)</option>
                    <option value="Tea">Tea (چائے)</option>
                    <option value="Lunch">Lunch (دوپہر کا کھانا)</option>
                    <option value="Dinner">Dinner (رات کا کھانا)</option>
                    <option value="Staff Food">Staff Food</option>
                    <option value="Guest Food">Guest Food</option>
                  </optgroup>
                  <optgroup label="Conveyance & Transport">
                    <option value="Conveyance">Conveyance / Petrol (پٹرول / رکشہ)</option>
                    <option value="Petrol/Fuel">Petrol / Fuel</option>
                    <option value="Delivery">Delivery / Parts Pickup</option>
                    <option value="Vehicle Transport">Vehicle Transport</option>
                  </optgroup>
                  <optgroup label="Workshop Operations">
                    <option value="Cleaning">Cleaning & Degreaser</option>
                    <option value="Water">Drinking Water</option>
                    <option value="Tools">Tools & Equipment</option>
                    <option value="Small Repairs">Small Workshop Repairs</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Shop Supplies">Shop Supplies</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </optgroup>
                  <optgroup label="Fixed Overheads">
                    <option value="Internet">Internet Bill</option>
                    <option value="Security">Security Guard</option>
                    <option value="Other Fixed">Other Fixed</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Description / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning tea with rusks for technicians"
                  value={dailyForm.title}
                  onChange={e => setDailyForm({ ...dailyForm, title: e.target.value })}
                  className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 300"
                    value={dailyForm.amount}
                    onChange={e => setDailyForm({ ...dailyForm, amount: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dailyForm.date}
                    onChange={e => setDailyForm({ ...dailyForm, date: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={dailyForm.paymentMethod}
                    onChange={e => setDailyForm({ ...dailyForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Paid By
                  </label>
                  <input
                    type="text"
                    value={dailyForm.paidBy}
                    onChange={e => setDailyForm({ ...dailyForm, paidBy: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Notes / Receipt Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details or vendor receipt number..."
                  value={dailyForm.notes}
                  onChange={e => setDailyForm({ ...dailyForm, notes: e.target.value })}
                  className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsAddDailyModalOpen(false)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 font-semibold text-white hover:bg-[#153E32]"
                >
                  Save & Include in P&L
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD RENT RECORD                                                  */}
      {/* ========================================================================= */}
      {isAddRentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl border border-[#DCDDD9]">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#202321]">
                Record Workshop Rent
              </h3>
              <button onClick={() => setIsAddRentModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Rent Month (YYYY-MM) *
                  </label>
                  <input
                    type="month"
                    required
                    value={rentForm.month}
                    onChange={e => setRentForm({ ...rentForm, month: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Rent Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={rentForm.amount}
                    onChange={e => setRentForm({ ...rentForm, amount: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Status
                  </label>
                  <select
                    value={rentForm.status}
                    onChange={e => setRentForm({ ...rentForm, status: e.target.value as any })}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={rentForm.paymentDate}
                    onChange={e => setRentForm({ ...rentForm, paymentDate: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Payment Method
                </label>
                <select
                  value={rentForm.paymentMethod}
                  onChange={e => setRentForm({ ...rentForm, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={rentForm.notes}
                  placeholder="e.g. Paid online to Landlord bank account..."
                  onChange={e => setRentForm({ ...rentForm, notes: e.target.value })}
                  className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsAddRentModalOpen(false)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 font-semibold text-white hover:bg-[#153E32]"
                >
                  Save Rent Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD ELECTRICITY BILL                                             */}
      {/* ========================================================================= */}
      {isAddElectricityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl border border-[#DCDDD9]">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#202321]">
                Record Electricity Bill
              </h3>
              <button onClick={() => setIsAddElectricityModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitElectricity} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Billing Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={electricityForm.billingMonth}
                    onChange={e => setElectricityForm({ ...electricityForm, billingMonth: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Bill Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={electricityForm.billAmount}
                    onChange={e => setElectricityForm({ ...electricityForm, billAmount: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Units (kWh) *
                  </label>
                  <input
                    type="number"
                    required
                    value={electricityForm.unitsConsumed}
                    onChange={e => setElectricityForm({ ...electricityForm, unitsConsumed: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Prev Reading
                  </label>
                  <input
                    type="number"
                    value={electricityForm.previousReading}
                    onChange={e => setElectricityForm({ ...electricityForm, previousReading: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Curr Reading
                  </label>
                  <input
                    type="number"
                    value={electricityForm.currentReading}
                    onChange={e => setElectricityForm({ ...electricityForm, currentReading: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={electricityForm.dueDate}
                    onChange={e => setElectricityForm({ ...electricityForm, dueDate: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Status
                  </label>
                  <select
                    value={electricityForm.status}
                    onChange={e => setElectricityForm({ ...electricityForm, status: e.target.value as any })}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsAddElectricityModalOpen(false)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 font-semibold text-white hover:bg-[#153E32]"
                >
                  Save Bill Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD LICENSE RECORD                                               */}
      {/* ========================================================================= */}
      {isAddLicenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl border border-[#DCDDD9]">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#202321]">
                Add Government License / Legal Permit
              </h3>
              <button onClick={() => setIsAddLicenseModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLicense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  License / Registration Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Municipal Corporation Workshop Trade License"
                  value={licenseForm.name}
                  onChange={e => setLicenseForm({ ...licenseForm, name: e.target.value })}
                  className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MCL-2026-99"
                    value={licenseForm.licenseNumber}
                    onChange={e => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Renewal Cost (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    value={licenseForm.renewalCost}
                    onChange={e => setLicenseForm({ ...licenseForm, renewalCost: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={licenseForm.issueDate}
                    onChange={e => setLicenseForm({ ...licenseForm, issueDate: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#6B706D] mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={licenseForm.expiryDate}
                    onChange={e => setLicenseForm({ ...licenseForm, expiryDate: e.target.value })}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Issuing Authority
                </label>
                <input
                  type="text"
                  value={licenseForm.issuingAuthority}
                  onChange={e => setLicenseForm({ ...licenseForm, issuingAuthority: e.target.value })}
                  className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsAddLicenseModalOpen(false)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 font-semibold text-white hover:bg-[#153E32]"
                >
                  Save License Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SETTLE PENDING PAYMENT                                           */}
      {/* ========================================================================= */}
      {selectedItemForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded bg-white p-5 shadow-xl border border-[#DCDDD9]">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-3">
              <h3 className="text-sm font-bold text-[#202321]">
                Settle Expense Payment
              </h3>
              <button onClick={() => setSelectedItemForPayment(null)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-[#FAFAF9] border border-[#DCDDD9]">
                <span className="font-semibold text-[#202321] block">{selectedItemForPayment.title}</span>
                <div className="flex justify-between text-[#6B706D] mt-1">
                  <span>Pending Balance:</span>
                  <span className="font-mono font-bold text-[#DC2626]">
                    {formatPKR(selectedItemForPayment.pendingAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Payment Amount to Disburse (Rs.)
                </label>
                <input
                  type="number"
                  value={paymentSettleAmount}
                  onChange={e => setPaymentSettleAmount(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Disbursed Via
                </label>
                <select
                  value={paymentSettleMethod}
                  onChange={e => setPaymentSettleMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                >
                  <option value="Cash">Cash (کیش)</option>
                  <option value="Bank Transfer">Bank Transfer (بینک ٹرانسفر)</option>
                  <option value="Card">Card</option>
                  <option value="Other">Online / Mobile Wallet</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setSelectedItemForPayment(null)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSettlePayment}
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 font-semibold text-white hover:bg-[#153E32]"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: OWNER VOID REVERSAL (Requirement 29)                             */}
      {/* ========================================================================= */}
      {selectedExpenseForVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded bg-white p-5 shadow-xl border border-[#DC2626]">
            <div className="flex items-center justify-between border-b border-[#FCA5A5] pb-3 mb-3">
              <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Financial Void / Reversal</span>
              </h3>
              <button onClick={() => setSelectedExpenseForVoid(null)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#6B706D]">
                To maintain accurate accounting audit records, voided transactions are not deleted; they are marked as <strong>Void</strong> with reason logged into the immutable audit trail.
              </p>

              <div className="p-2.5 rounded bg-[#FEF2F2] border border-[#FCA5A5]">
                <span className="font-semibold text-[#202321] block">{selectedExpenseForVoid.title}</span>
                <span className="font-mono text-xs font-bold text-[#DC2626] block mt-0.5">
                  Amount: {formatPKR(selectedExpenseForVoid.amount)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#6B706D] mb-1">
                  Reason for Reversal / Void *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Erroneous duplicate entry by staff"
                  value={voidReasonText}
                  onChange={e => setVoidReasonText(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#DC2626] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setSelectedExpenseForVoid(null)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVoid}
                  className="rounded bg-[#DC2626] px-4 py-1.5 font-semibold text-white hover:bg-[#B91C1C]"
                >
                  Confirm Void
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
