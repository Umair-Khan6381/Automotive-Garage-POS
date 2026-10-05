import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingUp,
  Truck,
  SlidersHorizontal,
  History,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductCategory } from '../../types';
import { formatPKR, formatNumber } from '../../utils/formatters';

export const ProductsView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    setActiveView
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [qtyDelta, setQtyDelta] = useState<number>(0);
  const [adjReason, setAdjReason] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Engine Oil');
  const [brand, setBrand] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(1000);
  const [sellingPrice, setSellingPrice] = useState(1500);
  const [currentQty, setCurrentQty] = useState(10);
  const [minStock, setMinStock] = useState(5);
  const [unit, setUnit] = useState('Pieces');
  const [location, setLocation] = useState('Rack A-01');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`PART-${Date.now().toString().slice(-4)}`);
    setCategory('Engine Oil');
    setBrand('Shell');
    setSupplier('General Spares Wholesale');
    setPurchasePrice(2000);
    setSellingPrice(2800);
    setCurrentQty(10);
    setMinStock(5);
    setUnit('Pieces');
    setLocation('Rack A-01');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setBrand(p.brand);
    setSupplier(p.supplier);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setCurrentQty(p.currentQuantity);
    setMinStock(p.minStockLevel);
    setUnit(p.unit);
    setLocation(p.location);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        sku,
        category,
        brand,
        supplier,
        purchasePrice,
        sellingPrice,
        currentQuantity: currentQty,
        minStockLevel: minStock,
        unit,
        location
      });
    } else {
      addProduct({
        name,
        sku,
        category,
        brand,
        supplier,
        purchasePrice,
        sellingPrice,
        currentQuantity: currentQty,
        minStockLevel: minStock,
        unit,
        location
      });
    }

    setIsModalOpen(false);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || qtyDelta === 0) return;
    adjustStock(adjustingProduct.id, qtyDelta, adjReason || 'Physical stock audit adjustment');
    setAdjustingProduct(null);
    setQtyDelta(0);
    setAdjReason('');
  };

  // Metrics
  const totalItems = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentQuantity, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.currentQuantity * p.purchasePrice, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + p.currentQuantity * p.sellingPrice, 0);
  const lowStockCount = products.filter(p => p.currentQuantity <= p.minStockLevel && p.currentQuantity > 0).length;
  const outOfStockCount = products.filter(p => p.currentQuantity <= 0).length;

  // Filtered
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStock =
      stockStatusFilter === 'all'
        ? true
        : stockStatusFilter === 'low'
        ? p.currentQuantity <= p.minStockLevel && p.currentQuantity > 0
        : p.currentQuantity <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ['All', 'Engine Oil', 'Oil Filters', 'Brake System', 'Spark Plugs & Ignition', 'Coolant & Fluids'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Auto Parts & Inventory Catalog
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Weighted average cost accounting, rack locations, and reorder alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('purchases')}
            className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
          >
            <Truck className="h-3.5 w-3.5 text-[#6B706D]" />
            <span>Supplier POs</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Auto Part</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 sm:grid-cols-4">
        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Total Catalog Parts
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
            {totalItems} <span className="text-xs font-normal text-[#6B706D]">SKUs</span>
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            {formatNumber(totalStockUnits)} total units on hand
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Inventory Valuation (Cost)
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
            {formatPKR(totalValuation)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Weighted purchase price
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Retail Potential
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#15803D]">
            {formatPKR(totalRetailValuation)}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Est. margin: {formatPKR(totalRetailValuation - totalValuation)}
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Stock Health
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#DC2626]">
            {lowStockCount + outOfStockCount} <span className="text-xs font-normal text-[#6B706D]">alerts</span>
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            {outOfStockCount} out of stock · {lowStockCount} below minimum
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search parts by name, SKU, brand..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-0.5 bg-white border border-[#DCDDD9] rounded text-xs">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                stockStatusFilter === 'all'
                  ? 'bg-[#1B4D3E] text-white font-semibold'
                  : 'text-[#6B706D] hover:text-[#202321]'
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-2.5 py-1 rounded transition-colors ${
                stockStatusFilter === 'low'
                  ? 'bg-[#1B4D3E] text-white font-semibold'
                  : 'text-[#6B706D] hover:text-[#202321]'
              }`}
            >
              Low ({lowStockCount})
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-2.5 py-1 rounded transition-colors ${
                stockStatusFilter === 'out'
                  ? 'bg-[#1B4D3E] text-white font-semibold'
                  : 'text-[#6B706D] hover:text-[#202321]'
              }`}
            >
              Out ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">SKU / Code</th>
                <th className="px-3 py-2.5">Part Name & Brand</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Rack Location</th>
                <th className="px-3 py-2.5 text-right">Available Stock</th>
                <th className="px-3 py-2.5 text-right">Avg Cost</th>
                <th className="px-3 py-2.5 text-right">Selling Price</th>
                <th className="px-3 py-2.5 text-right">Gross Margin</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#6B706D]">
                    No inventory products match criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isOut = p.currentQuantity <= 0;
                  const isLow = p.currentQuantity <= p.minStockLevel && !isOut;
                  const marginPct = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-bold text-[#1B4D3E]">
                        {p.sku}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-[#202321]">{p.name}</div>
                        <div className="text-[11px] text-[#6B706D]">{p.brand} · Supplier: {p.supplier}</div>
                      </td>

                      <td className="px-3 py-2.5 text-[#6B706D]">
                        {p.category}
                      </td>

                      <td className="px-3 py-2.5 text-[#6B706D] font-mono text-[11px]">
                        {p.location || '—'}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-semibold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs tabular-nums ${
                            isOut
                              ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 font-bold'
                              : isLow
                              ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20 font-bold'
                              : 'text-[#202321]'
                          }`}
                        >
                          {p.currentQuantity} {p.unit}
                        </span>
                        <div className="text-[10px] text-[#6B706D] font-normal">
                          Min: {p.minStockLevel}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[#6B706D] tabular-nums">
                        {formatPKR(p.purchasePrice)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                        {formatPKR(p.sellingPrice)}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[11px] font-semibold text-[#15803D] tabular-nums">
                        {marginPct}%
                      </td>

                      <td className="px-3.5 py-2.5 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setQtyDelta(0);
                            setAdjReason('');
                          }}
                          title="Adjust Stock Audit"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#1B4D3E] hover:bg-[#E8F0EC]"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Product"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete part ${p.name}?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          title="Delete Product"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
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

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-lg rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                {editingProduct ? 'Edit Auto Part' : 'Add Auto Part to Inventory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Part Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Synthetic Engine Oil 5W-30"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">SKU / Part Number *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductCategory)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Purchase Price (AED)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Retail Selling Price (AED)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    value={currentQty}
                    onChange={e => setCurrentQty(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Minimum Alert Threshold</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={e => setMinStock(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Storage Location (Rack)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
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
                  {editingProduct ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-sm rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Stock Audit Adjustment
              </h3>
              <button onClick={() => setAdjustingProduct(null)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs mb-3 bg-[#F5F5F3] p-2 rounded">
              <div className="font-semibold text-[#202321]">{adjustingProduct.name}</div>
              <div className="text-[#6B706D] font-mono mt-0.5">
                Current Stock: {adjustingProduct.currentQuantity} {adjustingProduct.unit}
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Quantity Change (+ or -)
                </label>
                <input
                  type="number"
                  required
                  placeholder="+5 or -2"
                  value={qtyDelta}
                  onChange={e => setQtyDelta(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
                <div className="text-[10px] text-[#6B706D] mt-1 font-mono">
                  New Stock will be: {adjustingProduct.currentQuantity + qtyDelta} {adjustingProduct.unit}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical inventory discrepancy, damaged item"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
