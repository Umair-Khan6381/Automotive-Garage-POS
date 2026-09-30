import React from 'react';
import {
  LayoutDashboard,
  Wrench,
  ShoppingCart,
  Package,
  Menu
} from 'lucide-react';
import { useShop, AppView } from '../../context/ShopContext';

export const BottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    jobCards,
    products
  } = useShop();

  const openJobsCount = jobCards.filter(
    j => j.status !== 'completed' && j.status !== 'delivered' && j.status !== 'cancelled'
  ).length;

  const lowStockCount = products.filter(
    p => p.currentQuantity <= p.minStockLevel
  ).length;

  const navItems: { id: AppView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Wrench, badge: openJobsCount > 0 ? openJobsCount : undefined },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-[#DCDDD9] bg-white px-2 shadow-lg lg:hidden"
    >
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveView(item.id);
              setMobileSidebarOpen(false);
            }}
            className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
              isActive ? 'text-[#1B4D3E]' : 'text-[#6B706D] hover:text-[#202321]'
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B45309] px-1 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* "More" Trigger for Secondary Modules Drawer */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
        className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
          isMobileSidebarOpen ? 'text-[#1B4D3E]' : 'text-[#6B706D] hover:text-[#202321]'
        }`}
      >
        <Menu className="h-5 w-5 stroke-2" />
        <span className="text-[10px] font-medium tracking-tight mt-0.5">More</span>
      </button>
    </nav>
  );
};
