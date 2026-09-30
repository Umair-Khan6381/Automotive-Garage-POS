import React, { useState } from 'react';
import {
  HardHat,
  Plus,
  Search,
  Trash2,
  Edit2,
  Banknote,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { LabourWorker, LabourStatus } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

export const LabourView: React.FC = () => {
  const { labourWorkers, addLabourWorker, updateLabourWorker, deleteLabourWorker, setActiveView } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<LabourWorker | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Master Mechanic');
  const [dailyRate, setDailyRate] = useState(2500);
  const [hourlyRate, setHourlyRate] = useState(350);
  const [status, setStatus] = useState<LabourStatus>('active');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingWorker(null);
    setName('');
    setPhone('');
    setRole('Master Mechanic');
    setDailyRate(2500);
    setHourlyRate(350);
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (w: LabourWorker) => {
    setEditingWorker(w);
    setName(w.name);
    setPhone(w.phone);
    setRole(w.role);
    setDailyRate(w.dailyRate);
    setHourlyRate(w.hourlyRate);
    setStatus(w.status);
    setNotes(w.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingWorker) {
      updateLabourWorker(editingWorker.id, {
        name,
        phone,
        role,
        dailyRate,
        hourlyRate,
        status,
        notes
      });
    } else {
      addLabourWorker({
        name,
        phone,
        role,
        dailyRate,
        hourlyRate,
        status,
        joiningDate: new Date().toISOString().slice(0, 10),
        notes
      });
    }

    setIsModalOpen(false);
  };

  const filteredWorkers = labourWorkers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Technicians & Workshop Labour Roster
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Manage mechanics, specialists, daily wage rates, and bay assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('labour_payroll')}
            className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
          >
            <Banknote className="h-3.5 w-3.5 text-[#1B4D3E]" />
            <span>Payroll Ledger</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Mechanic</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
        <input
          type="text"
          placeholder="Search by technician name, role, phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
        />
      </div>

      {/* Roster Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Technician Name</th>
                <th className="px-3 py-2.5">Trade / Specialty</th>
                <th className="px-3 py-2.5">Contact Phone</th>
                <th className="px-3 py-2.5 text-right">Daily Wage Rate</th>
                <th className="px-3 py-2.5 text-right">Hourly Rate</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#6B706D]">
                    No technicians found.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(w => (
                  <tr key={w.id} className="hover:bg-[#F5F5F3] transition-colors">
                    <td className="px-3.5 py-2.5">
                      <div className="font-semibold text-[#202321]">{w.name}</div>
                      <div className="text-[10px] text-[#6B706D]">Joined: {formatDate(w.joiningDate)}</div>
                    </td>

                    <td className="px-3 py-2.5 text-[#202321]">
                      {w.role}
                    </td>

                    <td className="px-3 py-2.5 font-mono text-[#6B706D]">
                      {w.phone}
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                      {formatPKR(w.dailyRate)}
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono text-[#6B706D] tabular-nums">
                      {formatPKR(w.hourlyRate)}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${
                          w.status === 'active'
                            ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                            : 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td className="px-3.5 py-2.5 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => openEditModal(w)}
                        className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove worker ${w.name}?`)) {
                            deleteLabourWorker(w.id);
                          }
                        }}
                        className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#DC2626]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                {editingWorker ? 'Edit Technician Profile' : 'Add Technician to Workshop'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Technician Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ustad Rashid"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="0301-5551234"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Specialty / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Overhaul Specialist, Electrician"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Daily Wage (PKR)</label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={e => setDailyRate(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Hourly Rate (PKR)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Employment Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as LabourStatus)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  <option value="active">Active On Duty</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Certified EFI electrician, 8 years exp"
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
                  {editingWorker ? 'Save Changes' : 'Add Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
