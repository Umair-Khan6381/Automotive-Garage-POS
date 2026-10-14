import React, { useState } from 'react';
import {
  HardHat,
  Plus,
  Search,
  Trash2,
  Edit2,
  Banknote,
  Percent,
  X,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { LabourWorker, LabourStatus, LabourRateType } from '../../types';
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
  const [rateType, setRateType] = useState<LabourRateType>('daily');
  const [commissionPercentage, setCommissionPercentage] = useState<number>(40);
  const [dailyRate, setDailyRate] = useState<number>(2500);
  const [hourlyRate, setHourlyRate] = useState<number>(350);
  const [status, setStatus] = useState<LabourStatus>('active');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingWorker(null);
    setName('');
    setPhone('');
    setRole('Master Mechanic');
    setRateType('daily');
    setCommissionPercentage(40);
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
    setRateType(w.rateType || (w.dailyRate > 0 ? 'daily' : 'commission'));
    setCommissionPercentage(w.commissionPercentage || 40);
    setDailyRate(w.dailyRate || 2500);
    setHourlyRate(w.hourlyRate || 350);
    setStatus(w.status);
    setNotes(w.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const payload = {
      name,
      phone,
      role,
      rateType,
      commissionPercentage: rateType === 'commission' ? commissionPercentage : 0,
      dailyRate: rateType === 'daily' ? dailyRate : 0,
      hourlyRate: rateType === 'hourly' ? hourlyRate : 0,
      status,
      notes
    };

    if (editingWorker) {
      updateLabourWorker(editingWorker.id, payload);
    } else {
      addLabourWorker({
        ...payload,
        joiningDate: new Date().toISOString().slice(0, 10)
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#202321]">
              Technicians & Workshop Labour Roster
            </h1>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
              Daily & Commission
            </span>
          </div>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Manage mechanics, specialists, customizable percentage commission shares, and wage rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('labour_payroll')}
            className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
          >
            <Banknote className="h-3.5 w-3.5 text-[#1B4D3E]" />
            <span>Payroll Ledger & Commission</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Technician</span>
          </button>
        </div>
      </div>

      {/* Search & Overview Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search by technician name, role, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        {/* Quick Badges */}
        <div className="flex items-center gap-2 text-xs text-[#6B706D]">
          <span className="rounded border border-[#DCDDD9] bg-white px-2 py-1">
            Total Staff: <strong className="text-[#202321]">{labourWorkers.length}</strong>
          </span>
          <span className="rounded border border-[#DCDDD9] bg-white px-2 py-1">
            Commission Based: <strong className="text-[#B45309]">{labourWorkers.filter(w => w.rateType === 'commission').length}</strong>
          </span>
          <span className="rounded border border-[#DCDDD9] bg-white px-2 py-1">
            Daily Wage: <strong className="text-[#15803D]">{labourWorkers.filter(w => w.rateType !== 'commission').length}</strong>
          </span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Technician Name</th>
                <th className="px-3 py-2.5">Trade / Specialty</th>
                <th className="px-3 py-2.5">Contact Phone</th>
                <th className="px-3 py-2.5 text-left">Wage / Commission Model (اجرت یا کمیشن)</th>
                <th className="px-3 py-2.5 text-right">Base Daily / Hourly</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#6B706D]">
                    No technicians found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(w => {
                  const isCommission = w.rateType === 'commission';

                  return (
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

                      <td className="px-3 py-2.5">
                        {isCommission ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[11px] font-bold">
                              <Percent className="h-3 w-3" />
                              {w.commissionPercentage || 40}% Commission (کمیشن)
                            </span>
                          </div>
                        ) : w.rateType === 'hourly' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-[11px] font-semibold">
                            Hourly: {formatPKR(w.hourlyRate)}/hr
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-[11px] font-semibold">
                            Daily: {formatPKR(w.dailyRate)}/day
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-[#6B706D] tabular-nums">
                        {isCommission ? (
                          <span className="text-[11px] italic text-[#6B706D]">Per Job Share</span>
                        ) : (
                          <span>{formatPKR(w.dailyRate)} / day</span>
                        )}
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
                          title="Edit Technician"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove worker ${w.name}?`)) {
                              deleteLabourWorker(w.id);
                            }
                          }}
                          title="Remove Worker"
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

      {/* Modal: Add or Edit Technician */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-lg rounded border border-[#DCDDD9] bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#202321]">
                  {editingWorker ? 'Edit Technician & Wage / Commission Setup' : 'Add New Technician to Workshop'}
                </h3>
                <p className="text-[11px] text-[#6B706D]">
                  Set worker contact details, wage model, and custom commission percentage share
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Technician Name (استاد / مکینک نام) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Contact Phone (موبائل نمبر) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0322-9988771"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Specialty / Trade Role (مہارت و شعبہ)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auto Electrician & AC Diagnostic Lead, Engine Overhaul Master"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* RATE MODEL SELECTION: COMMISSION VS DAILY */}
              <div className="rounded border-2 border-[#1B4D3E]/40 bg-[#F8FAF9] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider flex items-center gap-1.5">
                    <span>Wage / Payment Model (معاوضہ کا طریقہ کار)</span>
                  </label>
                  <span className="text-[10px] text-[#6B706D]">Select Commission or Fixed/Daily</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRateType('commission')}
                    className={`p-2.5 rounded border text-left transition-all ${
                      rateType === 'commission'
                        ? 'border-[#B45309] bg-[#FEF3C7] text-[#92400E] font-bold shadow-xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:border-[#B45309]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Commission Base</span>
                      <Percent className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">کمیشن فیصد پر کام</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRateType('daily')}
                    className={`p-2.5 rounded border text-left transition-all ${
                      rateType === 'daily'
                        ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:border-[#1B4D3E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Daily Wage</span>
                      <Banknote className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">یومیہ طے شدہ اجرت</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRateType('hourly')}
                    className={`p-2.5 rounded border text-left transition-all ${
                      rateType === 'hourly'
                        ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-bold shadow-xs'
                        : 'border-[#DCDDD9] bg-white text-[#202321] hover:border-[#1B4D3E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Hourly Rate</span>
                      <Banknote className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">فی گھنٹہ ریٹ</div>
                  </button>
                </div>

                {/* COMMISSION CONFIGURATION PANEL */}
                {rateType === 'commission' && (
                  <div className="rounded border border-[#FDE68A] bg-white p-3 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-bold text-[#92400E]">
                        Define Commission Percentage (کمیشن کا فیصد طے کریں) *
                      </label>
                      <span className="text-[10px] font-mono text-[#6B706D]">Owner Custom Rate</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative w-36">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={commissionPercentage}
                          onChange={e => setCommissionPercentage(Math.max(1, Math.min(100, Number(e.target.value))))}
                          className="w-full rounded border-2 border-[#B45309] bg-white px-3 py-1.5 text-base font-extrabold font-mono text-[#B45309] focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                        />
                        <span className="absolute right-3 top-2 font-bold text-sm text-[#92400E]">%</span>
                      </div>

                      {/* Quick Percentage Presets */}
                      <div className="flex flex-wrap gap-1">
                        {[20, 25, 30, 35, 40, 45, 50, 60, 70].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setCommissionPercentage(pct)}
                            className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                              commissionPercentage === pct
                                ? 'bg-[#B45309] text-white shadow-xs'
                                : 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Real-time Calculation Example Preview */}
                    <div className="rounded bg-[#FFFBEB] p-2 border border-[#FEF3C7] text-[11px] text-[#92400E] flex items-start gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#B45309] mt-0.5" />
                      <div>
                        <span>
                          <strong>کمیشن حساب:</strong> اگر کسٹمر سے لیبر چارج <strong>Rs. 2,000</strong> ہوگی، تو اس مکینک کو <strong>{commissionPercentage}% ({formatPKR(2000 * (commissionPercentage / 100))})</strong> ملیں گے اور ورکشاپ کا حصہ <strong>{formatPKR(2000 * ((100 - commissionPercentage) / 100))}</strong> ہوگا۔
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DAILY WAGE CONFIGURATION */}
                {rateType === 'daily' && (
                  <div className="rounded border border-[#DCDDD9] bg-white p-3 space-y-2">
                    <label className="text-xs font-semibold text-[#202321] block">
                      Daily Wage Rate (یومیہ مقررہ اجرت - PKR) *
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        min="0"
                        required
                        value={dailyRate}
                        onChange={e => setDailyRate(Number(e.target.value))}
                        className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-sm font-bold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-[#6B706D]">PKR / Day</span>
                    </div>
                  </div>
                )}

                {/* HOURLY CONFIGURATION */}
                {rateType === 'hourly' && (
                  <div className="rounded border border-[#DCDDD9] bg-white p-3 space-y-2">
                    <label className="text-xs font-semibold text-[#202321] block">
                      Hourly Wage Rate (فی گھنٹہ اجرت - PKR) *
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        min="0"
                        required
                        value={hourlyRate}
                        onChange={e => setHourlyRate(Number(e.target.value))}
                        className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 font-mono text-sm font-bold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs text-[#6B706D]">PKR / Hour</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Employment Status (موجودہ صورتحال)
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as LabourStatus)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="active">Active On Duty (ورکشاپ میں حاضر)</option>
                    <option value="on_leave">On Leave (چھٹی پر)</option>
                    <option value="inactive">Inactive / Resigned (فارغ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Special Notes (اضافی معلومات)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hybrid battery certified, 10 yrs exp"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] shadow-xs"
                >
                  {editingWorker ? 'Save Technician & Rates' : 'Add Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
