import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Trash2,
  DollarSign,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Invoice, PaymentMethod } from '../../types';
import { formatAED, formatDate } from '../../utils/formatters';
import { InvoiceDetailModal } from './InvoiceDetailModal';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    customers,
    vehicles,
    recordInvoicePayment,
    cancelInvoice,
    deleteInvoice,
    setActiveView
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<string | null>(null);

  // Payment Recording Modal
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const openPaymentModal = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentInvoice(inv);
    setPayAmount(inv.balanceDue);
    setPayMethod('Cash');
    setPayRef(`RCV-${Date.now().toString().slice(-4)}`);
    setPayNotes('Payment collection on balance due');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || payAmount <= 0) return;

    recordInvoicePayment(paymentInvoice.id, payAmount, payMethod, payRef, payNotes);
    setPaymentInvoice(null);
  };

  const filteredInvoices = invoices.filter(inv => {
    const cust = customers.find(c => c.id === inv.customerId);
    const veh = vehicles.find(v => v.id === inv.vehicleId);
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search) ||
      cust?.fullName.toLowerCase().includes(search) ||
      veh?.registrationNumber.toLowerCase().includes(search);

    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalReceivables = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Customer Invoices & Billing Ledger
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Audit billing history, tax calculations, payment status, and receivables
          </p>
        </div>

        <button
          onClick={() => setActiveView('pos')}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>New POS Invoice</span>
        </button>
      </div>

      {/* Summary Ribbon */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-3">
        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Total Billing Issued
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
            {formatAED(totalInvoiced)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            {invoices.length} invoices generated
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Cash & Bank Collected
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#15803D]">
            {formatAED(totalCollected)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Disbursed and deposited
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Outstanding Receivables
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#B45309]">
            {formatAED(totalReceivables)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Unpaid or partial balances
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search invoice #, customer, plate..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-white border border-[#DCDDD9] rounded text-xs">
          {['all', 'Paid', 'Partially Paid', 'Unpaid', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#1B4D3E] text-white font-semibold'
                  : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
              }`}
            >
              {st === 'all' ? 'All Invoices' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Invoice #</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Vehicle Plate</th>
                <th className="px-3 py-2.5 text-right">Total (AED)</th>
                <th className="px-3 py-2.5 text-right">Paid</th>
                <th className="px-3 py-2.5 text-right">Balance Due</th>
                <th className="px-3 py-2.5 text-center">Payment Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#6B706D]">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const cust = customers.find(c => c.id === inv.customerId);
                  const veh = vehicles.find(v => v.id === inv.vehicleId);
                  const isCancelled = inv.paymentStatus === 'Cancelled' || inv.isCancelled;

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoiceForModal(inv.id)}
                      className={`hover:bg-[#F5F5F3] cursor-pointer transition-colors ${isCancelled ? 'bg-[#FEF2F2]/40 opacity-80' : ''}`}
                    >
                      <td className="px-3.5 py-2.5 font-mono font-bold text-[#1B4D3E]">
                        <span className={isCancelled ? 'line-through text-[#6B706D]' : ''}>
                          {inv.invoiceNumber}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[#6B706D]">
                        {formatDate(inv.date)}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-[#202321]">{cust?.fullName}</div>
                        <div className="text-[11px] text-[#6B706D] font-mono">{cust?.phone}</div>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-xs font-semibold text-[#202321]">
                        <span className="bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded">
                          {veh?.registrationNumber}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                        {formatAED(inv.grandTotal)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[#15803D] tabular-nums">
                        {formatAED(inv.paidAmount)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono tabular-nums font-bold">
                        <span className={inv.balanceDue > 0 && !isCancelled ? 'text-[#DC2626]' : 'text-[#6B706D]'}>
                          {formatAED(inv.balanceDue)}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                              : inv.paymentStatus === 'Partially Paid'
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                              : inv.paymentStatus === 'Cancelled'
                              ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                              : 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-right space-x-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedInvoiceForModal(inv.id)}
                          title="Print Official Invoice"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#A7D0C0] bg-[#E8F0EC] text-[11px] font-bold text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors cursor-pointer shadow-2xs active:scale-95"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print</span>
                        </button>

                        {!isCancelled && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel invoice #${inv.invoiceNumber}?\n\nThis will mark it as Cancelled and return all billed items back to inventory.`)) {
                                cancelInvoice(inv.id, 'Cancelled from Invoices ledger');
                              }
                            }}
                            title="Cancel and void invoice"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#FECACA] bg-[#FEF2F2] text-[11px] font-semibold text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer shadow-2xs active:scale-95"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}

                        {inv.balanceDue > 0 && !isCancelled && (
                          <button
                            onClick={e => openPaymentModal(inv, e)}
                            title="Collect Payment"
                            className="p-1 rounded border border-[#DCDDD9] bg-white text-[#B45309] hover:bg-[#FEF3C7] transition-colors"
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete invoice record ${inv.invoiceNumber}?`)) {
                              deleteInvoice(inv.id);
                            }
                          }}
                          title="Delete Invoice Record"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-sm rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Collect Payment ({paymentInvoice.invoiceNumber})
              </h3>
              <button onClick={() => setPaymentInvoice(null)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div className="bg-[#F5F5F3] p-2.5 rounded text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Grand Total:</span>
                  <span className="font-bold">{formatAED(paymentInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Already Paid:</span>
                  <span className="text-[#15803D]">{formatAED(paymentInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-[#DCDDD9] pt-1">
                  <span>Remaining Due:</span>
                  <span className="font-bold text-[#DC2626]">{formatAED(paymentInvoice.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Payment Amount to Collect (AED) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentInvoice.balanceDue}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono font-bold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  <option value="Cash">Cash (AED)</option>
                  <option value="Card">Credit / Debit Card (Visa / Mastercard)</option>
                  <option value="Bank Transfer">Bank Wire / IBAN Transfer</option>
                  <option value="Other">Corporate Cheque</option>
                </select>
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

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setPaymentInvoice(null)}
                  className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail / Print Modal */}
      {selectedInvoiceForModal && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
        />
      )}
    </div>
  );
};
