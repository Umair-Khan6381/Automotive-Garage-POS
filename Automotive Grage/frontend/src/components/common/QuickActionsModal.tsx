import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Wrench,
  CreditCard,
  Receipt,
  ShoppingCart,
  Droplet,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  Car,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PaymentMethod, ExpenseCategory, LabourRateType } from '../../types';
import { formatAED } from '../../utils/formatters';

export const QuickActionsModal: React.FC = () => {
  const {
    isQuickActionsOpen,
    setIsQuickActionsOpen,
    quickActionTargetModal,
    setQuickActionTargetModal,
    setActiveView,
    customers,
    vehicles,
    products,
    labourWorkers,
    invoices,
    createJobCard,
    addExpense,
    recordInvoicePayment,
    setSelectedJobId,
    currentUser,
    settings
  } = useShop();

  // Floating speed dial mini-menu open state
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  // Success flash toast
  const [successToast, setSuccessToast] = useState<{ title: string; message: string; viewTarget?: string; recordId?: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Global Keyboard Shortcut: 'Q' or 'Shift+Q' opens Quick Actions Hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.key === 'q' || e.key === 'Q') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsQuickActionsOpen(!isQuickActionsOpen);
      } else if (e.key === 'Escape') {
        if (quickActionTargetModal) {
          setQuickActionTargetModal(null);
        } else if (isQuickActionsOpen) {
          setIsQuickActionsOpen(false);
        } else if (isFabMenuOpen) {
          setIsFabMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickActionsOpen, quickActionTargetModal, isFabMenuOpen]);

  // -------------------------------------------------------------
  // STATE: 1. CREATE NEW JOB
  // -------------------------------------------------------------
  const [jobCustomerId, setJobCustomerId] = useState<string>('');
  const [jobVehicleId, setJobVehicleId] = useState<string>('');
  const [jobMileage, setJobMileage] = useState<number>(55000);
  const [jobComplaint, setJobComplaint] = useState<string>('');
  const [jobWorkerId, setJobWorkerId] = useState<string>('');
  const [jobEstimatedCost, setJobEstimatedCost] = useState<number>(350);

  // Initialize defaults when opening job modal
  useEffect(() => {
    if (quickActionTargetModal === 'job') {
      const firstCust = customers[0]?.id || '';
      setJobCustomerId(firstCust);
      const matchingVeh = vehicles.find(v => v.customerId === firstCust)?.id || vehicles[0]?.id || '';
      setJobVehicleId(matchingVeh);
      const vehObj = vehicles.find(v => v.id === matchingVeh);
      if (vehObj) setJobMileage(vehObj.mileage || 50000);
      setJobWorkerId(labourWorkers[0]?.id || '');
      setJobComplaint('');
      setJobEstimatedCost(350);
    }
  }, [quickActionTargetModal, customers, vehicles, labourWorkers]);

  // Update vehicle dropdown when customer changes
  const handleCustomerChangeForJob = (cId: string) => {
    setJobCustomerId(cId);
    const match = vehicles.find(v => v.customerId === cId);
    if (match) {
      setJobVehicleId(match.id);
      setJobMileage(match.mileage);
    } else {
      setJobVehicleId(vehicles[0]?.id || '');
    }
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobCustomerId || !jobVehicleId || !jobComplaint.trim()) {
      alert('Please select customer, vehicle, and describe the complaint.');
      return;
    }

    const workerObj = labourWorkers.find(w => w.id === jobWorkerId);
    const assignedLabour = workerObj
      ? [
          {
            id: `la-${Date.now()}`,
            labourId: workerObj.id,
            labourName: workerObj.name,
            rateType: (workerObj.rateType || 'fixed') as LabourRateType,
            rate: workerObj.dailyRate || 100,
            units: 1,
            costToShop: workerObj.dailyRate || 80,
            customerCharge: jobEstimatedCost > 0 ? jobEstimatedCost : 150
          }
        ]
      : [];

    const dateToday = new Date().toISOString().slice(0, 10);
    const newJob = createJobCard({
      jobNumber: `JC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      customerId: jobCustomerId,
      vehicleId: jobVehicleId,
      date: dateToday,
      mileage: jobMileage,
      complaint: jobComplaint.trim(),
      inspectionNotes: 'Intake created via Quick Actions',
      assignedLabour,
      partsUsed: [],
      additionalServices: [],
      estimatedCost: jobEstimatedCost,
      finalCost: jobEstimatedCost,
      status: 'waiting'
    });

    setQuickActionTargetModal(null);
    setIsQuickActionsOpen(false);
    setSuccessToast({
      title: 'Job Card Created',
      message: `${newJob.jobNumber} created successfully for customer.`,
      viewTarget: 'jobs',
      recordId: newJob.id
    });
  };

  // -------------------------------------------------------------
  // STATE: 2. RECORD EXPENSE
  // -------------------------------------------------------------
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Staff Food');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<number>(45);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('Cash');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const handleRecordExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDescription.trim() || expenseAmount <= 0) {
      alert('Please enter a description and valid amount.');
      return;
    }

    addExpense({
      title: expenseDescription.trim(),
      category: expenseCategory,
      type: 'daily',
      amount: expenseAmount,
      paymentMethod: expensePaymentMethod,
      date: expenseDate,
      status: 'Paid',
      notes: 'Logged via Quick Actions'
    });

    setQuickActionTargetModal(null);
    setIsQuickActionsOpen(false);
    setSuccessToast({
      title: 'Expense Recorded',
      message: `${formatAED(expenseAmount)} logged under ${expenseCategory} (${expensePaymentMethod}).`,
      viewTarget: 'expenses'
    });
  };

  // -------------------------------------------------------------
  // STATE: 3. PROCESS PAYMENT
  // -------------------------------------------------------------
  // Unpaid or partially paid invoices
  const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'Paid' && i.paymentStatus !== 'Cancelled' && i.balanceDue > 0);
  const [selectedPayInvoiceId, setSelectedPayInvoiceId] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payReference, setPayReference] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  useEffect(() => {
    if (quickActionTargetModal === 'payment') {
      if (unpaidInvoices.length > 0) {
        setSelectedPayInvoiceId(unpaidInvoices[0].id);
        setPayAmount(unpaidInvoices[0].balanceDue);
      } else if (invoices.length > 0) {
        setSelectedPayInvoiceId(invoices[0].id);
        setPayAmount(invoices[0].balanceDue || invoices[0].grandTotal);
      }
      setPayMethod('Cash');
      setPayReference('');
      setPayNotes('');
    }
  }, [quickActionTargetModal, unpaidInvoices.length]);

  const activePayInvoice = invoices.find(i => i.id === selectedPayInvoiceId);
  const activePayCustomer = customers.find(c => c.id === activePayInvoice?.customerId);
  const activePayVehicle = vehicles.find(v => v.id === activePayInvoice?.vehicleId);

  const handleProcessPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayInvoiceId || payAmount <= 0) {
      alert('Please select an invoice and enter amount to collect.');
      return;
    }

    recordInvoicePayment(selectedPayInvoiceId, payAmount, payMethod, payReference, payNotes);

    setQuickActionTargetModal(null);
    setIsQuickActionsOpen(false);
    setSuccessToast({
      title: 'Payment Processed',
      message: `Successfully collected ${formatAED(payAmount)} on invoice ${activePayInvoice?.invoiceNumber || ''}.`,
      viewTarget: 'invoices',
      recordId: selectedPayInvoiceId
    });
  };

  // Quick complaint tags for New Job
  const quickComplaints = [
    'Periodic Engine Oil & Filter Change',
    'Brake Pad Noise / Rotor Inspection',
    'AC Gas Recharge & Cooling Check',
    'Suspension Noise Over Bumps',
    'Computer OBD Diagnostic Scan',
    'Battery Test & Alternator Check'
  ];

  return (
    <>
      {/* -------------------------------------------------------------
          FLOATING ACTION BUTTON (FAB) & SPEED DIAL
          Positioned fixed bottom-right, accessible across all pages
          ------------------------------------------------------------- */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
        {/* Speed Dial Menu Items (Expanded) */}
        {isFabMenuOpen && (
          <div className="mb-3 flex flex-col items-end gap-2 transition-all duration-200">
            {/* Action 1: Create Job Card */}
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#202321] px-2 py-0.5 text-[11px] font-medium text-white shadow-md">
                Create New Job (J)
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFabMenuOpen(false);
                  setQuickActionTargetModal('job');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4D3E] text-white shadow-lg hover:bg-[#153E32] active:scale-95 transition-all"
                title="Create New Job"
              >
                <Wrench className="h-4 w-4" />
              </button>
            </div>

            {/* Action 2: Process Payment */}
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#202321] px-2 py-0.5 text-[11px] font-medium text-white shadow-md">
                Process Payment (P)
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFabMenuOpen(false);
                  setQuickActionTargetModal('payment');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4D3E] text-white shadow-lg hover:bg-[#153E32] active:scale-95 transition-all"
                title="Process Payment"
              >
                <CreditCard className="h-4 w-4" />
              </button>
            </div>

            {/* Action 3: Record Expense */}
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#202321] px-2 py-0.5 text-[11px] font-medium text-white shadow-md">
                Record Expense (E)
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFabMenuOpen(false);
                  setQuickActionTargetModal('expense');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4D3E] text-white shadow-lg hover:bg-[#153E32] active:scale-95 transition-all"
                title="Record Expense"
              >
                <Receipt className="h-4 w-4" />
              </button>
            </div>

            {/* Action 4: Counter POS */}
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#202321] px-2 py-0.5 text-[11px] font-medium text-white shadow-md">
                Counter POS Sale
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFabMenuOpen(false);
                  setActiveView('pos');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#DCDDD9] text-[#1B4D3E] shadow-md hover:bg-[#F5F5F3] active:scale-95 transition-all"
                title="Counter POS"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full text-white shadow-xl transition-all duration-200 cursor-pointer ${
            isFabMenuOpen
              ? 'bg-[#202321] rotate-45'
              : 'bg-[#1B4D3E] hover:bg-[#153E32] hover:scale-105 active:scale-95 ring-2 ring-white/80'
          }`}
          title="Quick Workshop Actions (Press Q from anywhere)"
          aria-label="Quick Actions"
        >
          {isFabMenuOpen ? (
            <Plus className="h-6 w-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Zap className="h-5 w-5 text-amber-300 fill-amber-300" />
            </div>
          )}
        </button>
      </div>

      {/* -------------------------------------------------------------
          MAIN QUICK ACTIONS COMMAND HUB MODAL
          Triggered via Header Button, keyboard 'Q', or FAB
          ------------------------------------------------------------- */}
      {isQuickActionsOpen && !quickActionTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-xl rounded-xl border border-[#DCDDD9] bg-white p-5 shadow-2xl transition-all animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0EC] text-[#1B4D3E]">
                  <Zap className="h-4 w-4 fill-[#1B4D3E]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#202321] tracking-tight">
                    Quick Workshop Actions
                  </h2>
                  <p className="text-xs text-[#6B706D]">
                    Rapid floor intake, payment collection, and expense logging
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-block rounded border border-[#DCDDD9] bg-[#F5F5F3] px-1.5 py-0.5 text-[10px] font-mono text-[#6B706D]">
                  ESC to close
                </kbd>
                <button
                  type="button"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 3 Primary Action Tiles */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tile 1: Create New Job */}
              <button
                type="button"
                onClick={() => setQuickActionTargetModal('job')}
                className="group flex flex-col justify-between rounded-lg border border-[#DCDDD9] p-4 text-left transition-all hover:border-[#1B4D3E] hover:bg-[#F8FAF9] hover:shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E8F0EC] text-[#1B4D3E] group-hover:bg-[#1B4D3E] group-hover:text-white transition-colors">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-bold text-sm text-[#202321] group-hover:text-[#1B4D3E]">
                    Create New Job
                  </div>
                  <div className="mt-1 text-[11px] text-[#6B706D] leading-relaxed">
                    Car check-in, assign technician, record complaints.
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#1B4D3E]">
                  <span>Start Intake</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Tile 2: Process Payment */}
              <button
                type="button"
                onClick={() => setQuickActionTargetModal('payment')}
                className="group flex flex-col justify-between rounded-lg border border-[#DCDDD9] p-4 text-left transition-all hover:border-[#1B4D3E] hover:bg-[#F8FAF9] hover:shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-[#B45309] group-hover:bg-[#B45309] group-hover:text-white transition-colors">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-bold text-sm text-[#202321] group-hover:text-[#B45309]">
                    Process Payment
                  </div>
                  <div className="mt-1 text-[11px] text-[#6B706D] leading-relaxed">
                    Settle invoices, collect cash/card, print customer receipt.
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#B45309]">
                  <span>Collect Funds</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Tile 3: Record Expense */}
              <button
                type="button"
                onClick={() => setQuickActionTargetModal('expense')}
                className="group flex flex-col justify-between rounded-lg border border-[#DCDDD9] p-4 text-left transition-all hover:border-[#1B4D3E] hover:bg-[#F8FAF9] hover:shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-[#DC2626] group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-bold text-sm text-[#202321] group-hover:text-[#DC2626]">
                    Record Expense
                  </div>
                  <div className="mt-1 text-[11px] text-[#6B706D] leading-relaxed">
                    Log daily tea/food, petrol, conveyance, small repairs.
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#DC2626]">
                  <span>Log Expense</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Secondary Workshop Shortcuts */}
            <div className="mt-4 pt-3 border-t border-[#DCDDD9]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B706D] mb-2">
                Secondary Workshop Links
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    setActiveView('pos');
                  }}
                  className="flex items-center gap-2 p-2 rounded border border-[#DCDDD9] bg-[#FAFAF9] hover:bg-white hover:border-[#1B4D3E] text-xs font-medium text-[#202321] transition-all cursor-pointer"
                >
                  <ShoppingCart className="h-3.5 w-3.5 text-[#1B4D3E]" />
                  <span>Counter POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    setActiveView('oil_changes');
                  }}
                  className="flex items-center gap-2 p-2 rounded border border-[#DCDDD9] bg-[#FAFAF9] hover:bg-white hover:border-[#1B4D3E] text-xs font-medium text-[#202321] transition-all cursor-pointer"
                >
                  <Droplet className="h-3.5 w-3.5 text-[#1B4D3E]" />
                  <span>Oil Service</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    setActiveView('customers');
                  }}
                  className="flex items-center gap-2 p-2 rounded border border-[#DCDDD9] bg-[#FAFAF9] hover:bg-white hover:border-[#1B4D3E] text-xs font-medium text-[#202321] transition-all cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-[#1B4D3E]" />
                  <span>New Client</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    setActiveView('inventory');
                  }}
                  className="flex items-center gap-2 p-2 rounded border border-[#DCDDD9] bg-[#FAFAF9] hover:bg-white hover:border-[#1B4D3E] text-xs font-medium text-[#202321] transition-all cursor-pointer"
                >
                  <DollarSign className="h-3.5 w-3.5 text-[#1B4D3E]" />
                  <span>Parts Catalog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-MODAL 1: CREATE NEW JOB
          ------------------------------------------------------------- */}
      {quickActionTargetModal === 'job' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-[#DCDDD9] bg-white p-5 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E8F0EC] text-[#1B4D3E]">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202321]">
                    Rapid Job Card Intake
                  </h3>
                  <p className="text-[11px] text-[#6B706D]">
                    Check in customer vehicle and assign technician
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickActionTargetModal(null)}
                className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="mt-4 space-y-3.5">
              {/* Customer Selector */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Customer
                </label>
                <select
                  value={jobCustomerId}
                  onChange={e => handleCustomerChangeForJob(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Selector & Current Mileage */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Vehicle
                  </label>
                  <select
                    value={jobVehicleId}
                    onChange={e => {
                      setJobVehicleId(e.target.value);
                      const v = vehicles.find(veh => veh.id === e.target.value);
                      if (v) setJobMileage(v.mileage);
                    }}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                    required
                  >
                    {vehicles
                      .filter(v => !jobCustomerId || v.customerId === jobCustomerId)
                      .concat(vehicles.filter(v => jobCustomerId && v.customerId !== jobCustomerId))
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          {v.registrationNumber} — {v.make} {v.model}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Current Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={jobMileage}
                    onChange={e => setJobMileage(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-mono text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Complaint / Work Requested */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Customer Complaint / Service Requested
                </label>
                <textarea
                  value={jobComplaint}
                  onChange={e => setJobComplaint(e.target.value)}
                  placeholder="e.g. Engine oil change, squeaking front brakes, AC blowing warm air..."
                  rows={2}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] placeholder-[#9CA3AF] focus:border-[#1B4D3E] focus:outline-none"
                  required
                />
                {/* Quick Tag Pills */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {quickComplaints.map(qc => (
                    <button
                      key={qc}
                      type="button"
                      onClick={() => setJobComplaint(prev => (prev ? `${prev}, ${qc}` : qc))}
                      className="rounded bg-[#F5F5F3] px-1.5 py-0.5 text-[10px] text-[#6B706D] hover:bg-[#E8F0EC] hover:text-[#1B4D3E] transition-colors"
                    >
                      + {qc.split(' ')[0]} {qc.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Technician & Estimated Total */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={jobWorkerId}
                    onChange={e => setJobWorkerId(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  >
                    {labourWorkers.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Estimated Cost (AED)
                  </label>
                  <input
                    type="number"
                    value={jobEstimatedCost}
                    onChange={e => setJobEstimatedCost(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#1B4D3E] focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#DCDDD9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickActionTargetModal(null)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 text-xs font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] shadow-xs active:scale-[0.98] transition-all"
                >
                  Create & Assign Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-MODAL 2: RECORD EXPENSE
          ------------------------------------------------------------- */}
      {quickActionTargetModal === 'expense' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-xl border border-[#DCDDD9] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-[#DC2626]">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202321]">
                    Rapid Expense Entry
                  </h3>
                  <p className="text-[11px] text-[#6B706D]">
                    Log petty cash, workshop supplies, delivery, or food
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickActionTargetModal(null)}
                className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordExpenseSubmit} className="mt-4 space-y-3">
              {/* Category */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Expense Category
                </label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                >
                  {([
                    'Staff Food',
                    'Tea',
                    'Lunch',
                    'Breakfast',
                    'Dinner',
                    'Conveyance',
                    'Petrol/Fuel',
                    'Delivery',
                    'Vehicle Transport',
                    'Cleaning',
                    'Water',
                    'Tools',
                    'Small Repairs',
                    'Maintenance',
                    'Shop Supplies',
                    'Stationery',
                    'Miscellaneous'
                  ] as ExpenseCategory[]).map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Description / Vendor
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={e => setExpenseDescription(e.target.value)}
                  placeholder="e.g. Lunch for mechanics, Brake cleaner spray, Petrol receipt..."
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] placeholder-[#9CA3AF] focus:border-[#1B4D3E] focus:outline-none"
                  required
                />
              </div>

              {/* Amount & Payment Method */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Amount (AED)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-[#DC2626] focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={expensePaymentMethod}
                    onChange={e => setExpensePaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="Cash">Cash (Petty Cash Drawer)</option>
                    <option value="Card">Shop Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Date & Recorded By Info */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-mono text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Paid By
                  </label>
                  <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] px-2.5 py-1.5 text-xs text-[#6B706D] truncate">
                    {currentUser?.name || 'Current User'}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#DCDDD9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickActionTargetModal(null)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 text-xs font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] shadow-xs active:scale-[0.98] transition-all"
                >
                  Save & Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-MODAL 3: PROCESS PAYMENT
          ------------------------------------------------------------- */}
      {quickActionTargetModal === 'payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-xl border border-[#DCDDD9] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-[#B45309]">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202321]">
                    Process Customer Payment
                  </h3>
                  <p className="text-[11px] text-[#6B706D]">
                    Settle receivables, collect funds, issue receipt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickActionTargetModal(null)}
                className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProcessPaymentSubmit} className="mt-4 space-y-3">
              {/* Invoice Selection */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Select Unsettled Invoice
                </label>
                {unpaidInvoices.length === 0 ? (
                  <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2.5 text-xs text-[#6B706D]">
                    No overdue or partially paid customer invoices found. Select any invoice below to record extra collection:
                    <select
                      value={selectedPayInvoiceId}
                      onChange={e => {
                        setSelectedPayInvoiceId(e.target.value);
                        const inv = invoices.find(i => i.id === e.target.value);
                        if (inv) setPayAmount(inv.balanceDue || inv.grandTotal);
                      }}
                      className="mt-2 w-full rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs text-[#202321]"
                    >
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} — {inv.paymentStatus} ({formatAED(inv.grandTotal)})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <select
                    value={selectedPayInvoiceId}
                    onChange={e => {
                      setSelectedPayInvoiceId(e.target.value);
                      const inv = invoices.find(i => i.id === e.target.value);
                      if (inv) setPayAmount(inv.balanceDue);
                    }}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-mono text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                    required
                  >
                    {unpaidInvoices.map(inv => {
                      const cust = customers.find(c => c.id === inv.customerId);
                      return (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} · {cust?.fullName || 'Client'} · Due: {formatAED(inv.balanceDue)}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Invoice Summary Card */}
              {activePayInvoice && (
                <div className="rounded-lg border border-[#DCDDD9] bg-[#F8FAF9] p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-[#6B706D]">
                    <span>Customer:</span>
                    <span className="font-semibold text-[#202321]">{activePayCustomer?.fullName || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#6B706D]">
                    <span>Vehicle Plate:</span>
                    <span className="font-mono font-semibold text-[#1B4D3E]">{activePayVehicle?.registrationNumber || 'Counter Sale'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#6B706D]">
                    <span>Invoice Grand Total:</span>
                    <span className="font-mono">{formatAED(activePayInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#6B706D]">
                    <span>Already Received:</span>
                    <span className="font-mono text-[#15803D]">{formatAED(activePayInvoice.paidAmount)}</span>
                  </div>
                  <div className="pt-1 border-t border-[#DCDDD9] flex justify-between items-center font-bold text-sm">
                    <span className="text-[#B45309]">Outstanding Balance:</span>
                    <span className="font-mono text-[#DC2626]">{formatAED(activePayInvoice.balanceDue)}</span>
                  </div>
                </div>
              )}

              {/* Amount to Collect & Quick Fill Button */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-[#6B706D]">
                    Amount to Collect (AED)
                  </label>
                  {activePayInvoice && activePayInvoice.balanceDue > 0 && (
                    <button
                      type="button"
                      onClick={() => setPayAmount(activePayInvoice.balanceDue)}
                      className="text-[10px] text-[#1B4D3E] hover:underline font-bold"
                    >
                      Pay Full Balance ({formatAED(activePayInvoice.balanceDue)})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-base font-mono font-bold text-[#15803D] focus:border-[#1B4D3E] focus:outline-none"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Cash', 'Card', 'Bank Transfer', 'Online'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPayMethod(pm)}
                      className={`py-1.5 px-2 rounded text-xs font-semibold text-center border transition-all ${
                        payMethod === pm
                          ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E]'
                          : 'border-[#DCDDD9] bg-white text-[#6B706D] hover:bg-[#F5F5F3]'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Reference / Approval Code (Optional)
                </label>
                <input
                  type="text"
                  value={payReference}
                  onChange={e => setPayReference(e.target.value)}
                  placeholder="e.g. Card POS Auth Code / Bank Wire Ref"
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] placeholder-[#9CA3AF] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#DCDDD9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickActionTargetModal(null)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 text-xs font-medium text-[#6B706D] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] shadow-xs active:scale-[0.98] transition-all"
                >
                  Collect & Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUCCESS TOAST FEEDBACK
          ------------------------------------------------------------- */}
      {successToast && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-3 rounded-lg border border-[#A7D7C5] bg-[#E8F0EC] px-4 py-3 shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-[#1B4D3E] shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-[#1B4D3E]">{successToast.title}</div>
            <div className="text-[#202321] mt-0.5">{successToast.message}</div>
          </div>
          {successToast.viewTarget && (
            <button
              onClick={() => {
                if (successToast.viewTarget) {
                  setActiveView(successToast.viewTarget as any);
                }
                if (successToast.recordId && successToast.viewTarget === 'jobs') {
                  setSelectedJobId(successToast.recordId);
                }
                setSuccessToast(null);
              }}
              className="ml-2 rounded bg-[#1B4D3E] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#153E32] transition-colors"
            >
              View
            </button>
          )}
          <button
            onClick={() => setSuccessToast(null)}
            className="text-[#6B706D] hover:text-[#202321] ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
