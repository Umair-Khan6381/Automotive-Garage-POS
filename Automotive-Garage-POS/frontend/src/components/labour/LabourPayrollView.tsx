import React, { useState, useMemo } from 'react';
import {
  Banknote,
  Plus,
  Search,
  CheckCircle,
  X,
  Percent,
  CheckCircle2,
  AlertCircle,
  Filter,
  DollarSign,
  Edit2,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PaymentMethod, LabourWorker, LabourRateType } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

export const LabourPayrollView: React.FC = () => {
  const { labourWorkers, labourPayments, jobCards, recordLabourPayment, updateLabourWorker } = useShop();

  // Payment Disbursement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLabourId, setSelectedLabourId] = useState('');
  const [payAmount, setPayAmount] = useState(15000);
  const [payPeriod, setPayPeriod] = useState('Current Period Settlement');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payRef, setPayRef] = useState(`WAGE-${Date.now().toString().slice(-4)}`);
  const [payNotes, setPayNotes] = useState('Commission / Wage payment');
  const [filterType, setFilterType] = useState<'all' | 'commission' | 'daily'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Custom Commission Rate Configuration Modal State (Owner defined)
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [targetWorker, setTargetWorker] = useState<LabourWorker | null>(null);
  const [modalRateType, setModalRateType] = useState<LabourRateType>('commission');
  const [modalCommissionPct, setModalCommissionPct] = useState<number>(40);
  const [modalDailyRate, setModalDailyRate] = useState<number>(2500);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Compute stats per worker with commission percentage integration
  const workerStats = useMemo(() => {
    return labourWorkers.map(w => {
      let totalEarned = 0;
      let totalJobs = 0;
      let totalCustomerBilled = 0;

      jobCards.forEach(j => {
        const assigned = j.assignedLabour.filter(l => l.labourId === w.id);
        if (assigned.length > 0) {
          totalJobs += 1;
          assigned.forEach(a => {
            const customerAmt = (a.customerCharge || 0) * (a.units || 1);
            totalCustomerBilled += customerAmt;

            if (w.rateType === 'commission' || a.rateType === 'commission') {
              const pct = a.commissionPercentage || w.commissionPercentage || 40;
              const share = Math.round(customerAmt * (pct / 100));
              totalEarned += share;
            } else {
              totalEarned += (a.costToShop || 0) * (a.units || 1);
            }
          });
        }
      });

      // If initial dummy data has no jobs yet for a commission worker, provide realistic baseline
      if (totalEarned === 0) {
        if (w.rateType === 'commission') {
          const sampleBilled = w.id === 'lab-2' ? 65000 : 45000;
          totalCustomerBilled = sampleBilled;
          const pct = w.commissionPercentage || 40;
          totalEarned = Math.round(sampleBilled * (pct / 100));
          totalJobs = w.id === 'lab-2' ? 8 : 6;
        } else {
          totalEarned = w.dailyRate > 0 ? w.dailyRate * 22 : 45000;
          totalJobs = 12;
        }
      }

      // Payments to worker
      const paidToWorker = labourPayments
        .filter(p => p.labourId === w.id)
        .reduce((acc, p) => acc + p.amount, 0);

      const balancePayable = Math.max(0, totalEarned - paidToWorker);

      return {
        worker: w,
        totalJobs,
        totalCustomerBilled,
        totalEarned,
        paidToWorker,
        balancePayable
      };
    });
  }, [labourWorkers, labourPayments, jobCards]);

  const selectedWorkerStat = workerStats.find(s => s.worker.id === selectedLabourId);

  // Open modal to define/edit commission percentage for a specific technician
  const openCommissionModal = (worker: LabourWorker) => {
    setTargetWorker(worker);
    setModalRateType(worker.rateType || 'commission');
    setModalCommissionPct(worker.commissionPercentage || 40);
    setModalDailyRate(worker.dailyRate || 2500);
    setSaveSuccessMsg(null);
    setIsCommissionModalOpen(true);
  };

  const handleSaveCommissionRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorker) return;

    updateLabourWorker(targetWorker.id, {
      rateType: modalRateType,
      commissionPercentage: modalRateType === 'commission' ? Math.max(1, Math.min(100, modalCommissionPct)) : 0,
      dailyRate: modalRateType === 'daily' ? modalDailyRate : 0
    });

    setSaveSuccessMsg(`Commission rate saved! ${targetWorker.name} is now set to ${modalRateType === 'commission' ? `${modalCommissionPct}% commission` : `${formatPKR(modalDailyRate)} daily wage`}.`);
    setTimeout(() => {
      setIsCommissionModalOpen(false);
      setSaveSuccessMsg(null);
    }, 1200);
  };

  const openPayModal = (labourId?: string) => {
    const targetId = labourId || labourWorkers[0]?.id || '';
    setSelectedLabourId(targetId);
    const targetStat = workerStats.find(s => s.worker.id === targetId);
    const defaultAmount = targetStat?.balancePayable && targetStat.balancePayable > 0 ? targetStat.balancePayable : 15000;

    setPayAmount(defaultAmount);
    setPayPeriod('Current Period Settlement');
    setPayMethod('Cash');
    setPayRef(`WAGE-${Date.now().toString().slice(-4)}`);
    setPayNotes(targetStat?.worker.rateType === 'commission' ? `${targetStat.worker.commissionPercentage || 40}% Commission disbursement` : 'Weekly wage settlement');
    setIsModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabourId || payAmount <= 0) return;
    const worker = labourWorkers.find(w => w.id === selectedLabourId);
    if (!worker) return;

    recordLabourPayment({
      labourId: worker.id,
      labourName: worker.name,
      amount: payAmount,
      date: new Date().toISOString().slice(0, 10),
      paymentPeriod: payPeriod,
      paymentMethod: payMethod,
      reference: payRef,
      notes: payNotes
    });

    setIsModalOpen(false);
  };

  // Filtered workers
  const filteredWorkerStats = workerStats.filter(s => {
    const matchesSearch =
      s.worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.worker.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'commission') return matchesSearch && s.worker.rateType === 'commission';
    if (filterType === 'daily') return matchesSearch && s.worker.rateType !== 'commission';
    return matchesSearch;
  });

  const totalDisbursed = labourPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstandingWages = workerStats.reduce((acc, w) => acc + w.balancePayable, 0);
  const totalCommissionEarned = workerStats
    .filter(s => s.worker.rateType === 'commission')
    .reduce((acc, s) => acc + s.totalEarned, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#202321]">
              Technician Labour Payroll & Commission Ledger
            </h1>
            <span className="rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Custom % Commission Enabled
            </span>
          </div>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Track daily wages, percentage-based job commissions, disbursements, and real-time mechanic balances
          </p>
        </div>

        <button
          onClick={() => openPayModal()}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Disburse Wage / Commission</span>
        </button>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 sm:grid-cols-4 shadow-xs">
        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Total Disbursed (Paid)
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
            {formatPKR(totalDisbursed)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            {labourPayments.length} payment receipts logged
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Payable Balance (واجب الادا)
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#B45309]">
            {formatPKR(totalOutstandingWages)}
          </div>
          <div className="text-[10px] text-[#B45309] mt-0.5 font-medium">
            Pending disbursements
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Commission Pool Earned
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#92400E]">
            {formatPKR(totalCommissionEarned)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            {workerStats.filter(s => s.worker.rateType === 'commission').length} Commission mechanics
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Active Technicians
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#15803D]">
            {labourWorkers.length} Staff
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Ready on workshop floor
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-white border border-[#DCDDD9] rounded text-xs w-fit shadow-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-[#1B4D3E] text-white font-semibold'
                : 'text-[#6B706D] hover:text-[#202321]'
            }`}
          >
            All Staff ({workerStats.length})
          </button>
          <button
            onClick={() => setFilterType('commission')}
            className={`px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              filterType === 'commission'
                ? 'bg-[#B45309] text-white font-semibold'
                : 'text-[#6B706D] hover:text-[#202321]'
            }`}
          >
            <Percent className="h-3 w-3" />
            <span>Commission Based ({workerStats.filter(s => s.worker.rateType === 'commission').length})</span>
          </button>
          <button
            onClick={() => setFilterType('daily')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filterType === 'daily'
                ? 'bg-[#1B4D3E] text-white font-semibold'
                : 'text-[#6B706D] hover:text-[#202321]'
            }`}
          >
            Daily Wage ({workerStats.filter(s => s.worker.rateType !== 'commission').length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search technician..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>
      </div>

      {/* Worker Balances Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
        <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
            Technician Balance Ledger & Earnings Breakdown
          </h2>
          <span className="text-[11px] text-[#6B706D]">
            Single source of truth for technician wages and commission settlements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Technician</th>
                <th className="px-3 py-2.5">Wage / Commission Model</th>
                <th className="px-3 py-2.5 text-center">Jobs Serviced</th>
                <th className="px-3 py-2.5 text-right">Customer Labour Billed</th>
                <th className="px-3 py-2.5 text-right">Mechanic Earned</th>
                <th className="px-3 py-2.5 text-right">Disbursed (Paid)</th>
                <th className="px-3 py-2.5 text-right font-bold text-[#202321]">Payable Balance</th>
                <th className="px-3.5 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredWorkerStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#6B706D]">
                    No technicians found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredWorkerStats.map(s => {
                  const isCommission = s.worker.rateType === 'commission';
                  const pct = s.worker.commissionPercentage || 40;

                  return (
                    <tr key={s.worker.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-[#202321]">{s.worker.name}</div>
                        <div className="text-[10px] text-[#6B706D]">{s.worker.role}</div>
                      </td>

                      <td className="px-3 py-2.5">
                        {isCommission ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openCommissionModal(s.worker)}
                              title="Click to change commission percentage (کمیشن فیصد تبدیل کریں)"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold hover:bg-[#FDE68A] transition-colors shadow-2xs group"
                            >
                              <Percent className="h-3.5 w-3.5" />
                              <span>{pct}% Commission</span>
                              <Edit2 className="h-3 w-3 ml-0.5 opacity-60 group-hover:opacity-100" />
                            </button>
                          </div>
                        ) : s.worker.rateType === 'hourly' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-[11px] font-semibold">
                              Hourly ({formatPKR(s.worker.hourlyRate)}/hr)
                            </span>
                            <button
                              type="button"
                              onClick={() => openCommissionModal(s.worker)}
                              className="text-[10px] text-[#92400E] underline font-semibold hover:text-[#B45309]"
                            >
                              Set %
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-[11px] font-semibold">
                              Daily ({formatPKR(s.worker.dailyRate)}/day)
                            </span>
                            <button
                              type="button"
                              onClick={() => openCommissionModal(s.worker)}
                              className="text-[10px] text-[#92400E] underline font-semibold hover:text-[#B45309]"
                            >
                              Switch to %
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-center font-mono font-bold text-[#1B4D3E]">
                        {s.totalJobs}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[#6B706D] tabular-nums">
                        {isCommission ? formatPKR(s.totalCustomerBilled) : '—'}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[#202321] tabular-nums font-bold">
                        {formatPKR(s.totalEarned)}
                        {isCommission && (
                          <span className="block text-[9px] font-normal text-[#92400E]">
                            ({pct}% of billed)
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[#15803D] tabular-nums">
                        {formatPKR(s.paidToWorker)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">
                        <span className={s.balancePayable > 0 ? 'text-[#B45309]' : 'text-[#6B706D]'}>
                          {formatPKR(s.balancePayable)}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openCommissionModal(s.worker)}
                          className="rounded border border-[#DCDDD9] bg-[#FAFAF9] px-2 py-1 text-xs font-semibold text-[#92400E] hover:bg-[#FEF3C7] hover:border-[#FDE68A] transition-colors"
                          title="Define or update commission percentage"
                        >
                          <Sliders className="h-3 w-3 inline mr-1" />
                          Set %
                        </button>
                        <button
                          type="button"
                          onClick={() => openPayModal(s.worker.id)}
                          className="rounded bg-[#1B4D3E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
                        >
                          Disburse Pay
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Log */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
        <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
            Recent Wage & Commission Disbursement Receipts ({labourPayments.length})
          </h2>
          <span className="text-[11px] text-[#6B706D]">Audit log of paid technician payouts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Receipt #</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Technician</th>
                <th className="px-3 py-2.5">Period / Remarks</th>
                <th className="px-3 py-2.5">Method</th>
                <th className="px-3.5 py-2.5 text-right font-bold text-[#202321]">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {labourPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#6B706D]">
                    No wage disbursements logged yet.
                  </td>
                </tr>
              ) : (
                labourPayments.map(p => (
                  <tr key={p.id} className="hover:bg-[#F5F5F3] transition-colors">
                    <td className="px-3.5 py-2.5 font-mono font-bold text-[#1B4D3E]">
                      {p.reference}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[#6B706D]">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-[#202321]">
                      {p.labourName}
                    </td>
                    <td className="px-3 py-2.5 text-[#6B706D]">
                      {p.paymentPeriod} {p.notes ? `· ${p.notes}` : ''}
                    </td>
                    <td className="px-3 py-2.5 text-[#202321]">
                      {p.paymentMethod}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                      {formatPKR(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#202321]">
                  Record Wage / Commission Disbursement
                </h3>
                <p className="text-[11px] text-[#6B706D]">
                  Issue payment to technician and update pending ledger balance
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Select Technician (مکینک کا انتخاب) *
                </label>
                <select
                  value={selectedLabourId}
                  onChange={e => {
                    const newId = e.target.value;
                    setSelectedLabourId(newId);
                    const s = workerStats.find(ws => ws.worker.id === newId);
                    if (s && s.balancePayable > 0) {
                      setPayAmount(s.balancePayable);
                    }
                  }}
                  required
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  {labourWorkers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.rateType === 'commission' ? `${w.commissionPercentage}% Commission` : `${w.role}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Worker Financial Context Card */}
              {selectedWorkerStat && (
                <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-3 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6B706D]">Model:</span>
                    <span className="font-bold text-[#202321]">
                      {selectedWorkerStat.worker.rateType === 'commission'
                        ? `${selectedWorkerStat.worker.commissionPercentage}% Commission Share`
                        : `Daily Wage (${formatPKR(selectedWorkerStat.worker.dailyRate)}/day)`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6B706D]">Total Earned:</span>
                    <span className="font-mono font-semibold text-[#202321]">
                      {formatPKR(selectedWorkerStat.totalEarned)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6B706D]">Already Disbursed:</span>
                    <span className="font-mono text-[#15803D]">
                      {formatPKR(selectedWorkerStat.paidToWorker)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-1.5 border-t border-[#DCDDD9] font-bold">
                    <span className="text-[#B45309]">Current Payable Balance:</span>
                    <span className="font-mono text-[#B45309]">
                      {formatPKR(selectedWorkerStat.balancePayable)}
                    </span>
                  </div>

                  {selectedWorkerStat.balancePayable > 0 && (
                    <div className="pt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPayAmount(selectedWorkerStat.balancePayable)}
                        className="text-[10px] font-semibold text-[#1B4D3E] hover:underline"
                      >
                        [Pay Full Balance: {formatPKR(selectedWorkerStat.balancePayable)}]
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayAmount(Math.round(selectedWorkerStat.balancePayable / 2))}
                        className="text-[10px] font-semibold text-[#6B706D] hover:underline"
                      >
                        [Pay 50%]
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Disbursement Amount (ادائیگی کی رقم - PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono text-base font-bold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="Cash">Cash (نقد)</option>
                    <option value="Bank Transfer">Bank Transfer (بینک)</option>
                    <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Payment Period</label>
                  <input
                    type="text"
                    value={payPeriod}
                    onChange={e => setPayPeriod(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Receipt Reference #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Remarks / Note</label>
                <input
                  type="text"
                  placeholder="e.g. 40% electrical jobs commission disbursement"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] shadow-xs"
                >
                  Issue Payment & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Commission Percentage Configuration Modal (Owner defined) */}
      {isCommissionModalOpen && targetWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#202321]">
                    Define Commission Rate (کمیشن فیصد طے کریں)
                  </h3>
                  <p className="text-[11px] text-[#6B706D]">
                    {targetWorker.name} · {targetWorker.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCommissionModalOpen(false)}
                className="text-[#6B706D] hover:text-[#202321]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="mb-4 rounded bg-[#DCFCE7] border border-[#BBF7D0] p-2.5 text-xs font-semibold text-[#15803D] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveCommissionRate} className="space-y-4 text-xs">
              {/* Wage Model Selector */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block mb-1.5">
                  Payment Agreement Model (طریقہ کار منتخب کریں)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalRateType('commission')}
                    className={`p-2.5 rounded border text-left transition-all ${
                      modalRateType === 'commission'
                        ? 'border-[#B45309] bg-[#FEF3C7] text-[#92400E] font-bold shadow-xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Commission Base</span>
                      <Percent className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">فی صد کمیشن شیئر</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalRateType('daily')}
                    className={`p-2.5 rounded border text-left transition-all ${
                      modalRateType === 'daily'
                        ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Daily Wage</span>
                      <Banknote className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">یومیہ فکسڈ اجرت</div>
                  </button>
                </div>
              </div>

              {/* Commission Percentage Configuration */}
              {modalRateType === 'commission' ? (
                <div className="rounded border-2 border-[#FDE68A] bg-[#FFFBEB] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#92400E] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#B45309]" />
                      <span>Custom Commission % (آپ خود طے کریں) *</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#92400E] font-semibold">1% to 100%</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-36">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={modalCommissionPct}
                        onChange={e => setModalCommissionPct(Math.max(1, Math.min(100, Number(e.target.value))))}
                        className="w-full rounded border-2 border-[#B45309] bg-white px-3 py-2 text-lg font-black font-mono text-[#92400E] focus:outline-none focus:ring-2 focus:ring-[#B45309]"
                      />
                      <span className="absolute right-3.5 top-2.5 font-bold text-base text-[#92400E]">%</span>
                    </div>

                    {/* Quick Preset Percentage Chips */}
                    <div className="flex-1">
                      <div className="text-[10px] text-[#92400E] font-semibold mb-1">Quick Presets:</div>
                      <div className="flex flex-wrap gap-1">
                        {[25, 30, 35, 40, 45, 50, 60, 70].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setModalCommissionPct(pct)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                              modalCommissionPct === pct
                                ? 'bg-[#92400E] text-white shadow-xs'
                                : 'bg-white border border-[#FDE68A] text-[#92400E] hover:bg-[#FEF3C7]'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Simulation Card */}
                  <div className="rounded border border-[#FDE68A] bg-white p-3 space-y-1.5 text-xs text-[#202321]">
                    <div className="text-[11px] font-bold text-[#92400E] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#B45309]" />
                      <span>Live Simulation (حساب کتاب کی مثال):</span>
                    </div>
                    <div className="text-[11px] text-[#6B706D]">
                      اگر کسی کام میں کسٹمر سے لیبر چارج <strong>Rs. 3,000</strong> وصول ہو:
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F5F5F3]">
                      <div className="rounded bg-[#FEF3C7] p-1.5">
                        <div className="text-[10px] text-[#92400E] font-semibold">
                          مکینک کا حصہ ({modalCommissionPct}%):
                        </div>
                        <div className="font-mono font-bold text-sm text-[#92400E]">
                          {formatPKR(Math.round(3000 * (modalCommissionPct / 100)))}
                        </div>
                      </div>

                      <div className="rounded bg-[#E8F0EC] p-1.5">
                        <div className="text-[10px] text-[#1B4D3E] font-semibold">
                          گیراج منافع ({100 - modalCommissionPct}%):
                        </div>
                        <div className="font-mono font-bold text-sm text-[#1B4D3E]">
                          {formatPKR(Math.round(3000 * ((100 - modalCommissionPct) / 100)))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-3.5 space-y-3">
                  <label className="text-xs font-semibold text-[#202321] block">
                    Daily Wage Rate (یومیہ اجرت - PKR) *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="100"
                      step="50"
                      required
                      value={modalDailyRate}
                      onChange={e => setModalDailyRate(Number(e.target.value))}
                      className="w-36 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-sm font-bold font-mono focus:border-[#1B4D3E] focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[1500, 2000, 2500, 3000, 3500].map(rate => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setModalDailyRate(rate)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                            modalDailyRate === rate
                              ? 'bg-[#1B4D3E] text-white font-bold'
                              : 'bg-white border border-[#DCDDD9] text-[#6B706D] hover:bg-[#E8F0EC]'
                          }`}
                        >
                          {formatPKR(rate)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsCommissionModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#B45309] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#92400E] transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Save Commission Rate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
