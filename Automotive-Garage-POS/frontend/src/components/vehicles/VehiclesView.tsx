import React, { useState } from 'react';
import {
  Car,
  Plus,
  Search,
  Wrench,
  Droplet,
  Trash2,
  Edit2,
  Receipt,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Vehicle } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';
import { evaluateServiceDueStatus } from '../../utils/calculations';

export const VehiclesView: React.FC = () => {
  const {
    vehicles,
    customers,
    jobCards,
    invoices,
    oilChanges,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    setActiveView
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [regNum, setRegNum] = useState('');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2022);
  const [color, setColor] = useState('White');
  const [mileage, setMileage] = useState(50000);
  const [engineNo, setEngineNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingVehicle(null);
    setRegNum('');
    setMake('Toyota');
    setModel('');
    setYear(2022);
    setColor('White');
    setMileage(50000);
    setEngineNo('');
    setChassisNo('');
    setCustomerId(customers[0]?.id || '');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingVehicle(v);
    setRegNum(v.registrationNumber);
    setMake(v.make);
    setModel(v.model);
    setYear(v.year);
    setColor(v.color);
    setMileage(v.mileage);
    setEngineNo(v.engineNumber || '');
    setChassisNo(v.chassisNumber || '');
    setCustomerId(v.customerId);
    setNotes(v.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum || !make || !model) return;

    const cleanReg = regNum.toUpperCase().trim();
    const duplicate = vehicles.find(
      v => v.registrationNumber.toUpperCase().trim() === cleanReg && v.id !== editingVehicle?.id
    );
    if (duplicate) {
      alert(`Vehicle with registration number "${cleanReg}" already exists.`);
      return;
    }

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        registrationNumber: cleanReg,
        make,
        model,
        year,
        color,
        mileage,
        engineNumber: engineNo,
        chassisNumber: chassisNo,
        customerId,
        notes
      });
    } else {
      addVehicle({
        registrationNumber: cleanReg,
        make,
        model,
        year,
        color,
        mileage,
        engineNumber: engineNo,
        chassisNumber: chassisNo,
        customerId,
        notes
      });
    }

    setIsModalOpen(false);
  };

  const filteredVehicles = vehicles.filter(v => {
    const cust = customers.find(c => c.id === v.customerId);
    return (
      v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const selectedCustomer = selectedVehicle ? customers.find(c => c.id === selectedVehicle.customerId) : null;
  const vehicleJobs = selectedVehicle ? jobCards.filter(j => j.vehicleId === selectedVehicle.id) : [];
  const vehicleOilChanges = selectedVehicle ? oilChanges.filter(oc => oc.vehicleId === selectedVehicle.id) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Vehicle Fleet Registry & Service History
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Maintain vehicle profiles, plate lookups, odometer logs, and service records
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Main Grid: Vehicles Table (Left) + Vehicle Detail History Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Vehicles Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
            <input
              type="text"
              placeholder="Search by plate number, make/model, or owner name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>

          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Plate Number</th>
                  <th className="px-3 py-2.5">Make & Model</th>
                  <th className="px-3 py-2.5">Owner / Contact</th>
                  <th className="px-3 py-2.5 text-right">Odometer</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#6B706D]">
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(veh => {
                    const cust = customers.find(c => c.id === veh.customerId);
                    const isSelected = selectedVehicle?.id === veh.id;

                    return (
                      <tr
                        key={veh.id}
                        onClick={() => setSelectedVehicleId(veh.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#E8F0EC]' : 'hover:bg-[#F5F5F3]'
                        }`}
                      >
                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#1B4D3E]">
                          <span className="bg-white border border-[#DCDDD9] px-1.5 py-0.5 rounded">
                            {veh.registrationNumber}
                          </span>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-[#202321]">
                            {veh.make} {veh.model}
                          </div>
                          <div className="text-[11px] text-[#6B706D]">
                            {veh.year} · {veh.color}
                          </div>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="font-medium text-[#202321]">{cust?.fullName}</div>
                          <div className="text-[11px] text-[#6B706D] font-mono">{cust?.phone}</div>
                        </td>

                        <td className="px-3 py-2.5 text-right font-mono text-[#202321]">
                          {veh.mileage.toLocaleString()} km
                        </td>

                        <td className="px-3.5 py-2.5 text-right space-x-1 shrink-0">
                          <button
                            onClick={e => openEditModal(veh, e)}
                            className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321]"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm(`Delete vehicle ${veh.registrationNumber}?`)) {
                                deleteVehicle(veh.id);
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

        {/* Selected Vehicle Service Profile Panel (5 Cols) */}
        <div className="lg:col-span-5 rounded border border-[#DCDDD9] bg-white">
          {selectedVehicle ? (
            <div>
              {/* Header */}
              <div className="border-b border-[#DCDDD9] px-4 py-3 bg-[#FAFAF9] flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold bg-[#1B4D3E] text-white px-2 py-0.5 rounded">
                    {selectedVehicle.registrationNumber}
                  </span>
                  <div className="text-sm font-bold text-[#202321] mt-1">
                    {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(selectedVehicle)}
                  className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Edit Profile
                </button>
              </div>

              {/* Owner Specs */}
              <div className="p-3 border-b border-[#DCDDD9] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#6B706D] block">Owner:</span>
                  <span className="font-semibold text-[#202321]">{selectedCustomer?.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B706D] block">Phone:</span>
                  <span className="font-mono text-[#202321]">{selectedCustomer?.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B706D] block">Current Odometer:</span>
                  <span className="font-mono font-bold text-[#1B4D3E]">
                    {selectedVehicle.mileage.toLocaleString()} km
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B706D] block">Color / Body:</span>
                  <span className="text-[#202321]">{selectedVehicle.color}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-b border-[#DCDDD9] bg-[#FAFAF9] flex gap-2">
                <button
                  onClick={() => setActiveView('jobs')}
                  className="flex-1 rounded bg-[#1B4D3E] py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] flex items-center justify-center gap-1"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Create Job Card</span>
                </button>
                <button
                  onClick={() => setActiveView('oil_changes')}
                  className="flex-1 rounded border border-[#DCDDD9] bg-white py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] flex items-center justify-center gap-1"
                >
                  <Droplet className="h-3.5 w-3.5 text-[#1B4D3E]" />
                  <span>Log Oil Change</span>
                </button>
              </div>

              {/* Service & Repair History */}
              <div className="p-3 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B706D]">
                  Repair History ({vehicleJobs.length} Jobs)
                </div>

                <div className="divide-y divide-[#DCDDD9] max-h-48 overflow-y-auto text-xs">
                  {vehicleJobs.length === 0 ? (
                    <div className="py-4 text-center text-[#6B706D]">No repair jobs recorded yet.</div>
                  ) : (
                    vehicleJobs.map(j => (
                      <div key={j.id} className="py-2 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-[#202321] flex items-center gap-2">
                            <span className="font-mono text-[#1B4D3E]">{j.jobNumber}</span>
                            <span>{formatDate(j.date)}</span>
                          </div>
                          <div className="text-[11px] text-[#6B706D] truncate max-w-[200px]">
                            {j.complaint}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-[#202321]">
                            {formatPKR(j.finalCost || j.estimatedCost)}
                          </div>
                          <span className="text-[10px] text-[#6B706D] uppercase">
                            {j.status.replace('_', ' ')}
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
              Select a vehicle to inspect service records.
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                {editingVehicle ? 'Edit Vehicle Profile' : 'Register Vehicle to Fleet'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Registration Plate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LEA-19-4821"
                  value={regNum}
                  onChange={e => setRegNum(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Owner / Customer *</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  required
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Make *</label>
                  <select
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  >
                    {['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'KIA', 'MG', 'Changan', 'Nissan'].map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corolla GLi"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={e => setMileage(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
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
                  {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
