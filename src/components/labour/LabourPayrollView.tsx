import React, { useState } from 'react';
import {
  Banknote,
  Plus,
  Search,
  CheckCircle,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PaymentMethod } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

export const LabourPayrollView: React.FC = () => {
  const { labourWorkers, labourPayments, jobCards, recordLabourPayment } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLabourId, setSelectedLabourId] = useState('');
  const [payAmount, setPayAmount] = useState(15000);
  const [payPeriod, setPayPeriod] = useState('Week 38, Sept 2026');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payRef, setPayRef] = useState(`WAGE-${Date.now().toString().slice(-4)}`);
  const [payNotes, setPayNotes] = useState('Weekly wage settlement');

  const openPayModal = (labourId?: string) => {
    setSelectedLabourId(labourId || labourWorkers[0]?.id || '');
    setPayAmount(15000);
    setPayPeriod('Week 38, Sept 2026');
    setPayMethod('Cash');
    setPayRef(`WAGE-${Date.now().toString().slice(-4)}`);
    setPayNotes('Weekly wage settlement');
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

  // Compute stats per worker
  const workerStats = labourWorkers.map(w => {
    let totalEarned = 0;
    let totalJobs = 0;

    jobCards.forEach(j => {
      const assigned = j.assignedLabour.filter(l => l.labourId === w.id);
      if (assigned.length > 0) {
        totalJobs += 1;
        assigned.forEach(a => {
          totalEarned += a.costToShop * a.units;
        });
      }
    });

    // Payments to worker
    const paidToWorker = labourPayments
      .filter(p => p.labourId === w.id)
      .reduce((acc, p) => acc + p.amount, 0);

    const balancePayable = Math.max(0, totalEarned - paidToWorker);

    return {
      worker: w,
      totalJobs,
      totalEarned,
      paidToWorker,
      balancePayable
    };
  });

  const totalDisbursed = labourPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstandingWages = workerStats.reduce((acc, w) => acc + w.balancePayable, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Technician Labour Payroll & Wage Disbursements
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Track jobs completed, cumulative wage earnings, disbursements, and payable balances
          </p>
        </div>

        <button
          onClick={() => openPayModal()}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Disburse Mechanic Wage</span>
        </button>
      </div>

      {/* Summary Ribbon */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 sm:grid-cols-3">
        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Total Wages Disbursed
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
            {formatPKR(totalDisbursed)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            {labourPayments.length} wage payment slips issued
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Outstanding Payable
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#B45309]">
            {formatPKR(totalOutstandingWages)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Pending mechanic disbursement
          </div>
        </div>

        <div className="p-3 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Active Staff on Floor
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#15803D]">
            {labourWorkers.length} Mechanics
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            All registered workshop personnel
          </div>
        </div>
      </div>

      {/* Worker Balances Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
            Technician Balance Ledger
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Technician</th>
                <th className="px-3 py-2.5">Role</th>
                <th className="px-3 py-2.5 text-center">Jobs Serviced</th>
                <th className="px-3 py-2.5 text-right">Total Earned</th>
                <th className="px-3 py-2.5 text-right">Disbursed (Paid)</th>
                <th className="px-3 py-2.5 text-right">Payable Balance</th>
                <th className="px-3.5 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {workerStats.map(s => (
                <tr key={s.worker.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="px-3.5 py-2.5 font-semibold text-[#202321]">
                    {s.worker.name}
                  </td>

                  <td className="px-3 py-2.5 text-[#6B706D]">
                    {s.worker.role}
                  </td>

                  <td className="px-3 py-2.5 text-center font-mono font-bold text-[#1B4D3E]">
                    {s.totalJobs}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono text-[#202321] tabular-nums font-medium">
                    {formatPKR(s.totalEarned)}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono text-[#15803D] tabular-nums">
                    {formatPKR(s.paidToWorker)}
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono font-bold tabular-nums">
                    <span className={s.balancePayable > 0 ? 'text-[#B45309]' : 'text-[#6B706D]'}>
                      {formatPKR(s.balancePayable)}
                    </span>
                  </td>

                  <td className="px-3.5 py-2.5 text-right">
                    <button
                      onClick={() => openPayModal(s.worker.id)}
                      className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-semibold text-[#1B4D3E] hover:bg-[#E8F0EC]"
                    >
                      Disburse Pay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Log */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
            Recent Wage Disbursement Receipts ({labourPayments.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Receipt #</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Technician</th>
                <th className="px-3 py-2.5">Period / Notes</th>
                <th className="px-3 py-2.5">Method</th>
                <th className="px-3.5 py-2.5 text-right">Amount (PKR)</th>
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
                      {p.paymentPeriod} · {p.notes}
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
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Record Wage Disbursement
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Technician *</label>
                <select
                  value={selectedLabourId}
                  onChange={e => setSelectedLabourId(e.target.value)}
                  required
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  {labourWorkers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Disbursement Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono font-bold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
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
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
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
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Receipt Reference</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Remarks</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Issue Payment & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
