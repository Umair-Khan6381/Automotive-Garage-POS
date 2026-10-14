import React, { useState } from 'react';
import {
  History,
  Search,
  RotateCcw,
  PackageCheck,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { InventoryTransactionType } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

export const StockAuditView: React.FC = () => {
  const { transactions, products, customers, processProductReturn, invoices } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedInvoiceNum, setSelectedInvoiceNum] = useState('');
  const [selectedReturnProductId, setSelectedReturnProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Customer changed mind / unused part');

  const openReturnModal = () => {
    setSelectedInvoiceNum(invoices[0]?.invoiceNumber || '');
    setSelectedReturnProductId(products[0]?.id || '');
    setReturnQty(1);
    setReturnReason('Customer changed mind / unused part');
    setIsReturnModalOpen(true);
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.invoiceNumber === selectedInvoiceNum);
    if (!inv || !selectedReturnProductId || returnQty <= 0) return;

    processProductReturn(inv.id, selectedReturnProductId, returnQty, returnReason);
    setIsReturnModalOpen(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: InventoryTransactionType) => {
    switch (type) {
      case 'purchase':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'sale':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      case 'job_usage':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'return':
        return 'bg-[#E8F0EC] text-[#1B4D3E] border-[#A7D7C5]';
      case 'adjustment':
        return 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]';
      case 'damaged':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      default:
        return 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Inventory Movement & Stock Audit Trail
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Immutable log of purchases, repair consumption, POS sales, and returns
          </p>
        </div>

        <button
          onClick={openReturnModal}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Process Customer Return</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search part, reference #, user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-white border border-[#DCDDD9] rounded text-xs">
          {['all', 'purchase', 'sale', 'job_usage', 'return', 'adjustment'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded px-2.5 py-1 font-medium capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-[#1B4D3E] text-white font-semibold'
                  : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Date & Time</th>
                <th className="px-3 py-2.5">Transaction Type</th>
                <th className="px-3 py-2.5">Part / Item</th>
                <th className="px-3 py-2.5 text-right">Qty Delta</th>
                <th className="px-3 py-2.5 text-right">Balance After</th>
                <th className="px-3 py-2.5">Reference / Doc</th>
                <th className="px-3.5 py-2.5">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B706D]">
                    No stock audit transactions match the search filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isPositive = tx.quantity > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="px-3.5 py-2.5 font-mono text-[#6B706D]">
                        {formatDate(tx.date)}
                      </td>

                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold capitalize ${getTypeBadge(tx.type)}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 font-semibold text-[#202321]">
                        {tx.productName}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-bold">
                        <span className={isPositive ? 'text-[#15803D]' : 'text-[#DC2626]'}>
                          {isPositive ? `+${tx.quantity}` : tx.quantity}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[#202321] tabular-nums font-medium">
                        {formatPKR(tx.unitCost)}
                      </td>

                      <td className="px-3 py-2.5 font-mono text-xs text-[#6B706D]">
                        {tx.reference}
                      </td>

                      <td className="px-3.5 py-2.5 text-[#6B706D]">
                        {tx.user}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Process Customer Part Return
              </h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Invoice Number *</label>
                <select
                  value={selectedInvoiceNum}
                  onChange={e => setSelectedInvoiceNum(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                >
                  {invoices.map(inv => {
                    const cust = customers.find(c => c.id === inv.customerId);
                    return (
                      <option key={inv.id} value={inv.invoiceNumber}>
                        {inv.invoiceNumber} — {cust?.fullName || 'Customer'} ({formatPKR(inv.grandTotal)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Product Returned *</label>
                <select
                  value={selectedReturnProductId}
                  onChange={e => setSelectedReturnProductId(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Return Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={returnQty}
                  onChange={e => setReturnQty(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Reason for Return</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Confirm Return & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
