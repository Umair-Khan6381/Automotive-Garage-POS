import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Calendar,
  Package,
  CheckCircle,
  FileText,
  Trash2,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PurchaseItem } from '../../types';
import { formatAED, formatPKR, formatDate } from '../../utils/formatters';

export const PurchasesView: React.FC = () => {
  const { products, recordPurchase, transactions } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplier, setSupplier] = useState('ENOC Lubricants Distribution LLC (Dubai)');
  const [invoiceNumber, setInvoiceNumber] = useState(`PO-2026-${Date.now().toString().slice(-4)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));

  // Multi-item purchase lines
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(20);
  const [itemPrice, setItemPrice] = useState(7500);

  const openModal = () => {
    setSupplier('Pak Petroleum Distributors');
    setInvoiceNumber(`PO-2026-${Date.now().toString().slice(-4)}`);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setPurchaseItems([]);
    setSelectedProductId(products[0]?.id || '');
    setItemQty(20);
    setItemPrice(products[0]?.purchasePrice || 2000);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProductId || itemQty <= 0 || itemPrice <= 0) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const newItem: PurchaseItem = {
      productId: prod.id,
      productName: prod.name,
      quantity: itemQty,
      purchasePrice: itemPrice,
      totalCost: itemQty * itemPrice
    };

    setPurchaseItems(prev => [...prev, newItem]);
    setItemQty(10);
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalCost = purchaseItems.reduce((acc, it) => acc + it.totalCost, 0);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('Please add at least one product item to the purchase receipt.');
      return;
    }

    recordPurchase({
      supplier,
      purchaseDate,
      invoiceNumber,
      items: purchaseItems,
      totalCost
    });

    setIsModalOpen(false);
  };

  const purchaseTxs = transactions.filter(t => t.type === 'purchase');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Supplier Stock Purchases & Receiving
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Receive shipments, update stock counts, and recalculate weighted average costs
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record Supplier PO</span>
        </button>
      </div>

      {/* Received Purchases History Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#1B4D3E]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
              Received Inventory Shipments ({purchaseTxs.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Date</th>
                <th className="px-3 py-2.5">Reference / PO #</th>
                <th className="px-3 py-2.5">Product Received</th>
                <th className="px-3 py-2.5 text-right">Quantity</th>
                <th className="px-3 py-2.5 text-right">Unit Cost</th>
                <th className="px-3.5 py-2.5 text-right">Total (AED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {purchaseTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B706D]">
                    No stock purchases recorded yet. Click "Record Supplier PO" to receive stock.
                  </td>
                </tr>
              ) : (
                purchaseTxs.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#F5F5F3] transition-colors">
                    <td className="px-3.5 py-2.5 font-mono text-[#6B706D]">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-[#1B4D3E]">
                      {tx.reference}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-[#202321]">
                      {tx.productName}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#15803D]">
                      +{tx.quantity}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[#6B706D] tabular-nums">
                      {formatPKR(tx.unitCost)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                      {formatPKR(Math.abs(tx.quantity) * tx.unitCost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-lg rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Receive Supplier Shipment (Purchase Order)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">PO / Invoice # *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Add Line Item */}
              <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9] space-y-2">
                <div className="font-semibold text-[#202321] text-[11px] uppercase tracking-wider">
                  Add Stock Item
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="text-[10px] text-[#6B706D] block mb-0.5">Product</label>
                    <select
                      value={selectedProductId}
                      onChange={e => {
                        setSelectedProductId(e.target.value);
                        const p = products.find(prod => prod.id === e.target.value);
                        if (p) setItemPrice(p.purchasePrice);
                      }}
                      className="w-full rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6B706D] block mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={e => setItemQty(Number(e.target.value))}
                      className="w-full rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#6B706D] block mb-0.5">Unit Cost (AED)</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min="1"
                        value={itemPrice}
                        onChange={e => setItemPrice(Number(e.target.value))}
                        className="w-full rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="rounded border border-[#DCDDD9] bg-white px-2 text-xs font-semibold text-[#1B4D3E] hover:bg-[#E8F0EC]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {purchaseItems.length > 0 && (
                  <div className="divide-y divide-[#DCDDD9] bg-white rounded border border-[#DCDDD9] text-[11px] mt-2">
                    {purchaseItems.map((item, idx) => (
                      <div key={idx} className="p-2 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-[#202321]">{item.productName}</span>
                          <span className="text-[#6B706D] ml-2 font-mono">
                            {item.quantity} units @ {formatPKR(item.purchasePrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#202321]">{formatPKR(item.totalCost)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-[#DC2626]"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#DCDDD9]">
                <div className="font-mono text-sm font-bold text-[#202321]">
                  Total: {formatPKR(totalCost)}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                  >
                    Receive & Update Stock
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
