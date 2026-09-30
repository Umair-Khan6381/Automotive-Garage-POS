import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ShoppingCart,
  Wrench,
  ChevronDown,
  LogOut,
  KeyRound,
  ShieldCheck,
  Settings as SettingsIcon,
  Shield,
  UserCheck
} from 'lucide-react';
import { useShop, AppView } from '../../context/ShopContext';
import { evaluateServiceDueStatus } from '../../utils/calculations';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setMobileSidebarOpen,
    setIsSearchOpen,
    setIsNotificationsOpen,
    products,
    jobCards,
    oilChanges,
    vehicles,
    currentUser,
    logout,
    settings,
    isOwner
  } = useShop();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Compute operational alerts count
  const lowStockCount = products.filter(p => p.currentQuantity <= p.minStockLevel).length;
  const openJobsCount = jobCards.filter(j => j.status !== 'completed' && j.status !== 'delivered' && j.status !== 'cancelled').length;
  const serviceOverdueCount = oilChanges.filter(oc => {
    const v = vehicles.find(veh => veh.id === oc.vehicleId);
    if (!v) return false;
    const res = evaluateServiceDueStatus(v.mileage, oc.nextRecommendedMileage, oc.nextRecommendedDate);
    return res.status === 'overdue';
  }).length;
  const totalNotifications = lowStockCount + serviceOverdueCount + (openJobsCount > 0 ? 1 : 0);

  // View title labels for breadcrumbs
  const viewTitles: Record<AppView, { section: string; title: string }> = {
    login: { section: 'Auth', title: 'Sign In' },
    setup: { section: 'Auth', title: 'First-time Setup' },
    registration_disabled: { section: 'Auth', title: 'Private System' },
    dashboard: { section: 'Workshop', title: 'Operational Floor' },
    pos: { section: 'Billing', title: 'Counter POS Desk' },
    jobs: { section: 'Repairs', title: 'Job Cards & Work Orders' },
    customers: { section: 'Directory', title: 'Client Accounts' },
    vehicles: { section: 'Registry', title: 'Vehicle Fleet & Plates' },
    inventory: { section: 'Inventory', title: 'Parts Catalog & Stock' },
    purchases: { section: 'Inventory', title: 'Supplier Purchases (PO)' },
    stock_audit: { section: 'Inventory', title: 'Stock Movement Audit' },
    labour: { section: 'Workforce', title: 'Technicians & Labour' },
    labour_payroll: { section: 'Workforce', title: 'Mechanic Payroll Ledger' },
    invoices: { section: 'Accounting', title: 'Invoices & Receipts' },
    expenses: { section: 'Accounting', title: 'Daily & Fixed Expenses' },
    oil_changes: { section: 'Preventative', title: 'Oil & Service Reminders' },
    reports: { section: 'Management', title: 'Financial & Profit Reports' },
    users: { section: 'System', title: 'Users & Access Control' },
    settings: { section: 'System', title: 'Workshop Configuration' },
    backup: { section: 'System', title: 'Backup & Disaster Recovery' },
    audit_logs: { section: 'System', title: 'Audit Logs & Traceability' }
  };

  const currentMeta = viewTitles[activeView] || { section: 'Workshop', title: 'Management' };
  const userInitials = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#DCDDD9] bg-white px-4 lg:px-6">
        {/* Zone 1: Mobile Hamburger + Brand + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded p-1.5 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] lg:hidden focus-visible:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className="text-left flex items-center gap-2 group focus:outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1B4D3E] text-white">
              <Wrench className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#202321]">
              {settings.garageName || settings.shopName || 'Umair Auto Care'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-[#DCDDD9] text-xs text-[#6B706D]">
            <span>{currentMeta.section}</span>
            <span className="text-[#DCDDD9]">/</span>
            <span className="font-semibold text-[#202321]">{currentMeta.title}</span>
          </div>
        </div>

        {/* Zone 2: Fast Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex w-full items-center justify-between rounded border border-[#DCDDD9] bg-[#F5F5F3] px-3 py-1.5 text-xs text-[#6B706D] transition-colors hover:border-[#6B706D] hover:text-[#202321]"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#6B706D]" />
              <span className="truncate">Search plate (LEA-19), customer, job #...</span>
            </span>
            <kbd className="rounded border border-[#DCDDD9] bg-white px-1.5 py-0.5 text-[10px] text-[#6B706D] font-mono shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Zone 3: Quick Desk Actions + Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile Search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="rounded p-1.5 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] md:hidden"
            title="Search"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Quick POS Button */}
          <button
            onClick={() => setActiveView('pos')}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Counter POS</span>
          </button>

          {/* Quick New Job Button */}
          <button
            onClick={() => setActiveView('jobs')}
            className="inline-flex items-center gap-1.5 rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-[#6B706D]" />
            <span className="hidden xs:inline">New Job</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative rounded p-1.5 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white tabular-nums">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Profile & Security Menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded border border-[#DCDDD9] bg-white px-2 py-1 hover:border-[#6B706D] transition-colors text-left"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-[#1B4D3E] text-[11px] font-bold text-white">
                {userInitials}
              </div>
              <div className="hidden lg:block text-left text-xs leading-none">
                <span className="font-semibold text-[#202321] mr-1">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
                </span>
                <span className="text-[10px] text-[#6B706D] uppercase">
                  ({currentUser?.role === 'admin' ? 'Owner' : currentUser?.role})
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-[#6B706D]" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-1 w-56 rounded border border-[#DCDDD9] bg-white p-1.5 shadow-lg z-50 text-xs"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                {/* User info banner */}
                <div className="px-2.5 py-2 border-b border-[#DCDDD9] mb-1">
                  <div className="font-semibold text-[#202321] flex items-center justify-between">
                    <span>{currentUser?.name}</span>
                    <span className="rounded bg-[#E8F0EC] px-1.5 py-0.2 text-[9px] font-bold text-[#1B4D3E] uppercase">
                      {currentUser?.role === 'admin' ? 'Owner' : currentUser?.role}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#6B706D]">
                    @{currentUser?.username}
                  </div>
                </div>

                {/* Owner: Users & Access */}
                {isOwner && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveView('users');
                    }}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[#202321] hover:bg-[#F5F5F3] transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#1B4D3E]" />
                    <span>Users & Access Control</span>
                  </button>
                )}

                {/* Change Password */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowPasswordModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[#202321] hover:bg-[#F5F5F3] transition-colors"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#6B706D]" />
                  <span>Change Password</span>
                </button>

                {/* Shop Settings */}
                {isOwner && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveView('settings');
                    }}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[#202321] hover:bg-[#F5F5F3] transition-colors"
                  >
                    <SettingsIcon className="h-3.5 w-3.5 text-[#6B706D]" />
                    <span>Garage Settings</span>
                  </button>
                )}

                {/* Logout */}
                <div className="mt-1 pt-1 border-t border-[#DCDDD9]">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[#DC2626] hover:bg-[#FEE2E2] font-semibold transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};
