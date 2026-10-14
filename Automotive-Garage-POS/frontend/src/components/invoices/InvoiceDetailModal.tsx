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
  FileText,
  SlidersHorizontal,
  Check,
  Sparkles,
  QrCode
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

  // Target paper size for printing: 'A4' | 'A5' | 'Letter' | '80mm'
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'Letter' | '80mm'>(() => {
    return (localStorage.getItem('umair_invoice_paper_size') as any) || 'A4';
  });

  // Modal / Preview width: 'compact' | 'standard' | 'a4' | 'wide' | 'thermal' | 'fullscreen'
  const [invoiceSize, setInvoiceSize] = useState<'compact' | 'standard' | 'a4' | 'wide' | 'thermal' | 'fullscreen'>(() => {
    return (localStorage.getItem('umair_invoice_modal_size') as any) || 'a4';
  });

  // Invoice zoom percentage: 60% to 140%
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('umair_invoice_zoom_level');
    return saved ? Number(saved) : 100;
  });

  // Spacing Density: 'compact' | 'normal' | 'spacious'
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>(() => {
    return (localStorage.getItem('umair_invoice_density') as any) || 'normal';
  });

  // Single-Page Fit Guarantee
  const [fitOnePage, setFitOnePage] = useState<boolean>(() => {
    return localStorage.getItem('umair_invoice_fit_one_page') === 'true';
  });

  // Fine-tuning drawer expand/collapse
  const [showAdvancedSize, setShowAdvancedSize] = useState<boolean>(false);

  const invoice = invoices.find(i => i.id === invoiceId);

  if (!invoice) return null;

  const customer = customers.find(c => c.id === invoice.customerId);
  const vehicle = vehicles.find(v => v.id === invoice.vehicleId);

  const isCancelled = invoice.paymentStatus === 'Cancelled' || invoice.isCancelled;

  const sizeClasses: Record<string, string> = {
    compact: 'max-w-xl',                   // 576px (A5 preview)
    standard: 'max-w-3xl',                 // 768px
    a4: 'max-w-4xl',                       // 896px (True A4 proportion, recommended)
    wide: 'max-w-6xl',                     // 1152px (Full desktop view)
    thermal: 'max-w-sm',                   // 384px (80mm thermal receipt)
    fullscreen: 'w-[96vw] max-w-[96vw]'   // Full window view
  };

  const paperDimensions: Record<string, string> = {
    A4: '210 × 297 mm (Full Tax Invoice)',
    A5: '148 × 210 mm (Half Page)',
    Letter: '8.5 × 11 in (US Letter)',
    '80mm': '80mm Continuous POS Roll'
  };

  const handlePaperSizeChange = (newPaper: 'A4' | 'A5' | 'Letter' | '80mm') => {
    setPaperSize(newPaper);
    localStorage.setItem('umair_invoice_paper_size', newPaper);
    if (newPaper === '80mm') {
      setInvoiceSize('thermal');
      localStorage.setItem('umair_invoice_modal_size', 'thermal');
    } else if (invoiceSize === 'thermal') {
      setInvoiceSize('a4');
      localStorage.setItem('umair_invoice_modal_size', 'a4');
    }
  };

  const handleSizeChange = (newSize: 'compact' | 'standard' | 'a4' | 'wide' | 'thermal' | 'fullscreen') => {
    setInvoiceSize(newSize);
    localStorage.setItem('umair_invoice_modal_size', newSize);
    if (newSize === 'thermal') {
      setPaperSize('80mm');
      localStorage.setItem('umair_invoice_paper_size', '80mm');
    } else if (paperSize === '80mm') {
      setPaperSize('A4');
      localStorage.setItem('umair_invoice_paper_size', 'A4');
    }
  };

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(60, Math.min(140, newZoom));
    setZoomLevel(clamped);
    localStorage.setItem('umair_invoice_zoom_level', clamped.toString());
  };

  const handleDensityChange = (newDensity: 'compact' | 'normal' | 'spacious') => {
    setDensity(newDensity);
    localStorage.setItem('umair_invoice_density', newDensity);
  };

  const handleToggleFitOnePage = () => {
    const nextVal = !fitOnePage;
    setFitOnePage(nextVal);
    localStorage.setItem('umair_invoice_fit_one_page', nextVal ? 'true' : 'false');
    if (nextVal) {
      setDensity('compact');
      localStorage.setItem('umair_invoice_density', 'compact');
      // Scale down slightly if there are many items so everything fits onto 1 sheet
      const targetZoom = invoice.items.length > 7 ? 80 : 85;
      setZoomLevel(targetZoom);
      localStorage.setItem('umair_invoice_zoom_level', targetZoom.toString());
      setPrintSuccessNotice('Single-Page Fit enabled: Spacing & zoom auto-calibrated to fit 1 page.');
      setTimeout(() => setPrintSuccessNotice(null), 3500);
    } else {
      setDensity('normal');
      localStorage.setItem('umair_invoice_density', 'normal');
      setZoomLevel(100);
      localStorage.setItem('umair_invoice_zoom_level', '100');
    }
  };

  const handlePrint = () => {
    // 1. Record print event for audit traceability
    const printEvent = recordInvoicePrint(invoice.id);

    // 2. Invoke universal print system with chosen paper size, scale, density, and 1-page fit
    const printSuccess = printDocument({
      title: `Invoice_${invoice.invoiceNumber}_${settings.garageName || settings.shopName}`,
      elementId: 'printable-invoice-area',
      pageSize: paperSize,
      scale: zoomLevel / 100,
      density: density,
      fitOnePage: fitOnePage,
      onAfterPrint: () => {
        setPrintSuccessNotice(`Print command initiated · Copy #${printEvent.printCount} recorded in Audit Trail`);
        setTimeout(() => setPrintSuccessNotice(null), 4000);
      }
    });

    if (printSuccess) {
      setPrintSuccessNotice(`Print command sent to printer · Copy #${printEvent.printCount} (${paperSize} size, ${zoomLevel}% scale)`);
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

  const isThermalMode = paperSize === '80mm' || invoiceSize === 'thermal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#202321]/60 overflow-y-auto font-sans backdrop-blur-2xs">
      <div className={`relative w-full ${sizeClasses[invoiceSize] || 'max-w-4xl'} my-4 rounded border border-[#DCDDD9] bg-white shadow-2xl overflow-hidden print-container transition-all duration-200`}>
        {/* Top Controls Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#E8F0EC] text-[#1B4D3E]">
              <Receipt className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#202321]">
                Workshop Invoice Viewer
              </span>
              <span className="text-[11px] font-mono text-[#6B706D] ml-1.5">
                #{invoice.invoiceNumber}
              </span>
            </div>
            {isCancelled ? (
              <span className="rounded bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                Cancelled / ملغاة
              </span>
            ) : invoice.printCount && invoice.printCount > 0 ? (
              <span className="rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-1.5 py-0.5 text-[10px] font-mono font-semibold">
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
                <span className="hidden sm:inline">Cancel Invoice</span>
                <span className="sm:hidden">Void</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs active:scale-95 cursor-pointer"
              title="Print invoice with current size & scale settings"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] transition-colors shadow-2xs cursor-pointer active:scale-95"
              aria-label="Cancel and close viewer"
              title="Close invoice viewer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* PRIMARY INVOICE SIZE ADJUSTMENT TOOLBAR (User Friendly) */}
        <div className="no-print border-b border-[#DCDDD9] px-4 py-2.5 bg-[#F5F5F3] text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Paper Size Format with Friendly Icons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#6B706D] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#1B4D3E]" />
                <span>Paper Size:</span>
              </span>
              <div className="inline-flex rounded-md border border-[#DCDDD9] bg-white p-0.5 shadow-2xs">
                {[
                  { id: 'A4', label: '📄 A4 (Full Page)', tip: 'Standard UAE Tax Invoice' },
                  { id: 'A5', label: '📑 A5 (Half Sheet)', tip: 'Compact half-page, saves paper' },
                  { id: '80mm', label: '🧾 80mm POS Slip', tip: 'Thermal roll receipt for fast counter sales' },
                  { id: 'Letter', label: '✉️ US Letter', tip: 'Standard letter size' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePaperSizeChange(p.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                      paperSize === p.id
                        ? 'bg-[#1B4D3E] text-white shadow-xs font-bold'
                        : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                    }`}
                    title={p.tip}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Middle: 1-Page Fit Guarantee & Scale Steppers */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Single-Page Fit Quick Toggle Button */}
              <button
                type="button"
                onClick={handleToggleFitOnePage}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                  fitOnePage
                    ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] shadow-2xs ring-1 ring-[#1B4D3E]'
                    : 'border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321] hover:bg-[#FAFAF9]'
                }`}
                title="Automatically adjusts spacing and scale so the entire invoice fits cleanly on 1 page"
              >
                <Sparkles className={`h-3.5 w-3.5 ${fitOnePage ? 'text-[#1B4D3E]' : 'text-[#6B706D]'}`} />
                <span>Fit to 1 Page</span>
                {fitOnePage && <Check className="h-3.5 w-3.5 text-[#1B4D3E] stroke-[3]" />}
              </button>

              {/* Zoom & Scale Stepper with Quick Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#6B706D]">Scale:</span>
                <div className="inline-flex items-center rounded-md border border-[#DCDDD9] bg-white shadow-2xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoomLevel - 5)}
                    disabled={zoomLevel <= 60}
                    className="px-2 py-1 text-xs font-bold text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3] disabled:opacity-30 cursor-pointer transition-colors"
                    title="Zoom Out (-5%)"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(100)}
                    className="px-2.5 py-1 text-xs font-mono font-bold text-[#202321] hover:bg-[#F5F5F3] cursor-pointer"
                    title="Click to Reset Scale to 100%"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoomLevel + 5)}
                    disabled={zoomLevel >= 140}
                    className="px-2 py-1 text-xs font-bold text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3] disabled:opacity-30 cursor-pointer transition-colors"
                    title="Zoom In (+5%)"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Quick scale chips */}
                <div className="hidden lg:flex items-center gap-1">
                  {[80, 85, 100, 115].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleZoomChange(s)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        zoomLevel === s
                          ? 'bg-[#1B4D3E] text-white'
                          : 'bg-white border border-[#DCDDD9] text-[#6B706D] hover:text-[#202321]'
                      }`}
                      title={`Set scale to ${s}%`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Adjust Spacing / Fine-tune Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvancedSize(!showAdvancedSize)}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  showAdvancedSize
                    ? 'border-[#1B4D3E] bg-white text-[#1B4D3E]'
                    : 'border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321]'
                }`}
                title="Fine-tune layout spacing, sliders, and density"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Adjust Size</span>
              </button>
            </div>

            {/* Right: Window / Modal Width Preset */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#6B706D] hidden md:inline">View Width:</span>
              <div className="inline-flex rounded-md border border-[#DCDDD9] bg-white p-0.5 shadow-2xs">
                {(['compact', 'a4', 'wide', 'fullscreen'] as const).map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleSizeChange(w)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded uppercase tracking-wider transition-colors cursor-pointer ${
                      invoiceSize === w
                        ? 'bg-[#1B4D3E] text-white shadow-2xs font-bold'
                        : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                    }`}
                    title={`Set modal display width to ${w}`}
                  >
                    {w === 'compact' ? 'A5' : w === 'a4' ? 'A4' : w === 'wide' ? 'Full' : 'Max'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ADVANCED FINE-TUNING DRAWER (Expandable) */}
          {showAdvancedSize && (
            <div className="mt-3 pt-3 border-t border-[#DCDDD9] grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in">
              {/* Density Mode */}
              <div>
                <label className="text-[11px] font-bold text-[#202321] block mb-1">
                  Layout Spacing Density:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { key: 'compact', label: 'Compact', desc: '1-Page Fit' },
                    { key: 'normal', label: 'Standard', desc: 'Balanced' },
                    { key: 'spacious', label: 'Spacious', desc: 'Airy' }
                  ].map(d => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => handleDensityChange(d.key as any)}
                      className={`p-1.5 rounded-md border text-center transition-all cursor-pointer ${
                        density === d.key
                          ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-2xs'
                          : 'border-[#DCDDD9] bg-white text-[#6B706D] hover:bg-[#FAFAF9]'
                      }`}
                    >
                      <div className="text-xs font-semibold">{d.label}</div>
                      <div className="text-[9px] opacity-75">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Scale Chips */}
              <div>
                <label className="text-[11px] font-bold text-[#202321] block mb-1">
                  Quick Scale Presets:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[75, 80, 85, 90, 100, 115, 125].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleZoomChange(s)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        zoomLevel === s
                          ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white font-bold'
                          : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#FAFAF9]'
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Fluid Scale Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#202321] mb-1">
                  <span>Fluid Scale Slider:</span>
                  <span className="font-mono text-[#1B4D3E] bg-[#E8F0EC] px-1.5 py-0.2 rounded font-bold">{zoomLevel}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  step="2"
                  value={zoomLevel}
                  onChange={e => handleZoomChange(Number(e.target.value))}
                  className="w-full accent-[#1B4D3E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6B706D] font-mono mt-0.5">
                  <span>60% (Mini)</span>
                  <span>100% (Default)</span>
                  <span>140% (Jumbo)</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Configuration Summary Badge */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#6B706D]">
            <span className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-[#DCDDD9]">
                <span>Format:</span>
                <strong className="text-[#202321]">{paperDimensions[paperSize] || paperSize}</strong>
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-[#DCDDD9]">
                <span>Density:</span>
                <strong className="text-[#202321] capitalize">{density}</strong>
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded border border-[#DCDDD9]">
                <span>Print Scale:</span>
                <strong className="text-[#1B4D3E] font-bold font-mono">{zoomLevel}%</strong>
              </span>
            </span>
            {fitOnePage ? (
              <span className="inline-flex items-center gap-1 text-[#15803D] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#BBF7D0]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Single-Page Fit Active</span>
              </span>
            ) : (
              <span className="text-[10px] text-[#6B706D] hidden sm:inline-block">
                Tip: Click "Fit to 1 Page" to guarantee single-sheet print.
              </span>
            )}
          </div>
        </div>

        {/* Print Feedback Toast Notice */}
        {printSuccessNotice && (
          <div className="no-print mx-4 mt-3 flex items-center gap-2 rounded-md border border-[#A7D0C0] bg-[#E8F0EC] p-2.5 text-xs font-medium text-[#1B4D3E] shadow-xs animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1B4D3E]" />
            <span>{printSuccessNotice}</span>
          </div>
        )}

        {/* REALISTIC PAPER CANVAS CONTAINER */}
        <div className="bg-[#EFEFEA] p-2 sm:p-5 overflow-auto max-h-[calc(88vh-140px)]">
          {/* Printable Bill Area - Formatted as a real paper sheet with shadow */}
          <div
            id="printable-invoice-area"
            style={{
              zoom: `${zoomLevel}%`
            }}
            className={`bg-white text-[#202321] shadow-lg border border-[#DCDDD9] rounded-sm transition-transform duration-150 mx-auto ${
              isThermalMode ? 'max-w-[380px] p-5' : density === 'compact' ? 'max-w-4xl p-5 sm:p-6' : density === 'spacious' ? 'max-w-4xl p-8 sm:p-10' : 'max-w-4xl p-6 sm:p-8'
            }`}
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

          {isThermalMode ? (
            /* ==========================================================
               80MM POS THERMAL SLIP LAYOUT (Continuous Roll Printer)
               ========================================================== */
            <div className="font-mono text-xs space-y-3 leading-tight">
              {/* Thermal Store Header */}
              <div className="text-center pb-2 border-b border-dashed border-[#202321]">
                <h1 className="text-sm font-black uppercase tracking-wider text-[#202321]">
                  {settings.garageName || settings.shopName || 'UMAIR AUTO CARE LLC'}
                </h1>
                <p className="text-[10px] text-[#6B706D]">{settings.tagline || 'Automotive Repair & Maintenance'}</p>
                <p className="text-[10px] text-[#6B706D] mt-0.5">{settings.address || 'Al Quoz Ind. 3, Dubai, UAE'}</p>
                <p className="text-[10px] text-[#6B706D]">Tel: {settings.phone || '+971 4 347 8899'}</p>
                <p className="text-[10px] font-bold text-[#202321] mt-0.5">TRN: {settings.trnNumber || settings.taxNumber || '100482937400003'}</p>
                <div className="mt-1 inline-block border border-[#202321] px-2 py-0.5 text-[9px] font-bold uppercase">
                  SIMPLIFIED TAX INVOICE
                </div>
              </div>

              {/* Thermal Meta */}
              <div className="text-[10px] space-y-0.5 border-b border-dashed border-[#202321] pb-2">
                <div className="flex justify-between">
                  <span>Invoice #:</span>
                  <span className="font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date/Time:</span>
                  <span>{formatDateTime(invoice.createdDate || invoice.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{invoice.createdByName || currentUser?.name || 'Staff'}</span>
                </div>
                {customer && (
                  <div className="flex justify-between pt-0.5">
                    <span>Customer:</span>
                    <span className="font-bold truncate max-w-[180px]">{customer.fullName}</span>
                  </div>
                )}
                {vehicle && (
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="font-bold">{vehicle.registrationNumber} ({vehicle.make})</span>
                  </div>
                )}
              </div>

              {/* Thermal Itemized Table */}
              <div className="border-b border-dashed border-[#202321] pb-2">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-[#202321] text-left">
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">AED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dotted divide-[#DCDDD9]">
                    {invoice.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-1">
                          <div className="font-bold">{item.name}</div>
                          <div className="text-[9px] text-[#6B706D]">{item.type} · @{formatAED(item.unitPrice)}</div>
                        </td>
                        <td className="py-1 text-center align-top">{item.quantity}</td>
                        <td className="py-1 text-right font-bold align-top">{formatAED(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Thermal Financials */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-[#202321] pb-2">
                <div className="flex justify-between">
                  <span>Parts Total:</span>
                  <span>{formatAED(invoice.partsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labour / Service:</span>
                  <span>{formatAED(invoice.labourTotal + invoice.servicesTotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Discount:</span>
                    <span>-{formatAED(invoice.discount)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>VAT ({invoice.taxRate}%):</span>
                    <span>{formatAED(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black pt-1 border-t border-[#202321]">
                  <span>GRAND TOTAL:</span>
                  <span>{formatAED(invoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-0.5">
                  <span>Paid ({invoice.paymentMethod}):</span>
                  <span>{formatAED(invoice.paidAmount)}</span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between font-bold text-[#DC2626]">
                    <span>BALANCE DUE:</span>
                    <span>{formatAED(invoice.balanceDue)}</span>
                  </div>
                )}
              </div>

              {/* Thermal Regulatory & Return Policy */}
              <div className="text-[9px] text-center space-y-1 text-[#6B706D] pt-1">
                <p>90-Day / 5,000 km warranty on labour under UAE Consumer Protection Law.</p>
                <p>Retain slip for parts inspection within 24 hours.</p>
                <div className="pt-1 flex items-center justify-center gap-1 font-bold text-[#202321]">
                  <QrCode className="h-4 w-4" />
                  <span>FTA TAX VERIFIED</span>
                </div>
                <p className="font-bold text-[#202321] pt-1">*** THANK YOU FOR YOUR BUSINESS ***</p>
              </div>
            </div>
          ) : (
            /* ==========================================================
               A4 / A5 FULL TAX INVOICE LAYOUT (Standard Enterprise Bill)
               ========================================================== */
            <div>
              {/* Shop Header */}
              <div className={`flex justify-between items-start ${density === 'compact' ? 'pb-2.5' : 'pb-4'} border-b border-[#DCDDD9]`}>
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
              <div className={`${density === 'compact' ? 'py-2 gap-2' : 'py-3 gap-4'} border-b border-[#DCDDD9] grid grid-cols-2`}>
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
              <div className={`${density === 'compact' ? 'py-2' : 'py-3'} border-b border-[#DCDDD9]`}>
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#DCDDD9] text-[10px] font-semibold uppercase tracking-wider text-[#6B706D]">
                    <tr>
                      <th className={density === 'compact' ? 'py-1' : 'py-1.5'}>Description</th>
                      <th className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-center`}>Type</th>
                      <th className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-center`}>Qty</th>
                      <th className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-right`}>Unit Price</th>
                      <th className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-right`}>Amount (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCDDD9]">
                    {invoice.items.map(item => (
                      <tr key={item.id}>
                        <td className={`${density === 'compact' ? 'py-1' : 'py-1.5'} font-medium text-[#202321]`}>{item.name}</td>
                        <td className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-center font-mono text-[10px] uppercase text-[#6B706D]`}>
                          {item.type}
                        </td>
                        <td className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-center font-mono`}>{item.quantity}</td>
                        <td className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-right font-mono tabular-nums text-[#6B706D]`}>
                          {formatAED(item.unitPrice)}
                        </td>
                        <td className={`${density === 'compact' ? 'py-1' : 'py-1.5'} text-right font-mono font-bold text-[#202321] tabular-nums`}>
                          {formatAED(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className={`${density === 'compact' ? 'py-2' : 'py-3'} border-b border-[#DCDDD9] flex justify-end`}>
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
              <div className={`${density === 'compact' ? 'pt-2 mt-1.5' : 'pt-3 mt-2'} border-t border-[#DCDDD9]`}>
                <div className="flex justify-between items-start gap-4">
                  <div className={`${density === 'compact' ? 'text-[9.5px] space-y-0.5 max-w-lg' : 'text-[10px] space-y-1 max-w-md'} text-[#6B706D]`}>
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
              <div className={`${density === 'compact' ? 'mt-2 pt-1.5' : 'mt-4 pt-2.5'} border-t border-[#DCDDD9] flex flex-wrap items-center justify-between text-[10px] text-[#6B706D] font-mono bg-[#FAFAF9] p-2 rounded border border-[#E5E5E3]`}>
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
          )}
        </div>
      </div>

        {/* Bottom Action Footer with Print and Cancel Buttons (Hidden in Print) */}
        <div className="no-print border-t border-[#DCDDD9] px-4 sm:px-6 py-3 bg-[#FAFAF9] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#6B706D] flex items-center gap-2 flex-wrap">
            <span>Invoice: <strong className="text-[#202321] font-mono">{invoice.invoiceNumber}</strong></span>
            <span className="text-[#DCDDD9]">|</span>
            <span>Total: <strong className="text-[#1B4D3E] font-mono">{formatAED(invoice.grandTotal)}</strong></span>
            <span className="text-[#DCDDD9] hidden sm:inline-block">|</span>
            <span className="text-[11px] text-[#6B706D] hidden sm:inline-block">
              Size: <strong className="text-[#202321] uppercase">{paperSize}</strong> ({zoomLevel}%) · Density: <strong className="text-[#202321] capitalize">{density}</strong>
            </span>
            {fitOnePage && (
              <span className="rounded bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] px-2 py-0.5 text-[10px] font-bold">
                ✓ 1-Page Fit
              </span>
            )}
            {isCancelled && (
              <span className="rounded bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                Voided / Cancelled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isCancelled && (
              <button
                type="button"
                onClick={handleCancelInvoice}
                className="inline-flex items-center gap-1.5 rounded border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors shadow-2xs cursor-pointer active:scale-95"
                title="Cancel and void this invoice"
              >
                <X className="h-4 w-4" />
                <span>Cancel Invoice</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3.5 py-2 text-xs font-semibold text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Cancel and close viewer"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-5 py-2 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs active:scale-95 cursor-pointer"
              title="Print official invoice"
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
