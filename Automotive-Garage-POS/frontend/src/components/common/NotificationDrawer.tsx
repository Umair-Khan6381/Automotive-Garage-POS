import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Droplet,
  Package,
  Receipt,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { evaluateServiceDueStatus } from '../../utils/calculations';
import { formatPKR } from '../../utils/formatters';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    products,
    customers,
    oilChanges,
    vehicles,
    invoices,
    jobCards,
    setActiveView
  } = useShop();

  if (!isNotificationsOpen) return null;

  const lowStockProducts = products.filter(p => p.currentQuantity <= p.minStockLevel);

  const overdueOil = oilChanges.filter(oc => {
    const v = vehicles.find(veh => veh.id === oc.vehicleId);
    if (!v) return false;
    const res = evaluateServiceDueStatus(v.mileage, oc.nextRecommendedMileage, oc.nextRecommendedDate);
    return res.status === 'overdue';
  });

  const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'Paid');
  const openJobs = jobCards.filter(j => j.status !== 'completed' && j.status !== 'delivered' && j.status !== 'cancelled');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#202321]/40"
        onClick={() => setIsNotificationsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white shadow-2xl border-l border-[#DCDDD9] z-10 flex flex-col">
        <div className="flex h-14 items-center justify-between border-b border-[#DCDDD9] px-4 bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#1B4D3E]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
              Workshop Operations Alerts
            </h2>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1 text-[#6B706D] hover:text-[#202321]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Low Stock Section */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <span>Low Stock Alerts ({lowStockProducts.length})</span>
              <button
                onClick={() => {
                  setActiveView('purchases');
                  setIsNotificationsOpen(false);
                }}
                className="text-[#1B4D3E] hover:underline normal-case"
              >
                Create PO →
              </button>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-[11px] text-[#6B706D] p-2 bg-[#F5F5F3] rounded">All stock items are healthy.</p>
            ) : (
              <div className="space-y-1.5">
                {lowStockProducts.slice(0, 4).map(p => (
                  <div key={p.id} className="p-2 rounded border border-[#FECACA] bg-[#FEF2F2] flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#202321]">{p.name}</div>
                      <div className="text-[10px] text-[#6B706D] font-mono">Min required: {p.minStockLevel}</div>
                    </div>
                    <span className="font-mono font-bold text-[#DC2626]">
                      {p.currentQuantity} {p.unit} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue Oil Changes */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <span>Service Overdue ({overdueOil.length})</span>
              <button
                onClick={() => {
                  setActiveView('oil_changes');
                  setIsNotificationsOpen(false);
                }}
                className="text-[#1B4D3E] hover:underline normal-case"
              >
                View Reminders →
              </button>
            </div>
            {overdueOil.length === 0 ? (
              <p className="text-[11px] text-[#6B706D] p-2 bg-[#F5F5F3] rounded">No overdue oil services.</p>
            ) : (
              <div className="space-y-1.5">
                {overdueOil.slice(0, 3).map(oc => {
                  const v = vehicles.find(veh => veh.id === oc.vehicleId);
                  return (
                    <div key={oc.id} className="p-2 rounded border border-[#FECACA] bg-[#FEF2F2] flex justify-between items-center">
                      <div>
                        <div className="font-mono font-bold text-[#1B4D3E]">{v?.registrationNumber}</div>
                        <div className="text-[10px] text-[#6B706D]">{v?.make} {v?.model}</div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#DC2626] bg-white px-1.5 py-0.5 rounded border border-[#FECACA]">
                        Overdue
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Unpaid Invoices */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <span>Unpaid Invoices ({unpaidInvoices.length})</span>
              <button
                onClick={() => {
                  setActiveView('invoices');
                  setIsNotificationsOpen(false);
                }}
                className="text-[#1B4D3E] hover:underline normal-case"
              >
                Ledger →
              </button>
            </div>
            {unpaidInvoices.length === 0 ? (
              <p className="text-[11px] text-[#6B706D] p-2 bg-[#F5F5F3] rounded">All bills settled in full.</p>
            ) : (
              <div className="space-y-1.5">
                {unpaidInvoices.slice(0, 4).map(inv => (
                  <div key={inv.id} className="p-2 rounded border border-[#FDE68A] bg-[#FFFBEB] flex justify-between items-center">
                    <div>
                      <div className="font-mono font-bold text-[#202321]">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-[#6B706D]">
                        {customers.find(c => c.id === inv.customerId)?.fullName || 'Customer'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#DC2626]">{formatPKR(inv.balanceDue)}</div>
                      <div className="text-[9px] text-[#6B706D]">Due balance</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Job Cards */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <span>Bays in Service ({openJobs.length})</span>
              <button
                onClick={() => {
                  setActiveView('jobs');
                  setIsNotificationsOpen(false);
                }}
                className="text-[#1B4D3E] hover:underline normal-case"
              >
                Job Cards →
              </button>
            </div>
            <div className="space-y-1.5">
              {openJobs.slice(0, 3).map(j => (
                <div key={j.id} className="p-2 rounded border border-[#DCDDD9] bg-[#FAFAF9] flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-[#1B4D3E] mr-1">{j.jobNumber}</span>
                    <span className="text-[#202321]">{j.complaint.slice(0, 22)}...</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#B45309] uppercase">
                    {j.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
