import React, { useState } from 'react';
import {
  Droplet,
  Plus,
  Search,
  Calendar,
  Gauge,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { evaluateServiceDueStatus } from '../../utils/calculations';
import { formatPKR, formatDate } from '../../utils/formatters';

export const OilChangesView: React.FC = () => {
  const {
    oilChanges,
    vehicles,
    customers,
    products,
    logOilChange,
    settings,
    setActiveView
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vehicleId, setVehicleId] = useState('');
  const [mileage, setMileage] = useState(50000);
  const [oilProductId, setOilProductId] = useState('');
  const [quantityLiters, setQuantityLiters] = useState(4);
  const [customPrice, setCustomPrice] = useState(9500);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthsInterval, setMonthsInterval] = useState(settings.defaultOilChangeMonths || 3);
  const [kmInterval, setKmInterval] = useState(settings.defaultOilChangeKm || 5000);
  const [oilNotes, setOilNotes] = useState('');

  const openLogModal = (presetVehId?: string) => {
    const targetVeh = presetVehId
      ? vehicles.find(v => v.id === presetVehId)
      : vehicles[0];

    const targetProd = products.find(p => p.category === 'Engine Oil') || products[0];

    setVehicleId(targetVeh?.id || '');
    setMileage(targetVeh ? targetVeh.mileage : 50000);
    setOilProductId(targetProd?.id || '');
    setQuantityLiters(4);
    setCustomPrice(targetProd?.sellingPrice || 9500);
    setServiceDate(new Date().toISOString().slice(0, 10));
    setMonthsInterval(settings.defaultOilChangeMonths || 3);
    setKmInterval(settings.defaultOilChangeKm || 5000);
    setOilNotes('Oil filter replaced and engine level checked.');
    setIsModalOpen(true);
  };

  const handleSaveOilChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !oilProductId) return;

    const vehicle = vehicles.find(v => v.id === vehicleId);
    const product = products.find(p => p.id === oilProductId);
    if (!vehicle || !product) return;

    const nextDate = new Date(serviceDate);
    nextDate.setMonth(nextDate.getMonth() + Number(monthsInterval));
    const nextDateStr = nextDate.toISOString().slice(0, 10);
    const nextMileage = Number(mileage) + Number(kmInterval);

    logOilChange({
      vehicleId: vehicle.id,
      customerId: vehicle.customerId,
      date: serviceDate,
      mileage: Number(mileage),
      oilProductId: product.id,
      oilProductName: product.name,
      quantityLiters: Number(quantityLiters),
      cost: product.purchasePrice,
      sellingPrice: Number(customPrice),
      nextRecommendedMileage: nextMileage,
      nextRecommendedDate: nextDateStr,
      notes: oilNotes
    });

    setIsModalOpen(false);
  };

  // Evaluate status for each record
  const enrichedLogs = oilChanges.map(oc => {
    const veh = vehicles.find(v => v.id === oc.vehicleId);
    const cust = customers.find(c => c.id === oc.customerId);
    const currentMileage = veh ? veh.mileage : oc.mileage;
    const evalResult = evaluateServiceDueStatus(currentMileage, oc.nextRecommendedMileage, oc.nextRecommendedDate);

    return {
      ...oc,
      vehicle: veh,
      customer: cust,
      currentMileage,
      evalResult
    };
  });

  const filteredLogs = enrichedLogs.filter(item => {
    const reg = item.vehicle?.registrationNumber || '';
    const cust = item.customer?.fullName || '';
    const prod = item.oilProductName || '';
    return (
      reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const overdueCount = enrichedLogs.filter(i => i.evalResult.status === 'overdue').length;
  const dueCount = enrichedLogs.filter(i => i.evalResult.status === 'due').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Vehicle Oil Change & Preventative Maintenance
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Odometer-based reminders, oil grade history, and automated sticker sticker intervals
          </p>
        </div>

        <button
          onClick={() => openLogModal()}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log New Oil Service</span>
        </button>
      </div>

      {/* Summary Ribbon */}
      <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-3">
        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Total Service Records
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#202321]">
            {oilChanges.length}
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Logged across customer fleet
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Overdue Services
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#DC2626]">
            {overdueCount} <span className="text-xs font-normal text-[#6B706D]">vehicles</span>
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Exceeded calendar date or km limit
          </div>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
            Due Soon (Within 500 km)
          </div>
          <div className="mt-1 text-lg font-bold font-mono text-[#B45309]">
            {dueCount} <span className="text-xs font-normal text-[#6B706D]">vehicles</span>
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Approaching service window
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
        <input
          type="text"
          placeholder="Search by plate, owner, or oil product..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
        />
      </div>

      {/* Oil Service Ledger Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Plate Number</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Service Date</th>
                <th className="px-3 py-2.5">Oil Brand & Grade</th>
                <th className="px-3 py-2.5 text-right">Odometer Logged</th>
                <th className="px-3 py-2.5 text-right">Next Due (km / Date)</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6B706D]">
                    No oil change records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => {
                  const isOverdue = item.evalResult.status === 'overdue';
                  const isDue = item.evalResult.status === 'due';

                  return (
                    <tr key={item.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="px-3.5 py-2.5">
                        <span className="font-mono font-bold text-xs bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded">
                          {item.vehicle?.registrationNumber}
                        </span>
                        <div className="text-[11px] text-[#6B706D] mt-0.5">
                          {item.vehicle?.make} {item.vehicle?.model}
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-medium text-[#202321]">{item.customer?.fullName}</div>
                        <div className="text-[11px] text-[#6B706D] font-mono">{item.customer?.phone}</div>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[#6B706D]">
                        {formatDate(item.date)}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-[#202321]">{item.oilProductName}</div>
                        <div className="text-[11px] text-[#6B706D] font-mono">
                          {item.quantityLiters}L · {formatPKR(item.sellingPrice)}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-medium text-[#202321]">
                        {item.mileage.toLocaleString()} km
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono">
                        <div className="font-bold text-[#202321]">
                          {item.nextRecommendedMileage.toLocaleString()} km
                        </div>
                        <div className="text-[10px] text-[#6B706D]">
                          {formatDate(item.nextRecommendedDate)}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${
                            isOverdue
                              ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                              : isDue
                              ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                              : 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                          }`}
                        >
                          {item.evalResult.label}
                        </span>
                        <div className="text-[10px] text-[#6B706D] mt-0.5 font-mono">
                          {item.evalResult.reason}
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          onClick={() => openLogModal(item.vehicleId)}
                          className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-semibold text-[#1B4D3E] hover:bg-[#E8F0EC]"
                        >
                          Re-Service
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

      {/* Log Oil Change Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Log Oil Change Service
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOilChange} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Vehicle Plate *</label>
                <select
                  value={vehicleId}
                  onChange={e => {
                    setVehicleId(e.target.value);
                    const v = vehicles.find(veh => veh.id === e.target.value);
                    if (v) setMileage(v.mileage);
                  }}
                  required
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Service Date</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={e => setServiceDate(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Current Odometer (km) *</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={e => setMileage(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Engine Oil Product *</label>
                <select
                  value={oilProductId}
                  onChange={e => {
                    setOilProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setCustomPrice(p.sellingPrice);
                  }}
                  required
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                >
                  {products.filter(p => p.category === 'Engine Oil' || p.name.toLowerCase().includes('oil')).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — {formatPKR(p.sellingPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Volume (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={quantityLiters}
                    onChange={e => setQuantityLiters(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Total Charged (PKR)</label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={e => setCustomPrice(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Next Service (km)</label>
                  <input
                    type="number"
                    value={kmInterval}
                    onChange={e => setKmInterval(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Interval (Months)</label>
                  <input
                    type="number"
                    value={monthsInterval}
                    onChange={e => setMonthsInterval(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Technician Notes</label>
                <input
                  type="text"
                  value={oilNotes}
                  onChange={e => setOilNotes(e.target.value)}
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
                  Save & Update Next Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
