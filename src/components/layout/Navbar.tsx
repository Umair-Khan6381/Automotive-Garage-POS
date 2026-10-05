import React, { useState, useEffect } from 'react';
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
  UserCheck,
  Type,
  Zap,
  Keyboard
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
    setIsQuickActionsOpen,
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
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [currentFontScale, setCurrentFontScale] = useState<string>(() => {
    return localStorage.getItem('garage_pos_font_scale') || '1.1';
  });

  const handleSetFontScale = (scale: string) => {
    setCurrentFontScale(scale);
    localStorage.setItem('garage_pos_font_scale', scale);
    document.documentElement.style.setProperty('--app-font-scale', scale);
    setShowFontMenu(false);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', currentFontScale);
  }, [currentFontScale]);

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
    audit_logs: { section: 'System', title: 'Audit Logs & Traceability' },
    dubai_policies: { section: 'Dubai Compliance', title: 'Dubai Workshop Policies & RTA Standards' }
  };

  const currentMeta = viewTitles[activeView] || { section: 'Workshop', title: 'Management' };
  const userInitials = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#DCDDD9] bg-white px-3 sm:px-4 lg:px-6 shadow-2xs">
        {/* Zone 1: Mobile Hamburger + Brand + Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial pr-2">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-md p-1.5 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] lg:hidden focus-visible:outline-none shrink-0 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className="text-left flex items-center gap-2.5 group focus:outline-none min-w-0"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1B4D3E] text-white shadow-xs group-hover:bg-[#153E32] transition-colors">
              <Wrench className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm sm:text-base font-semibold tracking-tight text-[#202321] truncate whitespace-nowrap">
              {settings.garageName || settings.shopName || 'Umair Auto Care'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-[#DCDDD9] text-xs text-[#6B706D] shrink-0">
            <span>{currentMeta.section}</span>
            <span className="text-[#DCDDD9]">/</span>
            <span className="font-medium text-[#202321]">{currentMeta.title}</span>
          </div>
        </div>

        {/* Zone 2: Fast Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex w-full items-center justify-between rounded-md border border-[#DCDDD9] bg-[#F5F5F3]/80 px-3 py-1.5 text-xs text-[#6B706D] transition-all hover:bg-white hover:border-[#1B4D3E]/40 hover:text-[#202321] shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#6B706D]" />
              <span className="truncate">Search plate (LEA-19), customer, job #...</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-[#6B706D]">
              <kbd className="rounded border border-[#DCDDD9] bg-white px-1.5 py-0.5 shadow-2xs">⌘S</kbd>
            </span>
          </button>
        </div>

        {/* Zone 3: Quick Desk Actions + Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Actions Hub Button */}
          <button
            onClick={() => setIsQuickActionsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4D3E] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] active:scale-[0.98] transition-all shadow-xs shrink-0 cursor-pointer"
            title="Quick Actions: Create Job, Record Expense, Process Payment (Press Q)"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
            <span className="hidden sm:inline">Quick Actions</span>
            <kbd className="hidden lg:inline-block ml-0.5 rounded bg-white/20 px-1 py-0.2 text-[9px] font-mono">Q</kbd>
          </button>

          {/* Mobile Search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-md p-1.5 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] md:hidden shrink-0 transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Quick POS Button (Visible on sm+ screens, handled on mobile by BottomNav) */}
          <button
            onClick={() => setActiveView('pos')}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-[#DCDDD9] bg-white px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#202321] hover:bg-[#F5F5F3] hover:border-[#B8B9B4] active:scale-[0.98] transition-all shadow-2xs shrink-0"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-[#1B4D3E]" />
            <span>POS</span>
          </button>

          {/* Quick New Job Button (Visible on md+ screens) */}
          <button
            onClick={() => setActiveView('jobs')}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-medium text-[#202321] hover:bg-[#F5F5F3] hover:border-[#B8B9B4] active:scale-[0.98] transition-all shrink-0 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-[#6B706D]" />
            <span>New Job</span>
          </button>

          {/* Display Font Size Controller (T-Size) */}
          <div className="relative hidden sm:block shrink-0">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="inline-flex items-center gap-1 rounded-md border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-medium text-[#202321] hover:border-[#1B4D3E] hover:bg-[#F5F5F3] transition-all shadow-2xs"
              title="Display Font Size (T-Size) / فونٹ سائز تبدیل کریں"
              aria-label="Adjust font size"
            >
              <Type className="h-3.5 w-3.5 text-[#1B4D3E]" />
              <span className="font-bold text-[12px] text-[#1B4D3E]">T</span>
              <span className="text-[10px] text-[#1B4D3E] font-semibold font-mono bg-[#E8F0EC] px-1 py-0.5 rounded">
                {currentFontScale === '0.8' ? '80%' : currentFontScale === '0.9' ? '90%' : currentFontScale === '1.0' ? '100%' : currentFontScale === '1.1' ? '110%' : currentFontScale === '1.2' ? '120%' : '135%'}
              </span>
              <ChevronDown className="h-3 w-3 text-[#6B706D]" />
            </button>

            {showFontMenu && (
              <div
                className="absolute right-0 mt-1 w-56 rounded-md border border-[#DCDDD9] bg-white p-1.5 shadow-lg z-50 text-xs ring-1 ring-black/5"
                onMouseLeave={() => setShowFontMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-[#6B706D] uppercase tracking-wider border-b border-[#DCDDD9] mb-1 flex items-center justify-between">
                  <span>T-Size (Display Scale)</span>
                  <span className="text-[#1B4D3E] font-mono">Zoom</span>
                </div>
                {[
                  { label: '80% (Compact / Mini)', scale: '0.8', pct: '80%' },
                  { label: '90% (Small / Compact)', scale: '0.9', pct: '90%' },
                  { label: '100% (Standard / Normal)', scale: '1.0', pct: '100%' },
                  { label: '110% (Large - Default)', scale: '1.1', pct: '110%' },
                  { label: '120% (Extra Large)', scale: '1.2', pct: '120%' },
                  { label: '135% (Maximum / Jumbo)', scale: '1.35', pct: '135%' }
                ].map(opt => (
                  <button
                    key={opt.scale}
                    onClick={() => handleSetFontScale(opt.scale)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors ${
                      currentFontScale === opt.scale
                        ? 'bg-[#E8F0EC] text-[#1B4D3E] font-semibold'
                        : 'text-[#202321] hover:bg-[#F5F5F3]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="font-mono text-[11px] font-semibold opacity-80">{opt.pct}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative rounded-md p-1.5 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] shrink-0 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white tabular-nums ring-1 ring-white">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Profile & Security Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 rounded-md border border-[#DCDDD9] bg-white p-1 sm:px-2 sm:py-1 hover:border-[#B8B9B4] hover:bg-[#F5F5F3] transition-all text-left shadow-2xs"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B4D3E] text-xs font-bold text-white shadow-2xs">
                {userInitials}
              </div>
              <div className="hidden lg:block text-left text-xs leading-none">
                <span className="font-medium text-[#202321] mr-1">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
                </span>
                <span className="text-[10px] text-[#6B706D] uppercase">
                  ({currentUser?.role === 'admin' ? 'Owner' : currentUser?.role})
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-[#6B706D] hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-1 w-56 rounded-md border border-[#DCDDD9] bg-white p-1.5 shadow-lg z-50 text-xs ring-1 ring-black/5"
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

                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    const event = new KeyboardEvent('keydown', { key: '?' });
                    window.dispatchEvent(event);
                  }}
                  className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-[#202321] hover:bg-[#F5F5F3] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-3.5 w-3.5 text-[#6B706D]" />
                    <span>Keyboard Shortcuts</span>
                  </div>
                  <kbd className="font-mono text-[10px] text-[#6B706D] bg-[#F5F5F3] px-1 py-0.2 rounded border border-[#DCDDD9]">?</kbd>
                </button>

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
