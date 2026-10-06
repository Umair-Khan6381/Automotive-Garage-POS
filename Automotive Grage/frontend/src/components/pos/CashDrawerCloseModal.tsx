import React, { useState } from 'react';
import {
  X,
  Printer,
  DollarSign,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  Clock,
  User,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Coins
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatAED, formatDateTime, formatDate } from '../../utils/formatters';
import { printDocument } from '../../utils/printUtils';
import { PaymentMethod } from '../../types';

interface CashDrawerCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashDrawerCloseModal: React.FC<CashDrawerCloseModalProps> = ({ isOpen, onClose }) => {
  const {
    invoices,
    payments,
    expenses,
    settings,
    currentUser,
    recordZReport
  } = useShop();

  const [openingFloat, setOpeningFloat] = useState<number>(500);
  const [countedCash, setCountedCash] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [paperFormat, setPaperFormat] = useState<'80mm' | 'A4'>('80mm');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [reportNumber, setReportNumber] = useState<string>('');
  const [printSuccessNotice, setPrintSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter today's transactions
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayPayments = payments.filter(p => p.date.startsWith(todayStr));
  const todayCashIn = todayPayments
    .filter(p => p.paymentMethod === 'Cash')
    .reduce((sum, p) => sum + p.amount, 0);

  const todayCardIn = todayPayments
    .filter(p => p.paymentMethod === 'Card')
    .reduce((sum, p) => sum + p.amount, 0);

  const todayBankIn = todayPayments
    .filter(p => p.paymentMethod === 'Bank Transfer')
    .reduce((sum, p) => sum + p.amount, 0);

  const todayOtherIn = todayPayments
    .filter(p => p.paymentMethod === 'Cheque' || p.paymentMethod === 'Online' || p.paymentMethod === 'Other')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRevenue = todayCashIn + todayCardIn + todayBankIn + todayOtherIn;

  // Today's Cash Expenses paid out of drawer (Petty Cash)
  const todayCashExpenses = expenses
    .filter(e => e.date.startsWith(todayStr) && e.paymentMethod === 'Cash' && e.status !== 'Void')
    .reduce((sum, e) => sum + e.amount, 0);

  // Expected Cash in Drawer formula
  const expectedCash = openingFloat + todayCashIn - todayCashExpenses;
  const variance = (countedCash || 0) - expectedCash;

  const handleSaveAndCloseShift = () => {
    const record = recordZReport({
      date: todayStr,
      openingFloat,
      cashSales: todayCashIn,
      cardSales: todayCardIn,
      bankSales: todayBankIn,
      chequeSales: todayOtherIn,
      totalSales: totalRevenue,
      cashExpenses: todayCashExpenses,
      expectedCash,
      countedCash,
      variance,
      invoicesCount: todayPayments.length,
      notes: shiftNotes
    });

    setReportNumber(record.reportNumber);
    setIsSaved(true);
    setPrintSuccessNotice(`Shift closed successfully. Z-Report #${record.reportNumber} generated.`);
  };

  const handlePrintZReport = () => {
    const success = printDocument({
      title: `Z_Report_${todayStr}_${settings.garageName || settings.shopName}`,
      elementId: 'printable-z-report-area',
      pageSize: paperFormat,
      scale: paperFormat === '80mm' ? 1.0 : 0.95,
      onAfterPrint: () => {
        setPrintSuccessNotice('Z-Report sent to printer successfully.');
        setTimeout(() => setPrintSuccessNotice(null), 3000);
      }
    });

    if (success) {
      setPrintSuccessNotice(`Printing Daily Z-Report (${paperFormat} Slip)...`);
      setTimeout(() => setPrintSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202321]/60 overflow-y-auto font-sans backdrop-blur-2xs">
      <div className="relative w-full max-w-2xl my-4 rounded-lg border border-[#DCDDD9] bg-white shadow-2xl overflow-hidden print-container flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="no-print flex items-center justify-between border-b border-[#DCDDD9] px-4 py-3 bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1B4D3E] text-white">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#202321] flex items-center gap-2">
                <span>Daily Z-Report & Cash Drawer Close</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F0EC] text-[#1B4D3E]">
                  {todayStr}
                </span>
              </h2>
              <p className="text-[11px] text-[#6B706D]">
                Reconcile physical cash drawer, summarize revenue, and balance register shift
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

        {/* Toolbar & Paper Toggle */}
        <div className="no-print flex items-center justify-between px-4 py-2 bg-[#F5F5F3] border-b border-[#DCDDD9] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6B706D] uppercase tracking-wider">Report Format:</span>
            <div className="inline-flex rounded-md border border-[#DCDDD9] bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setPaperFormat('80mm')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  paperFormat === '80mm'
                    ? 'bg-[#1B4D3E] text-white font-bold'
                    : 'text-[#6B706D] hover:text-[#202321]'
                }`}
              >
                🧾 80mm Thermal POS Slip
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('A4')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  paperFormat === 'A4'
                    ? 'bg-[#1B4D3E] text-white font-bold'
                    : 'text-[#6B706D] hover:text-[#202321]'
                }`}
              >
                📄 A4 Full Sheet
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B706D]">Cashier: <strong className="text-[#202321]">{currentUser?.name || 'Staff'}</strong></span>
          </div>
        </div>

        {printSuccessNotice && (
          <div className="no-print mx-4 mt-3 p-2.5 rounded-md border border-[#A7D0C0] bg-[#E8F0EC] text-xs text-[#1B4D3E] font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{printSuccessNotice}</span>
          </div>
        )}

        {/* Modal Body / Reconciliation Form & Printable Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Cash Drawer Reconciliation Input Cards */}
          <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#DCDDD9] bg-white p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B706D] block mb-1">
                Opening Float (بداية الوردية)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-[#6B706D]">AED</span>
                <input
                  type="number"
                  value={openingFloat}
                  onChange={e => setOpeningFloat(Number(e.target.value))}
                  className="w-full font-mono text-base font-bold text-[#202321] border border-[#DCDDD9] rounded px-2 py-1 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-[#6B706D] mt-1 block">Petty cash in drawer at shift start</span>
            </div>

            <div className="rounded-lg border border-[#DCDDD9] bg-white p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B706D] block mb-1">
                Expected In Till (المتوقع في الصندوق)
              </span>
              <div className="text-base font-bold font-mono text-[#1B4D3E] py-1">
                {formatAED(expectedCash)}
              </div>
              <span className="text-[10px] text-[#6B706D] mt-1 block">Float + Cash Sales - Cash Out</span>
            </div>

            <div className="rounded-lg border border-[#DCDDD9] bg-white p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#202321] block mb-1">
                Counted Cash (المبلغ الفعلي المعدود) *
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-[#6B706D]">AED</span>
                <input
                  type="number"
                  value={countedCash}
                  onChange={e => setCountedCash(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full font-mono text-base font-bold text-[#202321] border-2 border-[#1B4D3E] rounded px-2 py-1 focus:outline-none"
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                <span>Variance:</span>
                <span className={`font-bold ${
                  variance === 0
                    ? 'text-[#15803D]'
                    : variance > 0
                    ? 'text-[#1D4ED8]'
                    : 'text-[#DC2626]'
                }`}>
                  {variance === 0 ? '✓ Balanced (0.00)' : variance > 0 ? `+${formatAED(variance)} Over` : `${formatAED(variance)} Short`}
                </span>
              </div>
            </div>
          </div>

          {/* Shift Notes Input */}
          <div className="no-print">
            <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Shift Notes & Remarks (ملاحظات إغلاق الصندوق):</label>
            <input
              type="text"
              placeholder="e.g. All counter slips reconciled with card terminal batch report..."
              value={shiftNotes}
              onChange={e => setShiftNotes(e.target.value)}
              className="w-full text-xs rounded border border-[#DCDDD9] px-3 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>

          {/* Printable Z-Report Sheet Container */}
          <div className="border border-[#DCDDD9] rounded-md bg-[#FAFAF9] p-3 sm:p-5">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3 no-print">
              <span className="text-xs font-bold text-[#202321] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#1B4D3E]" />
                <span>Daily Z-Report Slip Preview</span>
              </span>
              <button
                type="button"
                onClick={handlePrintZReport}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153E32] transition-colors shadow-2xs cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Z-Report</span>
              </button>
            </div>

            {/* Printable Z-Report Area */}
            <div
              id="printable-z-report-area"
              className={`bg-white border border-[#DCDDD9] p-4 text-xs font-mono text-[#202321] mx-auto shadow-xs ${
                paperFormat === '80mm' ? 'max-w-[340px]' : 'max-w-xl'
              }`}
            >
              {/* Header */}
              <div className="text-center pb-2.5 border-b border-dashed border-[#202321]">
                <h1 className="text-sm font-black uppercase tracking-wider text-[#202321]">
                  {settings.garageName || settings.shopName || 'UMAIR AUTO CARE LLC'}
                </h1>
                <p className="text-[10px] text-[#6B706D]">{settings.address || 'Al Quoz Ind. 3, Dubai, UAE'}</p>
                <p className="text-[10px] text-[#6B706D]">Tel: {settings.phone || '+971 4 347 8899'} · TRN: {settings.trnNumber || '100482937400003'}</p>
                <div className="mt-1.5 inline-block border border-[#202321] px-2.5 py-0.5 text-[10px] font-black uppercase">
                  DAILY Z-REPORT / تقرير إغلاق الصندوق
                </div>
              </div>

              {/* Shift Meta */}
              <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-[#202321]">
                <div className="flex justify-between">
                  <span>Report #:</span>
                  <span className="font-bold">{reportNumber || `ZREP-${todayStr.replace(/-/g, '')}-001`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shift Date:</span>
                  <span>{formatDate(todayStr)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Closed At:</span>
                  <span>{formatDateTime(new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier / Lead:</span>
                  <span className="font-bold">{currentUser?.name || 'Ali'} ({currentUser?.role || 'Cashier'})</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Payments Settled:</span>
                  <span className="font-bold">{todayPayments.length} transactions</span>
                </div>
              </div>

              {/* Collections by Payment Method */}
              <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-[#202321]">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#6B706D] mb-1">
                  1. REVENUE BY PAYMENT METHOD
                </div>
                <div className="flex justify-between">
                  <span>Cash Collections:</span>
                  <span className="font-bold">{formatAED(todayCashIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Card Payments (Visa/MC):</span>
                  <span>{formatAED(todayCardIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bank Wire / Transfers:</span>
                  <span>{formatAED(todayBankIn)}</span>
                </div>
                {todayOtherIn > 0 && (
                  <div className="flex justify-between">
                    <span>Cheque / Online:</span>
                    <span>{formatAED(todayOtherIn)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-[#202321]">
                  <span>TOTAL GROSS COLLECTIONS:</span>
                  <span>{formatAED(totalRevenue)}</span>
                </div>
              </div>

              {/* Cash Drawer Reconciliation */}
              <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-[#202321]">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#6B706D] mb-1">
                  2. CASH DRAWER AUDIT (تسوية النقدية)
                </div>
                <div className="flex justify-between">
                  <span>(+) Opening Float:</span>
                  <span>{formatAED(openingFloat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) Cash Sales Today:</span>
                  <span>{formatAED(todayCashIn)}</span>
                </div>
                <div className="flex justify-between text-[#DC2626]">
                  <span>(-) Petty Cash Paid Out:</span>
                  <span>-{formatAED(todayCashExpenses)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-dotted border-[#DCDDD9]">
                  <span>(=) Expected Cash in Drawer:</span>
                  <span className="text-[#1B4D3E]">{formatAED(expectedCash)}</span>
                </div>
                <div className="flex justify-between font-black pt-0.5">
                  <span>Actual Counted Cash:</span>
                  <span>{formatAED(countedCash)}</span>
                </div>
                <div className="flex justify-between font-black text-xs pt-1 border-t border-[#202321]">
                  <span>CASH VARIANCE:</span>
                  <span className={variance === 0 ? 'text-[#15803D]' : variance > 0 ? 'text-[#1D4ED8]' : 'text-[#DC2626]'}>
                    {variance === 0 ? 'AED 0.00 (PERFECT)' : variance > 0 ? `+${formatAED(variance)} (OVER)` : `${formatAED(variance)} (SHORT)`}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {shiftNotes && (
                <div className="py-1.5 text-[10px] text-[#6B706D] border-b border-dashed border-[#202321]">
                  <span className="font-bold">Remarks:</span> {shiftNotes}
                </div>
              )}

              {/* Signatures */}
              <div className="pt-4 pb-2 text-[10px] space-y-3">
                <div className="flex justify-between">
                  <div className="w-32 border-t border-[#202321] pt-1 text-center">
                    <span>Cashier Signature</span>
                  </div>
                  <div className="w-32 border-t border-[#202321] pt-1 text-center">
                    <span>Manager Signature</span>
                  </div>
                </div>
                <p className="text-[9px] text-center text-[#6B706D] pt-2">
                  *** END OF SHIFT Z-REPORT · RETAIN FOR AUDIT RECORD ***
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="no-print border-t border-[#DCDDD9] px-4 py-3 bg-[#FAFAF9] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-[#DCDDD9] bg-white text-xs font-semibold text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {!isSaved && (
              <button
                type="button"
                onClick={handleSaveAndCloseShift}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#202321] text-white text-xs font-bold hover:bg-[#374151] transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                <span>Confirm Shift Close</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintZReport}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153E32] transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print Z-Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
