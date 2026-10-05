import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Users,
  Car,
  Droplet,
  Package,
  Truck,
  History,
  HardHat,
  Banknote,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  ShieldCheck,
  Shield,
  Lock,
  Database,
  X
} from 'lucide-react';
import { useShop, AppView } from '../../context/ShopContext';
import { evaluateServiceDueStatus } from '../../utils/calculations';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: 'amber' | 'red' | 'green';
  minRole?: 'employee' | 'manager' | 'admin' | 'owner';
}

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    products,
    jobCards,
    oilChanges,
    vehicles,
    invoices,
    unifiedExpenses,
    currentUser,
    settings
  } = useShop();

  // Badge calculations
  const openJobsCount = jobCards.filter(j => j.status !== 'completed' && j.status !== 'delivered' && j.status !== 'cancelled').length;
  const lowStockCount = products.filter(p => p.currentQuantity <= p.minStockLevel).length;
  const unpaidInvoicesCount = invoices.filter(i => i.paymentStatus !== 'Paid').length;
  const pendingExpensesCount = unifiedExpenses.filter(e => e.paymentStatus === 'Pending' || e.paymentStatus === 'Overdue').length;
  const overdueOilCount = oilChanges.filter(oc => {
    const v = vehicles.find(veh => veh.id === oc.vehicleId);
    if (!v) return false;
    const res = evaluateServiceDueStatus(v.mileage, oc.nextRecommendedMileage, oc.nextRecommendedDate);
    return res.status === 'overdue';
  }).length;

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: 'POS & Billing', icon: ShoppingCart },
        {
          id: 'jobs',
          label: 'Repair Jobs',
          icon: Wrench,
          badge: openJobsCount,
          badgeVariant: 'amber'
        },
        {
          id: 'oil_changes',
          label: 'Oil Changes',
          icon: Droplet,
          badge: overdueOilCount > 0 ? overdueOilCount : undefined,
          badgeVariant: 'red'
        }
      ]
    },
    {
      title: 'Clients & Fleet',
      items: [
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'vehicles', label: 'Vehicles', icon: Car }
      ]
    },
    {
      title: 'Inventory',
      items: [
        {
          id: 'inventory',
          label: 'Parts & Stock',
          icon: Package,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeVariant: 'red'
        },
        { id: 'purchases', label: 'Stock Purchases', icon: Truck, minRole: 'manager' },
        { id: 'stock_audit', label: 'Audit Trail', icon: History, minRole: 'manager' }
      ]
    },
    {
      title: 'Labour & Payroll',
      items: [
        { id: 'labour', label: 'Technicians', icon: HardHat },
        { id: 'labour_payroll', label: 'Labour Payroll', icon: Banknote, minRole: 'manager' }
      ]
    },
    {
      title: 'Accounting',
      items: [
        {
          id: 'invoices',
          label: 'Invoices Ledger',
          icon: Receipt,
          badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
          badgeVariant: 'amber'
        },
        {
          id: 'expenses',
          label: 'Daily & Fixed Expenses',
          icon: Wallet,
          badge: pendingExpensesCount > 0 ? pendingExpensesCount : undefined,
          badgeVariant: 'red',
          minRole: 'manager'
        },
        { id: 'reports', label: 'Profit & Reports', icon: BarChart3, minRole: 'manager' }
      ]
    },
    {
      title: 'Dubai Regulations & Policies',
      items: [
        { id: 'dubai_policies', label: 'Dubai Policies & RTA', icon: Shield, minRole: 'employee' }
      ]
    },
    {
      title: 'System & Security',
      items: [
        { id: 'users', label: 'Users & Access', icon: ShieldCheck, minRole: 'owner' },
        { id: 'settings', label: 'Shop Settings', icon: Settings, minRole: 'manager' },
        { id: 'backup', label: 'Backup & Restore', icon: Database, minRole: 'manager' },
        { id: 'audit_logs', label: 'Audit Logs', icon: History, minRole: 'manager' }
      ]
    }
  ];

  const handleNavClick = (viewId: AppView) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  const hasAccess = (minRole?: 'employee' | 'manager' | 'admin' | 'owner') => {
    if (!minRole) return true;
    if (!currentUser) return false;
    if (currentUser.role === 'owner' || currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager' && minRole !== 'admin' && minRole !== 'owner') return true;
    return currentUser.role === minRole;
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-2.5 py-3">
      <div className="space-y-4">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter(item => hasAccess(item.minRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B706D]">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#1B4D3E] text-white font-medium shadow-xs'
                          : 'text-[#202321] hover:bg-[#F0F2F0] hover:text-[#1B4D3E]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-[#6B706D]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-semibold shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeVariant === 'red'
                              ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10'
                              : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/10'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 border-t border-[#DCDDD9] pt-3 px-1 space-y-2">
        <div className="rounded-md border border-[#DCDDD9] bg-[#F8F9FA] p-2.5 text-[11px] text-[#6B706D] shadow-2xs">
          <div className="flex items-center gap-1.5 font-medium text-[#1B4D3E]">
            <Lock className="h-3 w-3" />
            <span>Private Garage Mode</span>
          </div>
          <div className="text-[10px] text-[#6B706D] mt-0.5">
            Internal access only · Public signup disabled
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#DCDDD9] flex justify-between items-center text-[10px]">
            <span>Currency:</span>
            <span className="font-mono text-[#202321] font-semibold">{settings.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Permanent Desktop Navigation Menu Bar: strictly visible on lg+ screens */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:shrink-0 border-r border-[#DCDDD9] bg-white">
        {navContent}
      </aside>

      {/* Mobile & Tablet Drawer Overlay (shown only when opened via hamburger button) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#202321]/40 transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="relative flex w-64 max-w-[85vw] flex-1 flex-col bg-white shadow-xl border-r border-[#DCDDD9] z-10">
            <div className="flex h-14 items-center justify-between border-b border-[#DCDDD9] px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1B4D3E] text-white">
                  <Wrench className="h-3 w-3" />
                </div>
                <span className="font-bold text-xs text-[#202321]">Apex Workshop</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
