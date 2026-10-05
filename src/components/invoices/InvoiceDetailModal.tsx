import React, { useState } from 'react';
import {
  X,
  Printer,
  Wrench,
  Receipt,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sliders,
  FileText
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatAED, formatDate, formatDateTime } from '../../utils/formatters';
import { printDocument } from '../../utils/printUtils';

interface InvoiceDetailModalProps {
  invoiceId: string;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoiceId, onClose }) => {
  const { invoices, customers, vehicles, settings, recordInvoicePrint, cancelInvoice, currentUser } = useShop();
  const [printSuccessNotice, setPrintSuccessNotice] = useState<string | null>(null);

  // Invoice display size options: 'compact' | 'standard' | 'a4' | 'wide' | 'thermal'
  const [invoiceSize, setInvoiceSize] = useState<'compact' | 'standard' | 'a4' | 'wide' | 'thermal'>(() => {
    return (localStorage.getItem('umair_invoice_modal_size') as any) || 'a4';
  });

  // Invoice zoom percentage
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('umair_invoice_zoom_level');
    return saved ? Number(saved) : 100;
  });

  // Target paper size for printing: 'A4' | 'A5' | 'Letter' | '80mm'
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'Letter' | '80mm'>(() => {
    return (localStorage.getItem('umair_invoice_paper_size') as any) || 'A4';
  });

  const invoice = invoices.find(i => i.id === invoiceId);

  if (!invoice) return null;

  const customer = customers.find(c => c.id === invoice.customerId);
  const vehicle = vehicles.find(v => v.id === invoice.vehicleId);

  const isCancelled = invoice.paymentStatus === 'Cancelled' || invoice.isCancelled;

  const sizeClasses: Record<string, string> = {
    compact: 'max-w-xl',      // 576px
    standard: 'max-w-3xl',    // 768px
    a4: 'max-w-4xl',          // 896px (True A4 proportion, recommended)
    wide: 'max-w-6xl',        // 1152px (Full desktop view)
    thermal: 'max-w-sm'       // 384px (80mm thermal receipt)
  };

  const handleSizeChange = (newSize: 'compact' | 'standard' | 'a4' | 'wide' | 'thermal') => {
    setInvoiceSize(newSize);
    localStorage.setItem('umair_invoice_modal_size', newSize);
    if (newSize === 'thermal') {
      setPaperSize('80mm');
    } else if (paperSize === '80mm') {
      setPaperSize('A4');
    }
  };

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(70, Math.min(140, newZoom));
    setZoomLevel(clamped);
    localStorage.setItem('umair_invoice_zoom_level', clamped.toString());
  };

  const handlePaperSizeChange = (newPaper: 'A4' | 'A5' | 'Letter' | '80mm') => {
    setPaperSize(newPaper);
    localStorage.setItem('umair_invoice_paper_size', newPaper);
    if (newPaper === '80mm' && invoiceSize !== 'thermal') {
      setInvoiceSize('thermal');
    }
  };

  const handlePrint = () => {
    // 1. Record print event for audit traceability
    const printEvent = recordInvoicePrint(invoice.id);

    // 2. Invoke universal print system with chosen paper size and zoom scale
    const printSuccess = printDocument({
      title: `Invoice_${invoice.invoiceNumber}_${settings.garageName || settings.shopName}`,
      elementId: 'printable-invoice-area',
      pageSize: paperSize,
      scale: zoomLevel / 100,
      onAfterPrint: () => {
        setPrintSuccessNotice(`Print command initiated · Copy #${printEvent.printCount} recorded in Audit Trail`);
        setTimeout(() => setPrintSuccessNotice(null), 4000);
      }
    });

    if (printSuccess) {
      setPrintSuccessNotice(`Print command sent to printer · Copy #${printEvent.printCount} recorded (${paperSize} size)`);
      setTimeout(() => setPrintSuccessNotice(null), 4000);
    }
  };

  const handleCancelInvoice = () => {
    if (confirm(`Are you sure you want to cancel and void invoice #${invoice.invoiceNumber}?\n\nThis will mark the invoice as Cancelled and return all billed items back to stock.`)) {
      cancelInvoice(invoice.id, 'Cancelled via Invoice Viewer');
      setPrintSuccessNotice(`Invoice #${invoice.invoiceNumber} has been marked CANCELLED and items restored to stock.`);
      setTimeout(() => setPrintSuccessNotice(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202321]/50 overflow-y-auto font-sans">
      <div className={`relative w-full ${sizeClasses[invoiceSize] || 'max-w-4xl'} my-6 rounded border border-[#DCDDD9] bg-white shadow-2xl overflow-hidden print-container transition-all duration-200`}>
        {/* Top Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#1B4D3E]" />
            <span className="text-xs font-bold text-[#202321]">
              Workshop Bill & Invoice Viewer
            </span>
            {isCancelled ? (
              <span className="rounded bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                Cancelled / ملغاة
              </span>
            ) : invoice.printCount && invoice.printCount > 0 ? (
              <span className="rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-1.5 py-0.2 text-[10px] font-mono font-semibold">
                Printed {invoice.printCount} {invoice.printCount === 1 ? 'time' : 'times'}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {!isCancelled && (
              <button
                type="button"
                onClick={handleCancelInvoice}
                className="inline-flex items-center gap-1 rounded border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors shadow-2xs active:scale-95 cursor-pointer"
                title="Cancel and void this invoice"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel Invoice</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs active:scale-95 cursor-pointer"
              title="Print official customer invoice"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] transition-colors shadow-2xs cursor-pointer active:scale-95"
              aria-label="Cancel and close viewer"
              title="Cancel and close viewer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Invoice Size & Paper Adjustment Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-[#DCDDD9] px-4 py-2 bg-[#F5F5F3] text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#6B706D] uppercase tracking-wider">
              Invoice Size:
            </span>
            <div className="inline-flex rounded border border-[#DCDDD9] bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSizeChange('compact')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                  invoiceSize === 'compact'
                    ? 'bg-[#1B4D3E] text-white shadow-2xs'
                    : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                }`}
                title="Compact modal width (576px)"
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => handleSizeChange('standard')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                  invoiceSize === 'standard'
                    ? 'bg-[#1B4D3E] text-white shadow-2xs'
                    : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                }`}
                title="Standard medium width (768px)"
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => handleSizeChange('a4')}
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                  invoiceSize === 'a4'
                    ? 'bg-[#1B4D3E] text-white shadow-2xs'
                    : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                }`}
                title="A4 wide tax invoice format (Recommended, 896px)"
              >
                A4 (Wide)
              </button>
              <button
                type="button"
                onClick={() => handleSizeChange('wide')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                  invoiceSize === 'wide'
                    ? 'bg-[#1B4D3E] text-white shadow-2xs'
                    : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                }`}
                title="Full wide desktop width (1152px)"
              >
                Full
              </button>
              <button
                type="button"
                onClick={() => handleSizeChange('thermal')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
                  invoiceSize === 'thermal'
                    ? 'bg-[#1B4D3E] text-white shadow-2xs'
                    : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                }`}
                title="80mm thermal receipt counter format (384px)"
              >
                80mm Slip
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Zoom / Scale Adjuster */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#6B706D]">Scale:</span>
              <div className="inline-flex items-center rounded border border-[#DCDDD9] bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomLevel - 10)}
                  disabled={zoomLevel <= 70}
                  className="px-2 py-1 text-xs font-bold text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3] disabled:opacity-30 cursor-pointer"
                  title="Zoom Out (-10%)"
                >
                  <ZoomOut className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoomChange(100)}
                  className="px-2 py-1 text-[11px] font-mono font-bold text-[#202321] hover:bg-[#F5F5F3] cursor-pointer"
                  title="Reset Scale to 100%"
                >
                  {zoomLevel}%
                </button>
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomLevel + 10)}
                  disabled={zoomLevel >= 140}
                  className="px-2 py-1 text-xs font-bold text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3] disabled:opacity-30 cursor-pointer"
                  title="Zoom In (+10%)"
                >
                  <ZoomIn className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Print Paper Size Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#6B706D]">Paper:</span>
              <select
                value={paperSize}
                onChange={e => handlePaperSizeChange(e.target.value as any)}
                className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-[11px] font-semibold text-[#202321] focus:border-[#1B4D3E] focus:outline-none shadow-2xs"
                title="Select target printer paper size"
              >
                <option value="A4">A4 (Standard Page)</option>
                <option value="A5">A5 (Half Page)</option>
                <option value="Letter">US Letter</option>
                <option value="80mm">80mm POS Slip</option>
              </select>
            </div>
          </div>
        </div>

        {/* Print Feedback Toast Notice */}
        {printSuccessNotice && (
          <div className="no-print mx-4 mt-3 flex items-center gap-2 rounded border border-[#A7D0C0] bg-[#E8F0EC] p-2 text-xs font-medium text-[#1B4D3E] animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{printSuccessNotice}</span>
          </div>
        )}

        {/* Printable Bill Area */}
        <div
          id="printable-invoice-area"
          style={{ zoom: `${zoomLevel}%` }}
          className={`p-6 bg-white text-[#202321] text-xs transition-transform duration-150 ${invoiceSize === 'thermal' ? 'max-w-sm mx-auto' : ''}`}
        >
          {/* Cancelled Banner if voided */}
          {isCancelled && (
            <div className="mb-4 rounded border-2 border-[#DC2626] bg-[#FEF2F2] p-2.5 text-center">
              <div className="text-sm font-black tracking-widest text-[#DC2626] uppercase">
                *** VOID / CANCELLED INVOICE (فاتورة ملغاة) ***
              </div>
              <div className="text-[11px] text-[#991B1B] mt-0.5 font-medium">
                This invoice was cancelled and marked void on {formatDate(invoice.cancelledAt || invoice.updatedAt || invoice.date)}. Stock has been restored.
                {invoice.cancelReason && <span className="block italic mt-0.5">Reason: {invoice.cancelReason}</span>}
              </div>
            </div>
          )}

          {/* Shop Header */}
          <div className="flex justify-between items-start pb-4 border-b border-[#DCDDD9]">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1B4D3E] text-white">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-[#202321] tracking-tight">
                    {settings.shopName}
                  </h1>
                  <p className="text-[11px] text-[#6B706D]">{settings.tagline}</p>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-[#6B706D] space-y-0.5">
                <p>{settings.address}</p>
                <p>Phone: {settings.phone} · Email: {settings.email}</p>
                <p className="font-mono text-[#202321]">{settings.taxNumber}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded border border-[#A7D0C0] bg-[#E8F0EC] text-[10px] font-mono font-bold tracking-wider text-[#1B4D3E] mb-1">
                TAX INVOICE / فاتورة ضريبية
              </span>
              <div className="text-sm font-bold font-mono text-[#202321]">{invoice.invoiceNumber}</div>
              <div className="text-[10px] text-[#6B706D] font-mono">TRN: {settings.trnNumber || '100482937400003'}</div>
              <div className="text-[11px] text-[#6B706D] mt-0.5">Date: {formatDate(invoice.date)}</div>
              <div className="text-[11px] font-semibold mt-1">
                Status:{' '}
                <span
                  className={
                    invoice.paymentStatus === 'Paid'
                      ? 'text-[#15803D]'
                      : invoice.paymentStatus === 'Partially Paid'
                      ? 'text-[#B45309]'
                      : 'text-[#DC2626]'
                  }
                >
                  {invoice.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Vehicle Meta */}
          <div className="py-3 border-b border-[#DCDDD9] grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B706D] mb-1">
                Billed To (Customer)
              </div>
              <div className="font-bold text-[#202321]">{customer?.fullName}</div>
              <div className="text-[11px] text-[#6B706D] font-mono">{customer?.phone}</div>
              <div className="text-[11px] text-[#6B706D]">{customer?.address}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B706D] mb-1">
                Vehicle Serviced
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded border border-[#DCDDD9]">
                  {vehicle?.registrationNumber}
                </span>
                <span className="font-medium text-[#202321]">
                  {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                </span>
              </div>
              <div className="text-[11px] text-[#6B706D] mt-0.5">
                Current Odometer: <span className="font-mono">{vehicle?.mileage.toLocaleString()} km</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-3 border-b border-[#DCDDD9]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCDDD9] text-[10px] font-semibold uppercase tracking-wider text-[#6B706D]">
                <tr>
                  <th className="py-1.5">Description</th>
                  <th className="py-1.5 text-center">Type</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Unit Price</th>
                  <th className="py-1.5 text-right">Amount (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-1.5 font-medium text-[#202321]">{item.name}</td>
                    <td className="py-1.5 text-center font-mono text-[10px] uppercase text-[#6B706D]">
                      {item.type}
                    </td>
                    <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-[#6B706D]">
                      {formatAED(item.unitPrice)}
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                      {formatAED(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div className="py-3 border-b border-[#DCDDD9] flex justify-end">
            <div className="w-64 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#6B706D]">
                <span>Parts Total:</span>
                <span>{formatAED(invoice.partsTotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B706D]">
                <span>Labour / Services:</span>
                <span>{formatAED(invoice.labourTotal + invoice.servicesTotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-[#15803D]">
                  <span>Discount:</span>
                  <span>-{formatAED(invoice.discount)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-[#6B706D]">
                  <span>UAE VAT ({invoice.taxRate}%):</span>
                  <span>{formatAED(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#202321] pt-1 border-t border-[#DCDDD9]">
                <span className="font-sans">Grand Total:</span>
                <span>{formatAED(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-[#15803D] pt-0.5">
                <span className="font-sans">Amount Paid:</span>
                <span>{formatAED(invoice.paidAmount)}</span>
              </div>
              {invoice.balanceDue > 0 && (
                <div className="flex justify-between font-bold text-[#DC2626] pt-0.5 border-t border-[#DCDDD9]">
                  <span className="font-sans">Balance Due:</span>
                  <span>{formatAED(invoice.balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method & Dubai Legal Policy Terms */}
          <div className="pt-3 border-t border-[#DCDDD9] mt-2">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 text-[10px] text-[#6B706D] max-w-md">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#202321]">
                  Payment Method: {invoice.paymentMethod} · Dubai Regulatory Terms (شروط وأنظمة ورش دبي)
                </div>
                <p className="leading-tight">
                  1. <strong>Warranty:</strong> Workmanship guaranteed for 90 days or 5,000 km under UAE Consumer Protection Law (Federal Law No. 15 of 2020). OEM parts carry manufacturer warranty.
                </p>
                <p className="leading-tight">
                  2. <strong>Replaced Parts:</strong> Customer has the right to inspect & collect replaced parts within 24 hours of delivery.
                </p>
                <p className="leading-tight">
                  3. <strong>Storage & Lien:</strong> Vehicles uncollected after 72 hours incur storage fee of AED 50.00/day. Workshop holds lien rights until full settlement.
                </p>
                <p className="leading-tight">
                  4. <strong>Dubai Police:</strong> Accident/body repairs certified under Dubai Police Permit rules. Garage not liable for personal items left in car.
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="h-8 border-b border-[#DCDDD9] w-36 ml-auto"></div>
                <div className="text-[10px] uppercase font-semibold text-[#6B706D] mt-1">
                  Authorized Signatory & Stamp
                </div>
              </div>
            </div>
          </div>

          {/* Audit Traceability Stamp & Print Verification Footer */}
          <div className="mt-4 pt-2.5 border-t border-[#DCDDD9] flex flex-wrap items-center justify-between text-[10px] text-[#6B706D] font-mono bg-[#FAFAF9] p-2 rounded border border-[#E5E5E3]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-[#1B4D3E]" />
              <span>Created By: <strong className="text-[#202321]">{invoice.createdByName || 'Ali'}</strong> ({formatDate(invoice.createdDate || invoice.date)})</span>
              {invoice.updatedByName && (
                <span>• Modified By: <strong className="text-[#202321]">{invoice.updatedByName}</strong></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Printed By: <strong className="text-[#202321]">{currentUser?.name || 'Staff'}</strong></span>
              <span className="font-bold text-[#1B4D3E]">Copy #{(invoice.printCount || 0) + 1}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer with Print and Cancel Buttons (Hidden in Print) */}
        <div className="no-print border-t border-[#DCDDD9] px-6 py-3 bg-[#FAFAF9] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#6B706D] flex items-center gap-2 flex-wrap">
            <span>Invoice: <strong className="text-[#202321] font-mono">{invoice.invoiceNumber}</strong></span>
            <span className="text-[#DCDDD9]">|</span>
            <span>Total: <strong className="text-[#1B4D3E] font-mono">{formatAED(invoice.grandTotal)}</strong></span>
            <span className="text-[#DCDDD9] hidden sm:inline-block">|</span>
            <span className="text-[11px] text-[#6B706D] hidden sm:inline-block">
              Size: <strong className="text-[#202321] uppercase">{invoiceSize}</strong> ({zoomLevel}%) · Paper: <strong className="text-[#202321]">{paperSize}</strong>
            </span>
            {isCancelled && (
              <span className="rounded bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                Voided / Cancelled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!isCancelled && (
              <button
                type="button"
                onClick={handleCancelInvoice}
                className="inline-flex items-center gap-1.5 rounded border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Cancel and void this invoice"
              >
                <X className="h-4 w-4" />
                <span>Cancel Invoice</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-4 py-2 text-xs font-semibold text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Cancel and close viewer"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-5 py-2 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs active:scale-95 cursor-pointer"
              title="Print official tax invoice"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
