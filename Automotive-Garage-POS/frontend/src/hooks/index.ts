/**
 * Automotive Garage POS & Workshop Management — Custom Hooks
 * File: src/hooks/index.ts
 */

import { useShop } from '../context/ShopContext';

/**
 * Hook to access garage state, database operations, and live metrics
 */
export { useShop };

/**
 * Hook to access current authenticated user and role-based permissions
 */
export function useAuth() {
  const { currentUser, login, logout, canAccess } = useShop();
  const role = currentUser?.role;
  const isAuthenticated = !!currentUser;

  return {
    user: currentUser,
    role,
    isAuthenticated,
    isOwner: role === 'owner',
    isManager: role === 'manager',
    isEmployee: role === 'employee',
    canManageUsers: role === 'owner',
    canViewProfit: role === 'owner',
    canManageExpenses: role === 'owner' || role === 'manager',
    canDeleteRecords: role === 'owner',
    canAccess,
    login,
    logout
  };
}

/**
 * Hook for currency and Dubai UAE VAT calculations
 */
export function useCurrency() {
  const { settings } = useShop();
  const currency = settings?.currency || 'AED';
  const taxRate = settings?.defaultTaxRate ?? 5.0;

  const format = (amount: number) => {
    return `${currency} ${(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const calculateVat = (amount: number) => {
    return Math.round(((amount * taxRate) / 100) * 100) / 100;
  };

  return {
    currency,
    taxRate,
    format,
    calculateVat
  };
}
