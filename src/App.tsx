/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShopProvider, useShop, AppView } from './context/ShopContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { SetupPage } from './components/auth/SetupPage';
import { RegistrationDisabledPage } from './components/auth/RegistrationDisabledPage';
import { UsersManagementView } from './components/users/UsersManagementView';
import { DashboardView } from './components/dashboard/DashboardView';
import { POSView } from './components/pos/POSView';
import { JobCardsView } from './components/jobs/JobCardsView';
import { CustomersView } from './components/customers/CustomersView';
import { VehiclesView } from './components/vehicles/VehiclesView';
import { ProductsView } from './components/inventory/ProductsView';
import { PurchasesView } from './components/inventory/PurchasesView';
import { StockAuditView } from './components/inventory/StockAuditView';
import { LabourView } from './components/labour/LabourView';
import { LabourPayrollView } from './components/labour/LabourPayrollView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { OilChangesView } from './components/oil/OilChangesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { BackupRestoreView } from './components/backup/BackupRestoreView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { BottomNav } from './components/layout/BottomNav';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

const WorkshopAppContent: React.FC = () => {
  const { activeView, setupCompleted, currentUser, canAccess } = useShop();

  // 1. Explicit public registration attempt
  if (activeView === 'registration_disabled') {
    return <RegistrationDisabledPage />;
  }

  // 2. First-time Owner Setup required if database has no owner
  if (!setupCompleted || activeView === 'setup') {
    return <SetupPage />;
  }

  // 3. Authentication barrier: redirect unauthenticated visitors to login
  if (!currentUser || activeView === 'login') {
    return <LoginPage />;
  }

  // 4. Authenticated Garage Workspace
  const renderActiveView = () => {
    // Role-based route guard
    if (!canAccess(activeView)) {
      return (
        <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-8 text-center max-w-lg mx-auto my-12">
          <h2 className="text-base font-bold text-[#DC2626]">
            Access Restricted
          </h2>
          <p className="text-xs text-[#6B706D] mt-2">
            Your garage account role ({currentUser.role}) does not have permission to view this section.
          </p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <POSView />;
      case 'jobs':
        return <JobCardsView />;
      case 'customers':
        return <CustomersView />;
      case 'vehicles':
        return <VehiclesView />;
      case 'inventory':
        return <ProductsView />;
      case 'purchases':
        return <PurchasesView />;
      case 'stock_audit':
        return <StockAuditView />;
      case 'labour':
        return <LabourView />;
      case 'labour_payroll':
        return <LabourPayrollView />;
      case 'invoices':
        return <InvoicesView />;
      case 'expenses':
        return <ExpensesView />;
      case 'oil_changes':
        return <OilChangesView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersManagementView />;
      case 'settings':
        return <SettingsView />;
      case 'backup':
        return <BackupRestoreView />;
      case 'audit_logs':
        return <AuditLogsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#F5F5F3] text-[#202321] overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Permanent visible navigation sidebar on desktop (lg:flex) */}
        <Sidebar />

        {/* Primary Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 bg-[#F5F5F3] pb-20 lg:pb-6">
          <div className="mx-auto max-w-7xl">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (lg:hidden) */}
      <BottomNav />

      {/* Global Utilities */}
      <GlobalSearchModal />
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <WorkshopAppContent />
    </ShopProvider>
  );
}
