import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  X,
  Search,
  Wrench,
  CreditCard,
  Receipt,
  ShoppingCart,
  LayoutDashboard,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useShop, AppView } from '../../context/ShopContext';

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Actions' | 'Navigation' | 'General';
  action?: () => void;
}

export const KeyboardShortcutsModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    isQuickActionsOpen,
    setIsQuickActionsOpen,
    quickActionTargetModal,
    setQuickActionTargetModal,
    setActiveView
  } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  // Global listener for all keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      const isModifier = e.ctrlKey || e.metaKey;

      // 1. Help Cheat Sheet: '?' (Shift + '/') when not in input
      if (e.key === '?' && !isInput && !isModifier) {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      // 2. Escape: Close any open modal
      if (e.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
          return;
        }
      }

      // Shortcuts with Ctrl / Cmd:
      if (isModifier) {
        const key = e.key.toLowerCase();

        // 3. Ctrl+N / Cmd+N -> Create New Job
        if (key === 'n') {
          e.preventDefault();
          setIsOpen(false);
          setIsSearchOpen(false);
          setIsQuickActionsOpen(false);
          setQuickActionTargetModal('job');
          return;
        }

        // 4. Ctrl+S / Cmd+S or Ctrl+K / Cmd+K -> Global Search
        if (key === 's' || key === 'k') {
          e.preventDefault();
          setIsOpen(false);
          setIsQuickActionsOpen(false);
          setQuickActionTargetModal(null);
          setIsSearchOpen(!isSearchOpen);
          return;
        }

        // 5. Ctrl+E / Cmd+E -> Record Expense
        if (key === 'e') {
          e.preventDefault();
          setIsOpen(false);
          setIsSearchOpen(false);
          setIsQuickActionsOpen(false);
          setQuickActionTargetModal('expense');
          return;
        }

        // 6. Ctrl+P / Cmd+P -> Process Payment (avoiding native print if modal isn't open)
        // Only override if not in an invoice print view or if Alt+P is pressed
        if (key === 'p' && !e.shiftKey) {
          // If invoice print modal is not active, treat as process payment shortcut
          const printableModal = document.getElementById('printable-invoice-area');
          if (!printableModal) {
            e.preventDefault();
            setIsOpen(false);
            setIsSearchOpen(false);
            setIsQuickActionsOpen(false);
            setQuickActionTargetModal('payment');
            return;
          }
        }

        // 7. Ctrl+B / Cmd+B -> Counter POS
        if (key === 'b') {
          e.preventDefault();
          setIsOpen(false);
          setIsSearchOpen(false);
          setIsQuickActionsOpen(false);
          setQuickActionTargetModal(null);
          setActiveView('pos');
          return;
        }

        // 8. Ctrl+D / Cmd+D -> Dashboard
        if (key === 'd') {
          e.preventDefault();
          setIsOpen(false);
          setActiveView('dashboard');
          return;
        }

        // 9. Ctrl+J / Cmd+J -> Repair Jobs
        if (key === 'j') {
          e.preventDefault();
          setIsOpen(false);
          setActiveView('jobs');
          return;
        }

        // 10. Ctrl+I / Cmd+I -> Invoices
        if (key === 'i') {
          e.preventDefault();
          setIsOpen(false);
          setActiveView('invoices');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    isSearchOpen,
    setIsSearchOpen,
    setIsQuickActionsOpen,
    setQuickActionTargetModal,
    setActiveView
  ]);

  const shortcuts: ShortcutItem[] = [
    {
      keys: [`${modKey}`, 'N'],
      description: 'Create New Job Card (Intake)',
      category: 'Actions',
      action: () => {
        setIsOpen(false);
        setQuickActionTargetModal('job');
      }
    },
    {
      keys: [`${modKey}`, 'S'],
      description: 'Global Search (Plate, customer, job #)',
      category: 'Actions',
      action: () => {
        setIsOpen(false);
        setIsSearchOpen(true);
      }
    },
    {
      keys: [`${modKey}`, 'K'],
      description: 'Alternative Global Search',
      category: 'Actions',
      action: () => {
        setIsOpen(false);
        setIsSearchOpen(true);
      }
    },
    {
      keys: [`${modKey}`, 'E'],
      description: 'Record Expense (Food, petty cash, parts)',
      category: 'Actions',
      action: () => {
        setIsOpen(false);
        setQuickActionTargetModal('expense');
      }
    },
    {
      keys: [`${modKey}`, 'P'],
      description: 'Process Payment (Settle invoice)',
      category: 'Actions',
      action: () => {
        setIsOpen(false);
        setQuickActionTargetModal('payment');
      }
    },
    {
      keys: [`${modKey}`, 'B'],
      description: 'Open Counter POS Billing',
      category: 'Actions',
      action: () => {
        setIsOpen(false);
        setActiveView('pos');
      }
    },
    {
      keys: [`${modKey}`, 'D'],
      description: 'Navigate to Dashboard',
      category: 'Navigation',
      action: () => {
        setIsOpen(false);
        setActiveView('dashboard');
      }
    },
    {
      keys: [`${modKey}`, 'J'],
      description: 'Navigate to Repair Job Cards',
      category: 'Navigation',
      action: () => {
        setIsOpen(false);
        setActiveView('jobs');
      }
    },
    {
      keys: [`${modKey}`, 'I'],
      description: 'Navigate to Invoices Ledger',
      category: 'Navigation',
      action: () => {
        setIsOpen(false);
        setActiveView('invoices');
      }
    },
    {
      keys: ['Q'],
      description: 'Toggle Quick Actions Hub Menu',
      category: 'General',
      action: () => {
        setIsOpen(false);
        setIsQuickActionsOpen(true);
      }
    },
    {
      keys: ['?'],
      description: 'Open Keyboard Shortcuts Cheat Sheet',
      category: 'General',
      action: () => setIsOpen(true)
    },
    {
      keys: ['Esc'],
      description: 'Close Active Modal / Drawer',
      category: 'General'
    }
  ];

  const categories: ('Actions' | 'Navigation' | 'General')[] = ['Actions', 'Navigation', 'General'];

  return (
    <>
      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-xl border border-[#DCDDD9] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0EC] text-[#1B4D3E]">
                  <Keyboard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#202321] tracking-tight">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-xs text-[#6B706D]">
                    Speed up high-frequency garage data entry and navigation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Categorized List */}
            <div className="mt-4 max-h-[420px] overflow-y-auto space-y-4 pr-1">
              {categories.map(cat => {
                const groupItems = shortcuts.filter(s => s.category === cat);
                return (
                  <div key={cat}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1B4D3E] mb-2 px-1">
                      {cat === 'Actions' ? '⚡ Rapid Floor Actions' : cat === 'Navigation' ? '🧭 Quick Navigation' : '⚙️ General Controls'}
                    </div>
                    <div className="rounded-lg border border-[#DCDDD9] bg-[#FAFAF9] divide-y divide-[#E5E7EB] overflow-hidden">
                      {groupItems.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => item.action && item.action()}
                          className={`flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                            item.action ? 'hover:bg-white cursor-pointer' : ''
                          }`}
                        >
                          <span className="text-[#202321] font-medium">{item.description}</span>
                          <div className="flex items-center gap-1">
                            {item.keys.map((k, kIdx) => (
                              <kbd
                                key={kIdx}
                                className="inline-flex min-w-[20px] items-center justify-center rounded border border-[#DCDDD9] bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#202321] shadow-2xs"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-[#DCDDD9] flex items-center justify-between text-[11px] text-[#6B706D]">
              <span>Tip: Press <kbd className="font-mono bg-[#F5F5F3] px-1 py-0.5 rounded border border-[#DCDDD9]">?</kbd> from any screen to reopen this cheat sheet.</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded bg-[#1B4D3E] px-3 py-1 font-semibold text-white hover:bg-[#153E32] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
