import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle,
  Building,
  FileText,
  Type,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  Database,
  Download,
  Upload,
  Printer,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, currentUser, setActiveView } = useShop();

  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [taxNumber, setTaxNumber] = useState(settings.taxNumber);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings.defaultTaxRate);

  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [invoiceFooterNote, setInvoiceFooterNote] = useState(settings.invoiceFooterNote);

  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold);
  const [allowNegativeStock, setAllowNegativeStock] = useState(settings.allowNegativeStock);

  const [defaultOilChangeMonths, setDefaultOilChangeMonths] = useState(settings.defaultOilChangeMonths);
  const [defaultOilChangeKm, setDefaultOilChangeKm] = useState(settings.defaultOilChangeKm);

  // Dubai Regulatory Settings
  const [trnNumber, setTrnNumber] = useState(settings.trnNumber || '100482937400003');
  const [dedLicenseNumber, setDedLicenseNumber] = useState(settings.dedLicenseNumber || 'CN-1094829');
  const [rtaPermitNumber, setRtaPermitNumber] = useState(settings.rtaPermitNumber || 'RTA-VTS-2026-401');
  const [dmEnvironmentalPermit, setDmEnvironmentalPermit] = useState(settings.dmEnvironmentalPermit || 'DM-EHS-WST-8821');
  const [storageGraceHours, setStorageGraceHours] = useState(settings.storageGraceHours || 72);
  const [dailyStorageFeeAED, setDailyStorageFeeAED] = useState(settings.dailyStorageFeeAED || 50);
  const [workmanshipWarrantyDays, setWorkmanshipWarrantyDays] = useState(settings.workmanshipWarrantyDays || 90);
  const [workmanshipWarrantyKm, setWorkmanshipWarrantyKm] = useState(settings.workmanshipWarrantyKm || 5000);

  // Default Invoice Paper & Sizing Preferences
  const [defaultPaperSize, setDefaultPaperSize] = useState<'A4' | 'A5' | '80mm' | 'Letter'>(() => {
    return (localStorage.getItem('umair_invoice_paper_size') as any) || 'A4';
  });
  const [defaultInvoiceScale, setDefaultInvoiceScale] = useState<number>(() => {
    const s = localStorage.getItem('umair_invoice_zoom_level');
    return s ? Number(s) : 100;
  });
  const [defaultInvoiceDensity, setDefaultInvoiceDensity] = useState<'compact' | 'normal' | 'spacious'>(() => {
    return (localStorage.getItem('umair_invoice_density') as any) || 'normal';
  });
  const [defaultFitOnePage, setDefaultFitOnePage] = useState<boolean>(() => {
    return localStorage.getItem('umair_invoice_fit_one_page') === 'true';
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName,
      tagline,
      phone,
      email,
      address,
      taxNumber,
      currency,
      defaultTaxRate: Number(defaultTaxRate),
      invoicePrefix,
      invoiceFooterNote,
      lowStockThreshold: Number(lowStockThreshold),
      allowNegativeStock,
      defaultOilChangeMonths: Number(defaultOilChangeMonths),
      defaultOilChangeKm: Number(defaultOilChangeKm),
      trnNumber,
      dedLicenseNumber,
      rtaPermitNumber,
      dmEnvironmentalPermit,
      storageGraceHours: Number(storageGraceHours),
      dailyStorageFeeAED: Number(dailyStorageFeeAED),
      workmanshipWarrantyDays: Number(workmanshipWarrantyDays),
      workmanshipWarrantyKm: Number(workmanshipWarrantyKm)
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Workshop Configuration & Shop Identity
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Configure workshop profile, default invoice print settings, currency, and stock rules
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset workshop demo data back to clean factory state?')) {
              resetToDemoData();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Factory Demo Data</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Workshop configurations successfully saved and applied across all modules.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
        {/* Section 1: Business Identity */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-2 font-bold text-xs uppercase tracking-wider text-[#202321]">
            <Building className="h-4 w-4 text-[#1B4D3E]" />
            <span>Workshop Profile & Print Header</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Workshop Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Telephone Contact *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Physical Workshop Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">UAE TRN (Tax Registration Number)</label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder="100482937400003"
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">System Currency</label>
              <input
                type="text"
                value={currency}
                disabled
                className="w-full rounded border border-[#DCDDD9] bg-[#F5F5F3] px-2.5 py-1.5 font-mono text-[#6B706D]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dubai Regulatory Licenses & Statutory Policies */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#202321]">
              <ShieldCheck className="h-4 w-4 text-[#1B4D3E]" />
              <span>Dubai Regulatory Compliance & Statutory Licenses (تراخيص دبي الرسمية)</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('dubai_policies')}
              className="text-xs text-[#1B4D3E] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Dubai Policies</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                Dubai Economy & Tourism (DET / DED) Trade License #
              </label>
              <input
                type="text"
                value={dedLicenseNumber}
                onChange={e => setDedLicenseNumber(e.target.value)}
                placeholder="CN-1094829"
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                RTA Technical Workshop Classification / Permit #
              </label>
              <input
                type="text"
                value={rtaPermitNumber}
                onChange={e => setRtaPermitNumber(e.target.value)}
                placeholder="RTA-VTS-2026-401"
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                Dubai Municipality EHS Hazardous Waste Disposal Ref
              </label>
              <input
                type="text"
                value={dmEnvironmentalPermit}
                onChange={e => setDmEnvironmentalPermit(e.target.value)}
                placeholder="DM-EHS-WST-8821"
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                Vehicle Daily Storage Fee (AED / Day after 72h Grace)
              </label>
              <input
                type="number"
                value={dailyStorageFeeAED}
                onChange={e => setDailyStorageFeeAED(Number(e.target.value))}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                Standard Workmanship Warranty (Days) - Law 15/2020
              </label>
              <input
                type="number"
                value={workmanshipWarrantyDays}
                onChange={e => setWorkmanshipWarrantyDays(Number(e.target.value))}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                Standard Workmanship Warranty (Kilometers)
              </label>
              <input
                type="number"
                value={workmanshipWarrantyKm}
                onChange={e => setWorkmanshipWarrantyKm(Number(e.target.value))}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Billing & Stock Defaults */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-2 font-bold text-xs uppercase tracking-wider text-[#202321]">
            <FileText className="h-4 w-4 text-[#1B4D3E]" />
            <span>Billing Defaults & Service Interval Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={e => setInvoicePrefix(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Default UAE VAT Rate (%) (FTA 5%)</label>
              <input
                type="number"
                value={defaultTaxRate}
                onChange={e => setDefaultTaxRate(Number(e.target.value))}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Oil Change Interval (Months)</label>
              <input
                type="number"
                value={defaultOilChangeMonths}
                onChange={e => setDefaultOilChangeMonths(Number(e.target.value))}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Oil Change Interval (Kilometers)</label>
              <input
                type="number"
                value={defaultOilChangeKm}
                onChange={e => setDefaultOilChangeKm(Number(e.target.value))}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Dubai Tax Invoice Terms & Legal Warranty Notice</label>
              <input
                type="text"
                value={invoiceFooterNote}
                onChange={e => setInvoiceFooterNote(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Default Invoice Print Size & Paper Formats */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#202321]">
              <Printer className="h-4 w-4 text-[#1B4D3E]" />
              <span>Default Invoice Print Size & Paper Format (ڈیفالٹ انوائس سائز ایڈجسٹمنٹ)</span>
            </div>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E]">
              Current: {defaultPaperSize} ({defaultInvoiceScale}%)
            </span>
          </div>

          <p className="text-xs text-[#6B706D]">
            Set the default paper size, zoom scale, and layout density for invoices generated in POS, Workshop Job Cards, and Billing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Paper Size Setting */}
            <div>
              <label className="text-[11px] font-bold text-[#202321] block mb-1.5">
                Default Target Paper:
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'A4', label: 'A4 (210 × 297 mm)', desc: 'Standard Full Page Tax Invoice' },
                  { id: 'A5', label: 'A5 (148 × 210 mm)', desc: 'Half-Sheet (Saves 50% Paper)' },
                  { id: '80mm', label: '80mm Thermal Slip', desc: 'Continuous POS Counter Receipt' },
                  { id: 'Letter', label: 'US Letter (8.5 × 11 in)', desc: 'North American Standard' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDefaultPaperSize(opt.id as any);
                      localStorage.setItem('umair_invoice_paper_size', opt.id);
                      localStorage.setItem('umair_invoice_modal_size', opt.id === '80mm' ? 'thermal' : opt.id === 'A5' ? 'compact' : 'a4');
                    }}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      defaultPaperSize === opt.id
                        ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-2xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] opacity-75">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Scale Level */}
            <div>
              <label className="text-[11px] font-bold text-[#202321] block mb-1.5">
                Default Print & Preview Scale:
              </label>
              <div className="space-y-1.5">
                {[
                  { scale: 80, label: '80% (Compact Single-Page)', desc: 'Guaranteed 1-Page Fit for long jobs' },
                  { scale: 85, label: '85% (Optimized Fit)', desc: 'Recommended balanced single page' },
                  { scale: 100, label: '100% (Standard 1:1)', desc: 'Exact physical proportions' },
                  { scale: 115, label: '115% (High Visibility)', desc: 'Enlarged text for easy reading' }
                ].map(opt => (
                  <button
                    key={opt.scale}
                    type="button"
                    onClick={() => {
                      setDefaultInvoiceScale(opt.scale);
                      localStorage.setItem('umair_invoice_zoom_level', opt.scale.toString());
                    }}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      defaultInvoiceScale === opt.scale
                        ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-2xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] opacity-75">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Density & Fit Feature */}
            <div>
              <label className="text-[11px] font-bold text-[#202321] block mb-1.5">
                Default Layout Density:
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'compact', label: 'Compact Spacing', desc: 'Tight margins & rows for 1-page bills' },
                  { id: 'normal', label: 'Standard Spacing', desc: 'Standard business margins' },
                  { id: 'spacious', label: 'Spacious / Relaxed', desc: 'Larger breathing room between items' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDefaultInvoiceDensity(opt.id as any);
                      localStorage.setItem('umair_invoice_density', opt.id);
                    }}
                    className={`w-full text-left p-2 rounded border transition-all ${
                      defaultInvoiceDensity === opt.id
                        ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-2xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] opacity-75">{opt.desc}</div>
                  </button>
                ))}

                {/* Auto Single-Page Fit Default */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 p-2 rounded border border-[#DCDDD9] bg-[#FAFAF9] cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={defaultFitOnePage}
                      onChange={e => {
                        setDefaultFitOnePage(e.target.checked);
                        localStorage.setItem('umair_invoice_fit_one_page', e.target.checked ? 'true' : 'false');
                        if (e.target.checked) {
                          setDefaultInvoiceDensity('compact');
                          setDefaultInvoiceScale(85);
                          localStorage.setItem('umair_invoice_density', 'compact');
                          localStorage.setItem('umair_invoice_zoom_level', '85');
                        }
                      }}
                      className="accent-[#1B4D3E] h-4 w-4 rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#202321]">Always Fit on 1 Single Page</div>
                      <div className="text-[10px] text-[#6B706D]">Prevents invoice details from overflowing to a 2nd sheet</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Typography & Font Specification */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4">
          <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-2 mb-3">
            <Type className="h-4 w-4 text-[#1B4D3E]" />
            <h2 className="text-sm font-bold text-[#202321]">Display Typography & Global Font Size (فونٹ سائز)</h2>
          </div>

          <div className="space-y-4">
            {/* Global Scale Controller */}
            <div>
              <label className="text-xs font-bold text-[#202321] block mb-1.5">
                Application Text Size & Zoom Level (سکرین فونٹ سائز منتخب کریں)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: '80% (Mini)', scale: '0.8', desc: 'Compact (80%)' },
                  { label: '90% (Small)', scale: '0.9', desc: 'Compact (90%)' },
                  { label: '100% (Normal)', scale: '1.0', desc: 'Standard (100%)' },
                  { label: '110% (Default)', scale: '1.1', desc: 'Comfortable (110%)' },
                  { label: '120% (Extra)', scale: '1.2', desc: 'Big & Clear (120%)' },
                  { label: '135% (Jumbo)', scale: '1.35', desc: 'Ultra (135%)' }
                ].map(opt => {
                  const currentScale = localStorage.getItem('garage_pos_font_scale') || '1.1';
                  const isSelected = currentScale === opt.scale;

                  return (
                    <button
                      key={opt.scale}
                      type="button"
                      onClick={() => {
                        localStorage.setItem('garage_pos_font_scale', opt.scale);
                        document.documentElement.style.setProperty('--app-font-scale', opt.scale);
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 2000);
                      }}
                      className={`p-2.5 rounded border text-left transition-all ${
                        isSelected
                          ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-xs'
                          : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#F5F5F3]'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[11px] opacity-75 mt-0.5">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#6B706D] mt-2">
                Immediate responsive scaling: Adjusts text and layout scaling across all desktop, laptop, tablet, and mobile views. The 80% option provides high information density for compact and split screens.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#202321] block mb-1">
                Active Application Font Style
              </label>
              <div className="flex items-center gap-3">
                <code className="rounded border border-[#DCDDD9] bg-[#F5F5F3] px-3 py-1.5 font-mono text-xs text-[#1B4D3E] font-semibold">
                  font-family: "Inter", sans-serif;
                </code>
                <span className="inline-flex items-center gap-1 rounded bg-[#E8F0EC] px-2 py-0.5 text-xs font-semibold text-[#1B4D3E]">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Active Globally
                </span>
              </div>
            </div>

            {/* Typography Hierarchy Reference Table */}
            <div className="pt-2 border-t border-[#DCDDD9]">
              <div className="text-xs font-semibold text-[#202321] mb-2">Enterprise Typography Hierarchy (Inter)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Page Title</span>
                  <span className="text-[15px] font-semibold text-[#202321]">24px / 600</span>
                </div>
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Section Heading</span>
                  <span className="text-[15px] font-semibold text-[#202321]">18px / 600</span>
                </div>
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Panel Heading</span>
                  <span className="text-[15px] font-semibold text-[#202321]">16px / 600</span>
                </div>
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Body & Table</span>
                  <span className="text-[15px] font-normal text-[#202321]">14px / 400</span>
                </div>
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Navigation / Button</span>
                  <span className="text-[15px] font-medium text-[#202321]">14px / 500</span>
                </div>
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Labels</span>
                  <span className="text-[15px] font-medium text-[#202321]">13px / 500</span>
                </div>
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Dashboard Metrics</span>
                  <span className="text-[15px] font-semibold text-[#202321]">24–28px / 600</span>
                </div>
                <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2">
                  <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Invoice Total</span>
                  <span className="text-[15px] font-semibold text-[#202321]">20–24px / 600</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Private Garage Security & Policy */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1B4D3E] text-white text-xs font-bold">§</span>
              <h2 className="text-sm font-bold text-[#202321]">Private Garage Security Policy & Access Mode</h2>
            </div>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
              Private Garage Mode: ENABLED
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#6B706D]">
              This workshop system runs in dedicated single-business mode. Public user registration is disabled, and customers are maintained purely as garage records without portal logins.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2.5">
                <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Public Signup</span>
                <span className="text-xs font-semibold text-[#DC2626]">Permanently Disabled</span>
              </div>
              <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2.5">
                <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Account Provisioning</span>
                <span className="text-xs font-semibold text-[#15803D]">Owner-Controlled Only</span>
              </div>
              <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2.5">
                <span className="text-[10px] uppercase font-bold text-[#6B706D] block">Brute-Force Shield</span>
                <span className="text-xs font-semibold text-[#15803D]">Active (5-attempt Lockout)</span>
              </div>
            </div>

            {/* Direct Link to Users & Access */}
            <div className="pt-3 border-t border-[#DCDDD9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-[#202321]">
                <span className="font-semibold block">Staff Accounts & Role Credentials</span>
                <span className="text-[#6B706D]">Create, edit, reset passwords, or disable accounts for Managers & Technicians.</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('users')}
                className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shrink-0"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Open Users & Access Manager</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Database Backup & Restore */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4">
          <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#1B4D3E]" />
              <h2 className="text-sm font-bold text-[#202321]">Database Backup & Disaster Recovery</h2>
            </div>
            <span className="text-[11px] text-[#6B706D]">Settings → Backup & Restore</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#6B706D]">
              Create an encrypted offline backup archive of your garage database or restore data from a previous file.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F5F3] p-3 rounded border border-[#DCDDD9]">
              <div>
                <span className="font-semibold text-xs text-[#202321] block">Backup & Disaster Recovery Console</span>
                <span className="text-[11px] text-[#6B706D]">Create verified .garagebak archives, restore snapshots, or export CSV spreadsheets.</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('backup')}
                className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shrink-0 shadow-xs"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Open Backup & Restore Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded bg-[#1B4D3E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>Save Workshop Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
