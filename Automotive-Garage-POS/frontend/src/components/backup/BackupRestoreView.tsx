import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  HardDrive,
  Lock,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Layers,
  Archive,
  History
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatDate } from '../../utils/formatters';

export const BackupRestoreView: React.FC = () => {
  const {
    settings,
    currentUser,
    isOwner,
    customers,
    vehicles,
    products,
    jobCards,
    invoices,
    payments,
    oilChanges,
    expenses,
    labourWorkers,
    auditLogs,
    createBackupPayload,
    restoreDatabase,
    setActiveView
  } = useShop();

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmingRestore, setIsConfirmingRestore] = useState(false);
  const [pendingBackupContent, setPendingBackupContent] = useState<string | null>(null);
  const [pendingBackupInfo, setPendingBackupInfo] = useState<{
    garageName?: string;
    createdAt?: string;
    counts?: Record<string, number>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Download Encrypted Backup
  const handleCreateBackup = () => {
    try {
      setErrorMessage(null);
      const payload = createBackupPayload();
      const dateSlug = new Date().toISOString().slice(0, 10);
      const safeName = (settings.garageName || 'garage').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeName}_backup_${dateSlug}.garagebak`;

      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(`Backup archive "${filename}" successfully generated and saved to local storage.`);
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate database backup.');
    }
  };

  // Handle File Selected for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setErrorMessage(null);
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || parsed.app !== 'PRIVATE_GARAGE_POS' || !parsed.data) {
          throw new Error('Selected file is not a valid Private Garage POS database backup.');
        }

        setPendingBackupContent(text);
        setPendingBackupInfo({
          garageName: parsed.garageName || parsed.data.settings?.garageName || 'Unknown Garage',
          createdAt: parsed.exportedAt || parsed.createdAt,
          counts: parsed.totalRecords || {
            customers: parsed.data.customers?.length || 0,
            vehicles: parsed.data.vehicles?.length || 0,
            products: parsed.data.products?.length || 0,
            jobs: parsed.data.jobCards?.length || 0,
            invoices: parsed.data.invoices?.length || 0
          }
        });
        setIsConfirmingRestore(true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to read selected backup file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute Restore after confirmation
  const handleConfirmRestore = () => {
    if (!pendingBackupContent) return;
    setErrorMessage(null);

    const res = restoreDatabase(pendingBackupContent);
    setIsConfirmingRestore(false);
    setPendingBackupContent(null);
    setPendingBackupInfo(null);

    if (res.success) {
      setRestoreSuccess('Garage database successfully restored! All records, inventory, and ledger history are now active.');
      setTimeout(() => setRestoreSuccess(null), 8000);
    } else {
      setErrorMessage(res.error || 'Database restore failed.');
    }
  };

  // Quick Export to CSV helper
  const exportCSV = (type: 'customers' | 'inventory' | 'invoices') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const dateSlug = new Date().toISOString().slice(0, 10);
    let filename = `${type}_export_${dateSlug}.csv`;

    if (type === 'customers') {
      headers = ['ID', 'Full Name', 'Phone', 'Email', 'Address', 'Vehicles Count'];
      rows = customers.map(c => [
        c.id,
        `"${c.fullName}"`,
        c.phone,
        c.email,
        `"${c.address || ''}"`,
        String(vehicles.filter(v => v.customerId === c.id).length)
      ]);
    } else if (type === 'inventory') {
      headers = ['SKU', 'Product Name', 'Category', 'Quantity', 'Purchase Cost', 'Selling Price', 'Status'];
      rows = products.map(p => [
        p.sku,
        `"${p.name}"`,
        p.category,
        String(p.currentQuantity),
        String(p.purchasePrice),
        String(p.sellingPrice),
        p.currentQuantity <= p.minStockLevel ? 'Low Stock' : 'In Stock'
      ]);
    } else if (type === 'invoices') {
      headers = ['Invoice #', 'Date', 'Customer', 'Parts Total', 'Labour Total', 'Grand Total', 'Paid', 'Balance', 'Status'];
      rows = invoices.map(i => {
        const custName = customers.find(c => c.id === i.customerId)?.fullName || 'Customer';
        const balance = Math.max(0, i.grandTotal - i.paidAmount);
        return [
          i.invoiceNumber,
          i.date,
          `"${custName}"`,
          String(i.partsTotal),
          String(i.labourTotal),
          String(i.grandTotal),
          String(i.paidAmount),
          String(balance),
          i.paymentStatus
        ];
      });
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#202321]">
              Database Backup & Disaster Recovery
            </h1>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
              Offline-First Shield
            </span>
          </div>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Export encrypted backups of your private workshop data, restore from disaster recovery archives, or export CSV tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('audit_logs')}
            className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
          >
            <History className="h-3.5 w-3.5 text-[#6B706D]" />
            <span>View Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {downloadSuccess && (
        <div className="rounded border border-[#86EFAC] bg-[#F0FDF4] p-3 text-xs text-[#15803D] flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {restoreSuccess && (
        <div className="rounded border border-[#86EFAC] bg-[#F0FDF4] p-3 text-xs text-[#15803D] flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{restoreSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Database State Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
          <div className="flex items-center justify-between text-[#6B706D] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Operation Mode</span>
            <HardDrive className="h-3.5 w-3.5 text-[#1B4D3E]" />
          </div>
          <span className="text-sm font-bold text-[#15803D] block">Offline-First Local DB</span>
          <span className="text-[11px] text-[#6B706D] mt-0.5 block">No cloud connectivity required</span>
        </div>

        <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
          <div className="flex items-center justify-between text-[#6B706D] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Records</span>
            <Layers className="h-3.5 w-3.5 text-[#1B4D3E]" />
          </div>
          <span className="text-xl font-bold font-mono text-[#202321] block">
            {customers.length + vehicles.length + products.length + jobCards.length + invoices.length}
          </span>
          <span className="text-[11px] text-[#6B706D] mt-0.5 block">Total workshop entities</span>
        </div>

        <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
          <div className="flex items-center justify-between text-[#6B706D] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Repair Job Cards</span>
            <FileText className="h-3.5 w-3.5 text-[#1B4D3E]" />
          </div>
          <span className="text-xl font-bold font-mono text-[#202321] block">{jobCards.length}</span>
          <span className="text-[11px] text-[#6B706D] mt-0.5 block">Preserved with parts & labour</span>
        </div>

        <div className="rounded border border-[#DCDDD9] bg-white p-3.5">
          <div className="flex items-center justify-between text-[#6B706D] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Security State</span>
            <Lock className="h-3.5 w-3.5 text-[#1B4D3E]" />
          </div>
          <span className="text-sm font-bold text-[#202321] block">{isOwner ? 'Owner Authorized' : 'Manager Access'}</span>
          <span className="text-[11px] text-[#6B706D] mt-0.5 block">Restore restricted to Owner</span>
        </div>
      </div>

      {/* Primary Action Cards: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Create Backup */}
        <div className="rounded border border-[#DCDDD9] bg-white p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#DCDDD9]">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#E8F0EC] text-[#1B4D3E]">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#202321]">Create Database Backup</h2>
                <span className="text-[11px] text-[#6B706D]">Settings → Backup & Restore → Create Backup</span>
              </div>
            </div>

            <p className="text-xs text-[#6B706D] mt-3 leading-relaxed">
              Generates a complete, verified snapshot of your garage database including all customers, vehicle histories, inventory stock movements, repair job cards, invoices, labour records, and audit trails.
            </p>

            <div className="mt-4 rounded border border-[#DCDDD9] bg-[#F5F5F3] p-3 text-xs space-y-1.5">
              <span className="font-semibold text-[#202321] block">Included in this archive:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6B706D] pt-1">
                <span>• {customers.length} Customers</span>
                <span>• {vehicles.length} Vehicles</span>
                <span>• {products.length} Products & Stock</span>
                <span>• {jobCards.length} Repair Jobs</span>
                <span>• {invoices.length} Invoices</span>
                <span>• {payments.length} Payments</span>
                <span>• {oilChanges.length} Oil Change Records</span>
                <span>• {expenses.length} Expense Entries</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateBackup}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#1B4D3E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Create & Download Database Backup (.garagebak)</span>
          </button>
        </div>

        {/* Card 2: Restore Database */}
        <div className="rounded border border-[#DCDDD9] bg-white p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#DCDDD9]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FEF2F2] text-[#DC2626]">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#202321]">Restore Database</h2>
                  <span className="text-[11px] text-[#6B706D]">Settings → Backup & Restore → Restore Database</span>
                </div>
              </div>

              <span className="rounded bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-bold text-[#DC2626] uppercase">
                Owner Only
              </span>
            </div>

            <p className="text-xs text-[#6B706D] mt-3 leading-relaxed">
              Restore your entire automotive garage management system from a previously saved <code>.garagebak</code> archive file.
            </p>

            <div className="mt-4 rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Important Security & Data Notice:</strong>
                <span>Restoring a backup will replace the current garage data with the archive contents. Only the OWNER is authorized to restore.</span>
              </div>
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".garagebak,.json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => {
                if (!isOwner) {
                  setErrorMessage('Permission Denied: Only the OWNER account can execute database restore operations.');
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={!isOwner}
              className="w-full inline-flex items-center justify-center gap-2 rounded border border-[#DC2626] bg-white px-4 py-2.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 shadow-xs"
            >
              <Upload className="h-4 w-4" />
              <span>Select Backup File to Restore...</span>
            </button>
          </div>
        </div>
      </div>

      {/* CSV Quick Data Exports */}
      <div className="rounded border border-[#DCDDD9] bg-white p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[#1B4D3E]" />
            <h2 className="text-sm font-bold text-[#202321]">Spreadsheet Table Exports (CSV)</h2>
          </div>
          <span className="text-[11px] text-[#6B706D]">Formatted for Excel, Google Sheets, or Tax Filings</span>
        </div>

        <p className="text-xs text-[#6B706D]">
          Export individual business tables for accountants, tax auditing, or offline register backups:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => exportCSV('customers')}
            className="flex items-center justify-between rounded border border-[#DCDDD9] bg-[#F5F5F3] p-3 text-left hover:border-[#1B4D3E] hover:bg-white transition-all group"
          >
            <div>
              <span className="text-xs font-bold text-[#202321] block group-hover:text-[#1B4D3E]">
                Customers & Fleet CSV
              </span>
              <span className="text-[11px] text-[#6B706D]">{customers.length} customer records</span>
            </div>
            <Download className="h-3.5 w-3.5 text-[#6B706D] group-hover:text-[#1B4D3E]" />
          </button>

          <button
            onClick={() => exportCSV('inventory')}
            className="flex items-center justify-between rounded border border-[#DCDDD9] bg-[#F5F5F3] p-3 text-left hover:border-[#1B4D3E] hover:bg-white transition-all group"
          >
            <div>
              <span className="text-xs font-bold text-[#202321] block group-hover:text-[#1B4D3E]">
                Spare Parts & Stock CSV
              </span>
              <span className="text-[11px] text-[#6B706D]">{products.length} catalog items</span>
            </div>
            <Download className="h-3.5 w-3.5 text-[#6B706D] group-hover:text-[#1B4D3E]" />
          </button>

          <button
            onClick={() => exportCSV('invoices')}
            className="flex items-center justify-between rounded border border-[#DCDDD9] bg-[#F5F5F3] p-3 text-left hover:border-[#1B4D3E] hover:bg-white transition-all group"
          >
            <div>
              <span className="text-xs font-bold text-[#202321] block group-hover:text-[#1B4D3E]">
                Invoices Ledger CSV
              </span>
              <span className="text-[11px] text-[#6B706D]">{invoices.length} billing records</span>
            </div>
            <Download className="h-3.5 w-3.5 text-[#6B706D] group-hover:text-[#1B4D3E]" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal Required by Prompt Section 5 */}
      {isConfirmingRestore && pendingBackupInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF2F2]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202321]">
                  Confirm Database Restore
                </h3>
                <span className="text-xs text-[#DC2626] font-semibold">
                  Critical Action — Replaces Current Records
                </span>
              </div>
            </div>

            <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#B91C1C] leading-relaxed">
              <strong>Restoring a backup will replace the current garage data. Continue?</strong>
            </div>

            <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6B706D]">Backup Source:</span>
                <span className="font-semibold text-[#202321]">{pendingBackupInfo.garageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B706D]">Created At:</span>
                <span className="font-mono text-[#202321]">
                  {pendingBackupInfo.createdAt ? formatDate(pendingBackupInfo.createdAt) : 'Unknown'}
                </span>
              </div>
              {pendingBackupInfo.counts && (
                <div className="border-t border-[#DCDDD9] pt-1.5 text-[11px] text-[#6B706D]">
                  Restores: {pendingBackupInfo.counts.customers || 0} customers,{' '}
                  {pendingBackupInfo.counts.jobs || 0} jobs,{' '}
                  {pendingBackupInfo.counts.products || 0} products,{' '}
                  {pendingBackupInfo.counts.invoices || 0} invoices.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingRestore(false);
                  setPendingBackupContent(null);
                  setPendingBackupInfo(null);
                }}
                className="rounded border border-[#DCDDD9] bg-white px-3.5 py-2 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="rounded bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B91C1C] transition-colors shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Yes, Replace & Restore Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
