import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  Download,
  Eye,
  FileText,
  Calendar,
  CheckCircle2,
  DollarSign,
  Plus,
  X,
  Upload,
  User,
  Car,
  Receipt,
  Filter
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PaymentRecord, PaymentMethod, PaymentProof } from '../../types';
import { formatAED, formatDate, formatDateTime } from '../../utils/formatters';
import { CustomerPaymentReceiptModal } from '../invoices/CustomerPaymentReceiptModal';
import { PaymentProofModal } from '../common/PaymentProofModal';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    invoices,
    customers,
    vehicles,
    settings,
    recordInvoicePayment,
    attachPaymentProof,
    currentUser
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');

  // Receipt Modal State
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  // Proof Viewing Modal State
  const [viewingProof, setViewingProof] = useState<{ proof: PaymentProof; title: string } | null>(null);

  // New Payment Collection Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectInvoiceId, setCollectInvoiceId] = useState('');
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>('Cash');
  const [collectRef, setCollectRef] = useState('');
  const [collectNotes, setCollectNotes] = useState('');
  const [collectProofFile, setCollectProofFile] = useState<File | null>(null);

  // Unpaid or partially paid invoices that can receive payments
  const openInvoices = invoices.filter(i => i.balanceDue > 0 && i.paymentStatus !== 'Cancelled');

  const selectedInvoice = invoices.find(i => i.id === collectInvoiceId);

  const handleInvoiceSelect = (invId: string) => {
    setCollectInvoiceId(invId);
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setCollectAmount(inv.balanceDue);
      setCollectRef(`PAY-${Date.now().toString().slice(-4)}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCollectProofFile(e.target.files[0]);
    }
  };

  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectInvoiceId || collectAmount <= 0) return;

    recordInvoicePayment(collectInvoiceId, collectAmount, collectMethod, collectRef, collectNotes);

    // If proof file attached, convert to base64 and attach
    if (collectProofFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newPayment = payments[0]; // will be attached
        if (newPayment) {
          attachPaymentProof(newPayment.id, {
            id: `proof-${Date.now()}`,
            fileName: collectProofFile.name,
            fileType: collectProofFile.type,
            fileSize: collectProofFile.size,
            dataUrl,
            notes: collectNotes,
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser?.id || 'staff-1',
            uploadedByName: currentUser?.name || 'Staff'
          });
        }
      };
      reader.readAsDataURL(collectProofFile);
    }

    setIsCollectModalOpen(false);
    setCollectInvoiceId('');
    setCollectAmount(0);
    setCollectProofFile(null);
  };

  // Filtered Payments
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  const filteredPayments = payments.filter(p => {
    const cust = customers.find(c => c.id === p.customerId);
    const inv = invoices.find(i => i.id === p.invoiceId);
    const veh = inv ? vehicles.find(v => v.id === inv.vehicleId) : null;
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(search)) ||
      p.invoiceNumber.toLowerCase().includes(search) ||
      (cust && cust.fullName.toLowerCase().includes(search)) ||
      (veh && veh.registrationNumber.toLowerCase().includes(search)) ||
      (p.reference && p.reference.toLowerCase().includes(search));

    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = p.date.startsWith(todayStr);
    } else if (dateFilter === 'this_month') {
      matchesDate = p.date.startsWith(currentMonthStr);
    }

    return matchesSearch && matchesMethod && matchesDate;
  });

  // Financial Stats
  const totalCollections = payments.reduce((acc, p) => acc + p.amount, 0);
  const todayCollections = payments
    .filter(p => p.date.startsWith(todayStr))
    .reduce((acc, p) => acc + p.amount, 0);
  const monthCollections = payments
    .filter(p => p.date.startsWith(currentMonthStr))
    .reduce((acc, p) => acc + p.amount, 0);

  const cashCollections = payments
    .filter(p => p.paymentMethod === 'Cash')
    .reduce((acc, p) => acc + p.amount, 0);
  const cardCollections = payments
    .filter(p => p.paymentMethod === 'Card')
    .reduce((acc, p) => acc + p.amount, 0);
  const bankCollections = payments
    .filter(p => p.paymentMethod === 'Bank Transfer')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Customer Payment Receipts & Audit Ledger
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Audit payment receipts, bank wire transfers, card terminal vouchers, and uploaded proofs
          </p>
        </div>

        <button
          onClick={() => setIsCollectModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record Customer Payment</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 lg:grid-cols-4">
        <div className="p-3.5">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Total Collections
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-[#15803D] tabular-nums">
            {formatAED(totalCollections)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            {payments.length} verified receipts
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Today's Inflow
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-[#202321] tabular-nums">
            {formatAED(todayCollections)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Collected today ({todayStr})
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            This Month's Inflow
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-[#1B4D3E] tabular-nums">
            {formatAED(monthCollections)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            M-T-D settlements
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Cash vs Electronic
          </div>
          <div className="mt-1 text-xs font-mono space-y-0.5">
            <div className="flex justify-between">
              <span className="text-[#6B706D]">Cash:</span>
              <strong className="text-[#202321]">{formatAED(cashCollections)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B706D]">Card & Bank:</span>
              <strong className="text-[#15803D]">{formatAED(cardCollections + bankCollections)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search receipt #, invoice #, customer, plate..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Method Filter */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#DCDDD9] rounded text-xs shrink-0">
            {['all', 'Cash', 'Card', 'Bank Transfer'].map(m => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  methodFilter === m
                    ? 'bg-[#1B4D3E] text-white font-semibold'
                    : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                }`}
              >
                {m === 'all' ? 'All Methods' : m}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#DCDDD9] rounded text-xs shrink-0">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'this_month', label: 'This Month' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id as any)}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  dateFilter === d.id
                    ? 'bg-[#1B4D3E] text-white font-semibold'
                    : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Receipt #</th>
                <th className="px-3 py-2.5">Date / Time</th>
                <th className="px-3 py-2.5">Invoice #</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Vehicle</th>
                <th className="px-3 py-2.5 text-right">Amount (AED)</th>
                <th className="px-3 py-2.5 text-center">Method</th>
                <th className="px-3 py-2.5">Recorded By</th>
                <th className="px-3 py-2.5 text-center">Proof</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-[#6B706D]">
                    No payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => {
                  const cust = customers.find(c => c.id === p.customerId);
                  const inv = invoices.find(i => i.id === p.invoiceId);
                  const veh = inv ? vehicles.find(v => v.id === inv.vehicleId) : null;

                  return (
                    <tr key={p.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-bold text-[#1B4D3E]">
                        {p.receiptNumber || `REC-${p.id.slice(-5)}`}
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[#6B706D] whitespace-nowrap">
                        {p.recordedAt ? formatDateTime(p.recordedAt) : formatDate(p.date)}
                      </td>

                      <td className="px-3 py-2.5 font-mono font-semibold text-[#202321]">
                        {p.invoiceNumber}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-[#202321]">{cust?.fullName || 'Walk-in Client'}</div>
                        <div className="text-[10px] text-[#6B706D] font-mono">{cust?.phone}</div>
                      </td>

                      <td className="px-3 py-2.5 font-mono">
                        {veh ? (
                          <span className="bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded font-semibold">
                            {veh.registrationNumber}
                          </span>
                        ) : (
                          <span className="text-[#9CA3AF]">—</span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-bold text-[#15803D] tabular-nums">
                        {formatAED(p.amount)}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${
                            p.paymentMethod === 'Cash'
                              ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                              : p.paymentMethod === 'Card'
                              ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                              : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                          }`}
                        >
                          {p.paymentMethod}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-[#6B706D]">
                        <span className="font-medium text-[#202321]">{p.recordedByName || p.receivedBy || 'Cashier'}</span>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        {p.proofAttachment ? (
                          <button
                            onClick={() =>
                              setViewingProof({
                                proof: p.proofAttachment!,
                                title: `Receipt ${p.receiptNumber || p.id} Voucher Proof`
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4D3E] hover:underline"
                            title="View attached bank voucher or slip"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Proof</span>
                          </button>
                        ) : (
                          <span className="text-[#9CA3AF] text-[10px] font-mono">No slip</span>
                        )}
                      </td>

                      <td className="px-3.5 py-2.5 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedReceiptPayment(p)}
                          title="Print Official Customer Receipt"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#A7D0C0] bg-[#E8F0EC] text-[11px] font-bold text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors cursor-pointer shadow-2xs active:scale-95"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Receipt</span>
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

      {/* Record Payment Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-lg border border-[#DCDDD9] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#1B4D3E]" />
                <h3 className="font-bold text-sm text-[#202321]">
                  Record Customer Invoice Payment
                </h3>
              </div>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="text-[#6B706D] hover:text-[#202321]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Select Unpaid Invoice *
                </label>
                <select
                  required
                  value={collectInvoiceId}
                  onChange={e => handleInvoiceSelect(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  <option value="">-- Choose an open invoice --</option>
                  {openInvoices.map(inv => {
                    const cust = customers.find(c => c.id === inv.customerId);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} · {cust?.fullName} (Due: {formatAED(inv.balanceDue)})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedInvoice && (
                <div className="bg-[#FAFAF9] border border-[#DCDDD9] p-3 rounded space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>Invoice Total:</span>
                    <strong className="text-[#202321]">{formatAED(selectedInvoice.grandTotal)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Already Settled:</span>
                    <span className="text-[#15803D]">{formatAED(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#DCDDD9] pt-1">
                    <span>Outstanding Due:</span>
                    <strong className="text-[#DC2626]">{formatAED(selectedInvoice.balanceDue)}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Payment Amount to Collect (AED) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedInvoice?.balanceDue || 999999}
                  value={collectAmount || ''}
                  onChange={e => setCollectAmount(Number(e.target.value))}
                  placeholder="e.g. 500.00"
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono font-bold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Payment Method *</label>
                <select
                  value={collectMethod}
                  onChange={e => setCollectMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  <option value="Cash">Cash (AED)</option>
                  <option value="Card">Credit / Debit Card (POS Terminal)</option>
                  <option value="Bank Transfer">Bank Wire / IBAN Transfer</option>
                  <option value="Other">Corporate Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Receipt Reference #</label>
                <input
                  type="text"
                  value={collectRef}
                  onChange={e => setCollectRef(e.target.value)}
                  placeholder="e.g. TXN-10928 / Slip # 44"
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Attach Voucher Proof (JPG, PNG, PDF)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-[#6B706D] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#E8F0EC] file:text-[#1B4D3E] hover:file:bg-[#D4E5DD]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!collectInvoiceId || collectAmount <= 0}
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] disabled:opacity-50"
                >
                  Confirm & Log Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Payment Receipt Modal */}
      {selectedReceiptPayment && (
        <CustomerPaymentReceiptModal
          isOpen={!!selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
          settings={settings}
          receiptNumber={selectedReceiptPayment.receiptNumber || `REC-${selectedReceiptPayment.id.slice(-5)}`}
          invoiceNumber={selectedReceiptPayment.invoiceNumber}
          customerName={customers.find(c => c.id === selectedReceiptPayment.customerId)?.fullName || 'Valued Customer'}
          vehicleDetails={(() => {
            const inv = invoices.find(i => i.id === selectedReceiptPayment.invoiceId);
            const v = inv ? vehicles.find(veh => veh.id === inv.vehicleId) : null;
            return v ? `${v.registrationNumber} (${v.make} ${v.model})` : undefined;
          })()}
          amountReceived={selectedReceiptPayment.amount}
          paymentMethod={selectedReceiptPayment.paymentMethod}
          paymentTimestamp={selectedReceiptPayment.recordedAt || selectedReceiptPayment.date}
          receivedByName={selectedReceiptPayment.recordedByName || selectedReceiptPayment.receivedBy || 'Staff'}
          remainingBalance={(() => {
            const inv = invoices.find(i => i.id === selectedReceiptPayment.invoiceId);
            return inv ? inv.balanceDue : 0;
          })()}
          notes={selectedReceiptPayment.notes || selectedReceiptPayment.reference}
        />
      )}

      {/* Payment Proof Viewing Modal */}
      {viewingProof && (
        <PaymentProofModal
          isOpen={!!viewingProof}
          onClose={() => setViewingProof(null)}
          proof={viewingProof.proof}
          title={viewingProof.title}
          referenceNumber={viewingProof.proof.fileName || 'Payment Proof'}
          currentUserName={currentUser?.name || 'Staff'}
          currentUserId={currentUser?.id || 'staff-1'}
          readOnly={true}
        />
      )}
    </div>
  );
};
