import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Car,
  Receipt,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Customer } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

export const CustomersView: React.FC = () => {
  const {
    customers,
    vehicles,
    invoices,
    jobCards,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    setActiveView
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(c);
    setName(c.fullName);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        fullName: name,
        phone,
        email,
        address,
        notes
      });
    } else {
      addCustomer({
        fullName: name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        address: address || 'Pakistan',
        notes
      });
    }

    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c =>
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCust = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const custVehicles = selectedCust ? vehicles.filter(v => v.customerId === selectedCust.id) : [];
  const custInvoices = selectedCust ? invoices.filter(i => i.customerId === selectedCust.id) : [];
  const custTotalSpent = custInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const custTotalDue = custInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Manage client profiles, contact numbers, owned vehicle fleets, and receivables
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Grid: Table + Side Customer Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Customer Directory Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, address..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>

          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Customer Name</th>
                  <th className="px-3 py-2.5">Phone</th>
                  <th className="px-3 py-2.5">City / Address</th>
                  <th className="px-3 py-2.5 text-center">Vehicles</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#6B706D]">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(cust => {
                    const vCount = vehicles.filter(v => v.customerId === cust.id).length;
                    const isSelected = selectedCust?.id === cust.id;

                    return (
                      <tr
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#E8F0EC]' : 'hover:bg-[#F5F5F3]'
                        }`}
                      >
                        <td className="px-3.5 py-2.5">
                          <div className="font-semibold text-[#202321]">{cust.fullName}</div>
                          <div className="text-[11px] text-[#6B706D]">{cust.email}</div>
                        </td>

                        <td className="px-3 py-2.5 font-mono text-[#202321]">
                          {cust.phone}
                        </td>

                        <td className="px-3 py-2.5 text-[#6B706D]">
                          {cust.address}
                        </td>

                        <td className="px-3 py-2.5 text-center font-mono font-bold text-[#1B4D3E]">
                          {vCount}
                        </td>

                        <td className="px-3.5 py-2.5 text-right space-x-1 shrink-0">
                          <button
                            onClick={e => openEditModal(cust, e)}
                            className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321]"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm(`Delete customer ${cust.fullName}?`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#DC2626]"
                          >
                            <Trash2 className="h-3 w-3" />
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

        {/* Selected Customer Financial Profile (5 Cols) */}
        <div className="lg:col-span-5 rounded border border-[#DCDDD9] bg-white">
          {selectedCust ? (
            <div>
              {/* Header */}
              <div className="border-b border-[#DCDDD9] px-4 py-3 bg-[#FAFAF9] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#202321]">{selectedCust.fullName}</h3>
                  <div className="text-xs text-[#6B706D] font-mono mt-0.5">{selectedCust.phone}</div>
                </div>

                <button
                  onClick={() => openEditModal(selectedCust)}
                  className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Edit Client
                </button>
              </div>

              {/* Financial Ledger Snapshot */}
              <div className="p-3 border-b border-[#DCDDD9] grid grid-cols-2 gap-2 text-xs">
                <div className="border border-[#DCDDD9] p-2 rounded bg-[#FAFAF9]">
                  <span className="text-[10px] text-[#6B706D] uppercase font-semibold block">Total Invoiced</span>
                  <span className="font-mono font-bold text-sm text-[#202321]">
                    {formatPKR(custTotalSpent + custTotalDue)}
                  </span>
                </div>
                <div className="border border-[#DCDDD9] p-2 rounded bg-[#FAFAF9]">
                  <span className="text-[10px] text-[#6B706D] uppercase font-semibold block">Outstanding Due</span>
                  <span className={`font-mono font-bold text-sm ${custTotalDue > 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
                    {formatPKR(custTotalDue)}
                  </span>
                </div>
              </div>

              {/* Registered Vehicles */}
              <div className="p-3 border-b border-[#DCDDD9] space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B706D]">
                  Registered Vehicles ({custVehicles.length})
                </div>

                <div className="space-y-1.5 text-xs">
                  {custVehicles.length === 0 ? (
                    <div className="text-[#6B706D]">No registered vehicles for this customer.</div>
                  ) : (
                    custVehicles.map(v => (
                      <div
                        key={v.id}
                        className="p-2 rounded border border-[#DCDDD9] bg-[#FAFAF9] flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono font-bold text-[#1B4D3E] bg-white border border-[#DCDDD9] px-1.5 py-0.5 rounded text-[11px]">
                            {v.registrationNumber}
                          </span>
                          <span className="ml-2 font-medium text-[#202321]">{v.make} {v.model} ({v.year})</span>
                        </div>
                        <span className="font-mono text-[#6B706D] text-[11px]">
                          {v.mileage.toLocaleString()} km
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Invoices */}
              <div className="p-3 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B706D]">
                  Invoice History ({custInvoices.length})
                </div>

                <div className="divide-y divide-[#DCDDD9] max-h-48 overflow-y-auto text-xs">
                  {custInvoices.length === 0 ? (
                    <div className="py-3 text-center text-[#6B706D]">No invoices generated yet.</div>
                  ) : (
                    custInvoices.map(inv => (
                      <div key={inv.id} className="py-2 flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-[#1B4D3E]">{inv.invoiceNumber}</span>
                          <div className="text-[10px] text-[#6B706D]">{formatDate(inv.date)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-[#202321]">{formatPKR(inv.grandTotal)}</div>
                          <span
                            className={`text-[10px] font-semibold ${
                              inv.paymentStatus === 'Paid'
                                ? 'text-[#15803D]'
                                : 'text-[#DC2626]'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#6B706D]">
              Select a customer to view profile.
            </div>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Munir"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="0321-7654321"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="asif.munir@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Workshop Address / City</label>
                <input
                  type="text"
                  placeholder="e.g. Model Town, Lahore"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Special Notes / VIP Flag</label>
                <input
                  type="text"
                  placeholder="Corporate fleet client / prefers Shell Helix"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
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
                  {editingCustomer ? 'Save Changes' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
