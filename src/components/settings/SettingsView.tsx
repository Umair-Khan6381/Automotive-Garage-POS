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
  Upload
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
      defaultOilChangeKm: Number(defaultOilChangeKm)
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
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">NTN / STRN Tax Number</label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
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

        {/* Section 2: Billing & Stock Defaults */}
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
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Default GST / Tax Rate (%)</label>
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
              <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Bill Footer Terms / Warranty</label>
              <input
                type="text"
                value={invoiceFooterNote}
                onChange={e => setInvoiceFooterNote(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Typography & Font Specification */}
        <div className="rounded border border-[#DCDDD9] bg-white p-4">
          <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-2 mb-3">
            <Type className="h-4 w-4 text-[#1B4D3E]" />
            <h2 className="text-sm font-bold text-[#202321]">Typography & Application Font Specification</h2>
          </div>

          <div className="space-y-4">
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
              <p className="text-xs text-[#6B706D] mt-2">
                Applied globally across all floor terminals, counter POS desks, work orders, invoices, and analytics tables.
              </p>
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
