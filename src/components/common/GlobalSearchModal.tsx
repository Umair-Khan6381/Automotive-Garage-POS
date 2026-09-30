import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Car,
  User,
  Package,
  Wrench,
  Receipt,
  Wallet
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatPKR } from '../../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    customers,
    vehicles,
    products,
    jobCards,
    invoices,
    unifiedExpenses,
    setSelectedCustomerId,
    setSelectedVehicleId,
    setSelectedJobId,
    setActiveView
  } = useShop();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedCustomers = q
    ? customers.filter(c => c.fullName.toLowerCase().includes(q) || c.phone.includes(q))
    : [];

  const matchedVehicles = q
    ? vehicles.filter(v =>
        v.registrationNumber.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      )
    : [];

  const matchedProducts = q
    ? products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      )
    : [];

  const matchedJobs = q
    ? jobCards.filter(j =>
        j.jobNumber.toLowerCase().includes(q) ||
        j.complaint.toLowerCase().includes(q)
      )
    : [];

  const matchedInvoices = q
    ? invoices.filter(i => {
        const c = customers.find(cust => cust.id === i.customerId);
        return (
          i.invoiceNumber.toLowerCase().includes(q) ||
          c?.fullName.toLowerCase().includes(q)
        );
      })
    : [];

  const matchedExpenses = q
    ? unifiedExpenses.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      )
    : [];

  const hasResults =
    matchedCustomers.length > 0 ||
    matchedVehicles.length > 0 ||
    matchedProducts.length > 0 ||
    matchedJobs.length > 0 ||
    matchedInvoices.length > 0 ||
    matchedExpenses.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-[#202321]/40">
      <div className="w-full max-w-xl rounded border border-[#DCDDD9] bg-white shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 border-b border-[#DCDDD9] px-3 py-2.5 bg-white">
          <Search className="h-4 w-4 text-[#6B706D] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search license plate (LEA-19), customer, job #, part SKU..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-xs text-[#202321] placeholder-[#6B706D] focus:outline-none"
          />
          <kbd className="rounded border border-[#DCDDD9] bg-[#F5F5F3] px-1.5 py-0.5 text-[10px] text-[#6B706D] font-mono">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-[#6B706D] hover:text-[#202321]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-2 text-xs divide-y divide-[#DCDDD9]">
          {!q ? (
            <div className="py-8 text-center text-[#6B706D]">
              <p className="font-semibold text-[#202321]">Fast Counter Search</p>
              <p className="text-[11px] mt-1">
                Type vehicle plate number, customer name, part SKU or invoice number.
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-[#6B706D]">
              No workshop records found for "{query}"
            </div>
          ) : (
            <div className="space-y-3">
              {/* Vehicles */}
              {matchedVehicles.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B706D]">
                    Vehicles ({matchedVehicles.length})
                  </div>
                  {matchedVehicles.map(v => (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVehicleId(v.id);
                        setActiveView('vehicles');
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded hover:bg-[#F5F5F3] cursor-pointer flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1B4D3E] bg-[#E8F0EC] px-1.5 py-0.5 rounded">
                          {v.registrationNumber}
                        </span>
                        <span className="font-medium text-[#202321]">{v.make} {v.model} ({v.year})</span>
                      </div>
                      <span className="text-[#6B706D] font-mono text-[11px]">{v.mileage.toLocaleString()} km</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B706D]">
                    Customers ({matchedCustomers.length})
                  </div>
                  {matchedCustomers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setActiveView('customers');
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded hover:bg-[#F5F5F3] cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-medium text-[#202321]">{c.fullName}</span>
                      <span className="text-[#6B706D] font-mono text-[11px]">{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Job Cards */}
              {matchedJobs.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B706D]">
                    Job Cards ({matchedJobs.length})
                  </div>
                  {matchedJobs.map(j => (
                    <div
                      key={j.id}
                      onClick={() => {
                        setSelectedJobId(j.id);
                        setActiveView('jobs');
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded hover:bg-[#F5F5F3] cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#1B4D3E] mr-2">{j.jobNumber}</span>
                        <span className="text-[#202321]">{j.complaint}</span>
                      </div>
                      <span className="font-mono text-[#202321] font-bold">
                        {formatPKR(j.finalCost || j.estimatedCost)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Parts */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B706D]">
                    Parts & Stock ({matchedProducts.length})
                  </div>
                  {matchedProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveView('inventory');
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded hover:bg-[#F5F5F3] cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-[#202321]">{p.name}</span>
                        <span className="text-[#6B706D] ml-2 font-mono">({p.sku})</span>
                      </div>
                      <div className="font-mono text-right">
                        <span className="font-bold text-[#202321]">{formatPKR(p.sellingPrice)}</span>
                        <span className="text-[#6B706D] ml-2 text-[10px]">{p.currentQuantity} in stock</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B706D]">
                    Invoices ({matchedInvoices.length})
                  </div>
                  {matchedInvoices.map(inv => (
                    <div
                      key={inv.id}
                      onClick={() => {
                        setActiveView('invoices');
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded hover:bg-[#F5F5F3] cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#1B4D3E] mr-2">{inv.invoiceNumber}</span>
                        <span className="text-[#202321]">
                          {customers.find(c => c.id === inv.customerId)?.fullName || 'Customer'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#202321]">{formatPKR(inv.grandTotal)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Expenses & Fixed Overheads */}
              {matchedExpenses.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B706D] flex items-center gap-1.5">
                    <Wallet className="h-3 w-3 text-[#1B4D3E]" />
                    <span>Expenses & Fixed Costs ({matchedExpenses.length})</span>
                  </div>
                  {matchedExpenses.map(exp => (
                    <div
                      key={exp.id}
                      onClick={() => {
                        setActiveView('expenses');
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded hover:bg-[#F5F5F3] cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-[#202321] mr-2">{exp.title}</span>
                        <span className="rounded bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 text-[10px] font-medium">
                          {exp.category}
                        </span>
                        <span className="text-[#6B706D] ml-2 text-[10px] font-mono">{exp.date}</span>
                      </div>
                      <div className="font-mono text-right">
                        <span className="font-bold text-[#DC2626]">{formatPKR(exp.amount)}</span>
                        <span className={`ml-2 text-[10px] font-semibold ${exp.paymentStatus === 'Paid' ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                          {exp.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
