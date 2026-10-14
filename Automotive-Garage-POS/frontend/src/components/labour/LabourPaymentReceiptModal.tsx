import React, { useState } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  HardHat,
  Banknote,
  Calendar,
  Clock,
  User,
  Building
} from 'lucide-react';
import { formatPKR, formatDateTime } from '../../utils/formatters';
import { ShopSettings } from '../../types';
import { printDocument } from '../../utils/printUtils';

interface LabourPaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  receiptNumber: string;
  workerName: string;
  workerRole: string;
  workerCode?: string;
  salaryPeriod: string;
  amountPaid: number;
  paymentMethod: string;
  paymentTimestamp: string;
  paidByName: string;
  remainingPayableAfter: number;
  notes?: string;
}

export const LabourPaymentReceiptModal: React.FC<LabourPaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  settings,
  receiptNumber,
  workerName,
  workerRole,
  workerCode,
  salaryPeriod,
  amountPaid,
  paymentMethod,
  paymentTimestamp,
  paidByName,
  remainingPayableAfter,
  notes
}) => {
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    printDocument({
      title: `Labour_Voucher_${receiptNumber}`,
      elementId: 'printable-labour-receipt',
      onAfterPrint: () => {
        setPrintFeedback('Voucher sent to printer');
        setTimeout(() => setPrintFeedback(null), 3000);
      }
    });
    setPrintFeedback('Printing voucher...');
    setTimeout(() => setPrintFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/50 p-4 backdrop-blur-2xs font-sans">
      <div className="w-full max-w-md rounded-lg border border-[#DCDDD9] bg-white p-5 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4 no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-[#FEF3C7] text-[#92400E]">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#202321]">
                Labour Salary Payment Receipt
              </h3>
              <p className="text-[11px] text-[#6B706D] font-mono">
                {receiptNumber}
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

        {/* Printable Receipt Paper */}
        <div
          id="printable-labour-receipt"
          className="flex-1 overflow-y-auto rounded border border-[#DCDDD9] bg-[#FAFAF9] p-5 text-xs text-[#202321] space-y-4 print-container"
        >
          {/* Business Header */}
          <div className="text-center border-b border-dashed border-[#DCDDD9] pb-3">
            <h2 className="font-bold text-base text-[#202321] uppercase tracking-wide">
              {settings.garageName || settings.shopName || 'Umair Auto Care LLC'}
            </h2>
            <p className="text-[11px] text-[#6B706D] mt-0.5">
              {settings.address || 'Warehouse #14, Street 18A, Al Quoz Industrial Area 3, Dubai, UAE'}
            </p>
            <div className="mt-2 inline-block rounded bg-[#FEF3C7] px-3 py-0.5 font-bold text-xs text-[#92400E] uppercase tracking-wider">
              Technician Wage & Payroll Voucher (سند صرف أجور الفنيين)
            </div>
          </div>

          {/* Reference Details */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-b border-dashed border-[#DCDDD9] pb-3">
            <div>
              <span className="text-[#6B706D] block">Receipt #:</span>
              <span className="font-bold text-xs text-[#202321]">{receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[#6B706D] block">Salary Period:</span>
              <span className="font-bold text-[#202321]">{salaryPeriod}</span>
            </div>
            <div>
              <span className="text-[#6B706D] block">Disbursement Date:</span>
              <span className="font-bold text-[#202321]">{formatDateTime(paymentTimestamp)}</span>
            </div>
            <div className="text-right">
              <span className="text-[#6B706D] block">Payment Method:</span>
              <span className="font-bold text-[#202321]">{paymentMethod}</span>
            </div>
          </div>

          {/* Worker Details */}
          <div className="space-y-1.5 text-xs border-b border-dashed border-[#DCDDD9] pb-3">
            <div className="flex justify-between items-center">
              <span className="text-[#6B706D]">Worker Name:</span>
              <span className="font-bold text-[#202321] text-sm">
                {workerName} {workerCode ? `(${workerCode})` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#6B706D]">Designation / Role:</span>
              <span className="font-semibold text-[#1B4D3E]">{workerRole}</span>
            </div>
            {notes && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#6B706D]">Notes / Reference:</span>
                <span className="text-[#202321] italic">{notes}</span>
              </div>
            )}
          </div>

          {/* Amount Paid Highlight Card */}
          <div className="rounded bg-white border border-[#DCDDD9] p-3 text-center space-y-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block">
              Salary / Wage Amount Paid (ادا شدہ اجرت)
            </span>
            <span className="text-2xl font-black text-[#1B4D3E] font-mono block">
              {formatPKR(amountPaid)}
            </span>
            <div className="pt-2 border-t border-[#F5F5F3] flex justify-between items-center text-[11px]">
              <span className="text-[#6B706D]">Remaining Payable Balance:</span>
              <span className={`font-mono font-bold ${remainingPayableAfter > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
                {remainingPayableAfter > 0 ? formatPKR(remainingPayableAfter) : 'AED 0.00 (Fully Settled)'}
              </span>
            </div>
          </div>

          {/* Signatures & Approvals */}
          <div className="pt-3 border-t border-[#DCDDD9] grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <span className="text-[#6B706D] block">Authorized & Paid By:</span>
              <span className="font-bold text-[#202321] block mt-1">
                {paidByName || 'Workshop Owner'}
              </span>
              <span className="text-[10px] text-[#6B706D]">Verified & Transferred</span>
            </div>
            <div className="text-right">
              <span className="text-[#6B706D] block">Worker Signature / ACK:</span>
              <div className="mt-4 border-b border-[#202321] w-28 ml-auto" />
              <span className="text-[10px] text-[#6B706D] block mt-0.5">{workerName}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-[#6B706D] pt-1">
            Official Internal Payroll Disbursement Voucher · Automated POS Audit Log
          </div>
        </div>

        {/* Action Buttons */}
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
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
