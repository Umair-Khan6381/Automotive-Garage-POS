import React, { useState } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  Receipt,
  Download,
  Building,
  User,
  Car,
  Calendar,
  CreditCard
} from 'lucide-react';
import { formatAED, formatDateTime } from '../../utils/formatters';
import { ShopSettings } from '../../types';
import { printDocument } from '../../utils/printUtils';

interface CustomerPaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  receiptNumber: string;
  invoiceNumber: string;
  customerName: string;
  vehicleDetails?: string;
  amountReceived: number;
  paymentMethod: string;
  paymentTimestamp: string;
  receivedByName: string;
  remainingBalance: number;
  notes?: string;
}

export const CustomerPaymentReceiptModal: React.FC<CustomerPaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  settings,
  receiptNumber,
  invoiceNumber,
  customerName,
  vehicleDetails,
  amountReceived,
  paymentMethod,
  paymentTimestamp,
  receivedByName,
  remainingBalance,
  notes
}) => {
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<'80mm' | 'A5' | 'A4'>(() => {
    return (localStorage.getItem('umair_receipt_paper_size') as any) || '80mm';
  });
  const [scale, setScale] = useState<number>(() => {
    const saved = localStorage.getItem('umair_receipt_scale');
    return saved ? Number(saved) : 100;
  });

  if (!isOpen) return null;

  const handlePaperChange = (p: '80mm' | 'A5' | 'A4') => {
    setPaperSize(p);
    localStorage.setItem('umair_receipt_paper_size', p);
  };

  const handleScaleChange = (s: number) => {
    const clamped = Math.max(70, Math.min(130, s));
    setScale(clamped);
    localStorage.setItem('umair_receipt_scale', clamped.toString());
  };

  const handlePrint = () => {
    printDocument({
      title: `Payment_Receipt_${receiptNumber}`,
      elementId: 'printable-payment-receipt',
      pageSize: paperSize,
      scale: scale / 100,
      onAfterPrint: () => {
        setPrintFeedback(`Receipt printed (${paperSize} · ${scale}%)`);
        setTimeout(() => setPrintFeedback(null), 3000);
      }
    });
    setPrintFeedback(`Sending ${paperSize} receipt to printer...`);
    setTimeout(() => setPrintFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/50 p-4 backdrop-blur-2xs font-sans">
      <div className={`w-full ${paperSize === '80mm' ? 'max-w-sm' : 'max-w-md'} rounded-lg border border-[#DCDDD9] bg-white p-5 shadow-2xl max-h-[92vh] flex flex-col transition-all duration-200`}>
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-3 no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-[#DCFCE7] text-[#15803D]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#202321]">
                Customer Payment Receipt
              </h3>
              <p className="text-[11px] text-[#6B706D] font-mono">
                {receiptNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Size & Paper Adjuster Bar */}
        <div className="no-print flex items-center justify-between gap-2 border border-[#DCDDD9] bg-[#F5F5F3] rounded p-2 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-[#6B706D]">Size:</span>
            <div className="inline-flex rounded border border-[#DCDDD9] bg-white p-0.5 shadow-2xs">
              {(['80mm', 'A5', 'A4'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePaperChange(p)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                    paperSize === p
                      ? 'bg-[#1B4D3E] text-white shadow-2xs'
                      : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                  }`}
                >
                  {p === '80mm' ? '80mm Slip' : p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-[#6B706D]">Scale:</span>
            <div className="inline-flex items-center rounded border border-[#DCDDD9] bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleScaleChange(scale - 5)}
                disabled={scale <= 70}
                className="px-1.5 py-0.5 text-[10px] font-bold text-[#6B706D] hover:bg-[#F5F5F3] disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="px-1.5 text-[10px] font-mono font-bold">{scale}%</span>
              <button
                type="button"
                onClick={() => handleScaleChange(scale + 5)}
                disabled={scale >= 130}
                className="px-1.5 py-0.5 text-[10px] font-bold text-[#6B706D] hover:bg-[#F5F5F3] disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {printFeedback && (
          <div className="no-print mb-2 p-1.5 rounded bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{printFeedback}</span>
          </div>
        )}

        {/* Printable Receipt Paper */}
        <div
          id="printable-payment-receipt"
          style={{ zoom: `${scale}%` }}
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
            <p className="text-[11px] text-[#6B706D]">
              Ph: {settings.phone || '+971 4 347 8899'} {settings.taxNumber ? `· ${settings.taxNumber}` : '· TRN: 100482937400003'}
            </p>
            <div className="mt-2 inline-block rounded bg-[#E8F0EC] px-3 py-0.5 font-bold text-xs text-[#1B4D3E] uppercase tracking-wider">
              Official Payment Receipt (وصل استلام دفع)
            </div>
          </div>

          {/* Key Reference Information */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-b border-dashed border-[#DCDDD9] pb-3">
            <div>
              <span className="text-[#6B706D] block">Receipt #:</span>
              <span className="font-bold text-xs text-[#202321]">{receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[#6B706D] block">Invoice #:</span>
              <span className="font-bold text-xs text-[#202321]">{invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[#6B706D] block">Date & Time:</span>
              <span className="font-bold text-[#202321]">{formatDateTime(paymentTimestamp)}</span>
            </div>
            <div className="text-right">
              <span className="text-[#6B706D] block">Payment Method:</span>
              <span className="font-bold text-[#202321]">{paymentMethod}</span>
            </div>
          </div>

          {/* Customer & Vehicle Details */}
          <div className="space-y-1.5 text-xs border-b border-dashed border-[#DCDDD9] pb-3">
            <div className="flex justify-between items-center">
              <span className="text-[#6B706D]">Customer Name:</span>
              <span className="font-bold text-[#202321]">{customerName}</span>
            </div>
            {vehicleDetails && (
              <div className="flex justify-between items-center">
                <span className="text-[#6B706D]">Vehicle / Reg #:</span>
                <span className="font-mono font-bold text-[#202321]">{vehicleDetails}</span>
              </div>
            )}
            {notes && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#6B706D]">Reference / Notes:</span>
                <span className="text-[#202321] italic">{notes}</span>
              </div>
            )}
          </div>

          {/* Amount Paid Highlight Card */}
          <div className="rounded bg-white border border-[#DCDDD9] p-3 text-center space-y-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block">
              Amount Received (وصول شدہ رقم)
            </span>
            <span className="text-2xl font-black text-[#15803D] font-mono block">
              {formatAED(amountReceived)}
            </span>
            <div className="pt-2 border-t border-[#F5F5F3] flex justify-between items-center text-[11px]">
              <span className="text-[#6B706D]">Remaining Invoice Balance:</span>
              <span className={`font-mono font-bold ${remainingBalance > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
                {remainingBalance > 0 ? formatAED(remainingBalance) : 'AED 0.00 (Fully Paid)'}
              </span>
            </div>
          </div>

          {/* Authorized Receiver Sign-off */}
          <div className="pt-3 border-t border-[#DCDDD9] flex items-center justify-between text-[11px]">
            <div>
              <span className="text-[#6B706D] block">Received & Logged By:</span>
              <span className="font-bold text-[#202321] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[#15803D]" />
                <span>{receivedByName}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#6B706D] block">Status:</span>
              <span className="font-bold text-[#15803D]">Verified & Recorded</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-[#6B706D] pt-1">
            Thank you for choosing {settings.garageName || settings.shopName || 'Umair Auto Care LLC'}. Computer-generated official receipt.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-[#DCDDD9] mt-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Cancel and close receipt"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs cursor-pointer active:scale-95"
              title="Print official payment receipt"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
