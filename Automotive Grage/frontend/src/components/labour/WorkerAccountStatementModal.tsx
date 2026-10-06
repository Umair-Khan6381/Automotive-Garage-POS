import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  Download,
  HardHat,
  Banknote,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Eye,
  FileCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { LabourWorker, LabourPayment, JobCard, ShopSettings, PaymentProof } from '../../types';
import { formatPKR, formatDate, formatDateTime } from '../../utils/formatters';
import { PaymentProofModal } from '../common/PaymentProofModal';
import { printDocument } from '../../utils/printUtils';

interface WorkerAccountStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: LabourWorker;
  payments: LabourPayment[];
  jobCards: JobCard[];
  settings: ShopSettings;
  currentUserName: string;
  currentUserId: string;
}

export const WorkerAccountStatementModal: React.FC<WorkerAccountStatementModalProps> = ({
  isOpen,
  onClose,
  worker,
  payments,
  jobCards,
  settings,
  currentUserName,
  currentUserId
}) => {
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);

  if (!isOpen) return null;

  // Filter payments for this specific worker
  const workerPayments = payments
    .filter(p => p.labourId === worker.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter all job assignments for this worker
  interface WorkItem {
    id: string;
    date: string;
    jobNumber: string;
    description: string;
    customerCharge: number;
    workerEarned: number;
    isCommission: boolean;
    commissionPct?: number;
  }

  const workItems: WorkItem[] = [];
  jobCards.forEach(job => {
    job.assignedLabour.forEach(la => {
      if (la.labourId === worker.id) {
        workItems.push({
          id: `${job.id}-${la.id}`,
          date: job.date,
          jobNumber: job.jobNumber,
          description: la.notes || `${worker.role} service`,
          customerCharge: la.customerCharge,
          workerEarned: la.costToShop,
          isCommission: la.rateType === 'commission' || (la.commissionPercentage !== undefined && la.commissionPercentage > 0),
          commissionPct: la.commissionPercentage
        });
      }
    });
  });

  workItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Aggregate earned & paid
  const totalEarnedFromJobs = workItems.reduce((acc, item) => acc + item.workerEarned, 0);
  const totalPaidOut = workerPayments.reduce((acc, p) => acc + p.amount, 0);
  
  // Base daily rate demo offset if any
  const baseEarned = Math.max(totalEarnedFromJobs, (worker.dailyRate || 0) * 12);
  const totalEarned = totalEarnedFromJobs > 0 ? totalEarnedFromJobs : baseEarned;
  const remainingBalance = Math.max(0, totalEarned - totalPaidOut);

  // Build unified chronological statement rows:
  interface StatementRow {
    id: string;
    date: string;
    type: 'earned' | 'payment';
    description: string;
    reference: string;
    earnedAmount?: number;
    paidAmount?: number;
    runningBalance: number;
    paidBy?: string;
    proof?: PaymentProof;
  }

  const statementRows: StatementRow[] = [];
  let currentBalance = 0;

  // Interleave and sort by date
  type RawEntry = { date: string; type: 'earned' | 'payment'; data: WorkItem | LabourPayment };
  const allEvents: RawEntry[] = [
    ...workItems.map(w => ({ date: w.date, type: 'earned' as const, data: w })),
    ...workerPayments.map(p => ({ date: p.date, type: 'payment' as const, data: p }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (allEvents.length === 0 && totalEarned > 0) {
    // Demo row if synthetic
    statementRows.push({
      id: 'demo-1',
      date: worker.joiningDate || '2026-09-01',
      type: 'earned',
      description: 'Monthly Work / Services Rendered',
      reference: 'ACC-OPEN',
      earnedAmount: totalEarned,
      runningBalance: totalEarned
    });
  } else {
    allEvents.forEach((ev, idx) => {
      if (ev.type === 'earned') {
        const item = ev.data as WorkItem;
        currentBalance += item.workerEarned;
        statementRows.push({
          id: `stmt-${idx}`,
          date: item.date,
          type: 'earned',
          description: `${item.description} ${item.isCommission ? `(${item.commissionPct}% Comm)` : ''}`,
          reference: item.jobNumber,
          earnedAmount: item.workerEarned,
          runningBalance: currentBalance
        });
      } else {
        const pay = ev.data as LabourPayment;
        currentBalance -= pay.amount;
        statementRows.push({
          id: `stmt-${idx}`,
          date: pay.date,
          type: 'payment',
          description: `Disbursement: ${pay.paymentPeriod || 'Wage Payout'} (${pay.paymentMethod})`,
          reference: pay.receiptNumber || 'VOUCHER',
          paidAmount: pay.amount,
          runningBalance: currentBalance,
          paidBy: pay.paidByName || pay.paidBy,
          proof: pay.proofAttachment
        });
      }
    });
  }

  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  const handlePrint = () => {
    printDocument({
      title: `Worker_Statement_${worker.name}_${worker.workerCode || worker.id}`,
      elementId: 'printable-worker-statement',
      onAfterPrint: () => {
        setPrintFeedback('Statement sent to printer');
        setTimeout(() => setPrintFeedback(null), 3000);
      }
    });
    setPrintFeedback('Printing statement...');
    setTimeout(() => setPrintFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/50 p-4 backdrop-blur-2xs font-sans">
      <div className="w-full max-w-3xl rounded-lg border border-[#DCDDD9] bg-white p-5 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#E8F0EC] text-[#1B4D3E]">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#202321]">
                  Worker Account Statement (اکاؤنٹ اسٹیٹمنٹ)
                </h3>
                <span className="rounded bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#92400E] border border-[#FDE68A]">
                  {worker.role}
                </span>
              </div>
              <p className="text-xs text-[#6B706D]">
                {worker.name} · {worker.phone} {worker.workerCode ? `(${worker.workerCode})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Statement Container */}
        <div id="printable-worker-statement" className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs print-container">
          {/* Top Business & Worker Header */}
          <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="font-bold text-base text-[#202321]">
                {settings.garageName || settings.shopName || 'Umair Auto Care'}
              </h2>
              <p className="text-[11px] text-[#6B706D]">
                Automotive Workshop Floor & Technicians Payroll Division
              </p>
              <div className="mt-2 text-[11px] space-y-0.5">
                <div>
                  <span className="text-[#6B706D]">Worker ID:</span>{' '}
                  <strong className="font-mono text-[#202321]">{worker.workerCode || worker.id.slice(-6).toUpperCase()}</strong>
                </div>
                <div>
                  <span className="text-[#6B706D]">Agreed Model:</span>{' '}
                  <span className="font-semibold text-[#1B4D3E]">
                    {worker.rateType === 'commission'
                      ? `Commission (${worker.commissionPercentage || 40}% Share)`
                      : `Daily Wage (${formatPKR(worker.dailyRate)}/day)`}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B706D]">Joining Date:</span>{' '}
                  <span className="text-[#202321]">{formatDate(worker.joiningDate)}</span>
                </div>
              </div>
            </div>

            {/* Earned -> Paid -> Remaining Cards */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              <div className="rounded bg-white border border-[#DCDDD9] p-2.5 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Total Earned</span>
                <span className="font-mono font-bold text-sm text-[#202321]">
                  {formatPKR(totalEarned)}
                </span>
                <span className="text-[9px] text-[#15803D] block mt-0.5">Work / Commission</span>
              </div>

              <div className="rounded bg-white border border-[#DCDDD9] p-2.5 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Total Paid</span>
                <span className="font-mono font-bold text-sm text-[#1B4D3E]">
                  {formatPKR(totalPaidOut)}
                </span>
                <span className="text-[9px] text-[#6B706D] block mt-0.5">{workerPayments.length} Payments</span>
              </div>

              <div className="rounded bg-[#FEF3C7] border border-[#FDE68A] p-2.5 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#92400E] block">Remaining</span>
                <span className="font-mono font-black text-sm text-[#B45309]">
                  {formatPKR(remainingBalance)}
                </span>
                <span className="text-[9px] text-[#92400E] font-semibold block mt-0.5">Payable Balance</span>
              </div>
            </div>
          </div>

          {/* Statement Table */}
          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
            <div className="p-2.5 bg-[#F5F5F3] border-b border-[#DCDDD9] font-bold text-xs text-[#202321] flex justify-between items-center">
              <span>Account Statement Ledger (Earned → Paid → Balance)</span>
              <span className="text-[11px] font-mono text-[#6B706D]">{statementRows.length} Entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] border-b border-[#DCDDD9] text-[10px] uppercase font-bold text-[#6B706D]">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Ref #</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Earned (+)</th>
                    <th className="py-2 px-3 text-right">Paid (-)</th>
                    <th className="py-2 px-3 text-right">Balance</th>
                    <th className="py-2 px-3 text-center no-print">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDDD9]">
                  {statementRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-[#6B706D]">
                        No transactions recorded for this worker yet.
                      </td>
                    </tr>
                  ) : (
                    statementRows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#FAFAF9] transition-colors">
                        <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                          {formatDate(row.date)}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[#6B706D]">
                          {row.reference}
                        </td>
                        <td className="py-2 px-3 font-medium text-[#202321]">
                          <div>{row.description}</div>
                          {row.paidBy && (
                            <span className="text-[10px] text-[#6B706D]">Paid by: {row.paidBy}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-[#15803D]">
                          {row.earnedAmount ? formatPKR(row.earnedAmount) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#1B4D3E]">
                          {row.paidAmount ? formatPKR(row.paidAmount) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#202321]">
                          {formatPKR(row.runningBalance)}
                        </td>
                        <td className="py-2 px-3 text-center no-print">
                          {row.proof ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProof(row.proof!);
                                setProofModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] hover:bg-[#A7D0C0] transition-colors"
                              title="View uploaded salary proof"
                            >
                              <FileCheck className="h-3 w-3" />
                              <span>Proof</span>
                            </button>
                          ) : (
                            <span className="text-[#DCDDD9]">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-[#F5F5F3] font-bold border-t-2 border-[#DCDDD9] text-xs">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-[#202321]">
                      Total Net Summary
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#15803D]">
                      {formatPKR(totalEarned)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#1B4D3E]">
                      {formatPKR(totalPaidOut)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#B45309] font-black">
                      {formatPKR(remainingBalance)}
                    </td>
                    <td className="no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#DCDDD9] mt-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Account Statement</span>
          </button>
        </div>
      </div>

      {/* Proof Modal */}
      {selectedProof && (
        <PaymentProofModal
          isOpen={proofModalOpen}
          onClose={() => {
            setProofModalOpen(false);
            setSelectedProof(null);
          }}
          title={`Salary Payment Proof — ${worker.name}`}
          referenceNumber={worker.workerCode || worker.name}
          proof={selectedProof}
          readOnly={true}
          currentUserName={currentUserName}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};
