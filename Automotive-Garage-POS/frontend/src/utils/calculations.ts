import { ServiceDueStatus } from '../types';

/**
 * Calculates weighted average cost when adding new inventory purchase
 * Example:
 * Current: 100 units @ AED 2,000.00 = AED 200,000.00
 * New: 50 units @ AED 2,200.00 = AED 110,000.00
 * Total units: 150
 * Total value: AED 310,000.00
 * New weighted average: AED 310,000.00 / 150 = AED 2,066.67
 */
export const calculateWeightedAverageCost = (
  currentQty: number,
  currentAvgCost: number,
  purchasedQty: number,
  purchaseUnitPrice: number
): number => {
  if (purchasedQty <= 0) return currentAvgCost;
  if (currentQty <= 0) return purchaseUnitPrice;

  const currentTotalVal = currentQty * currentAvgCost;
  const newPurchaseTotalVal = purchasedQty * purchaseUnitPrice;
  const totalQty = currentQty + purchasedQty;

  if (totalQty === 0) return purchaseUnitPrice;
  return Math.round((currentTotalVal + newPurchaseTotalVal) / totalQty);
};

/**
 * Evaluates whether an oil change / scheduled service is upcoming, due, or overdue.
 */
export const evaluateServiceDueStatus = (
  currentMileage: number,
  nextRecommendedMileage: number,
  nextRecommendedDate: string
): { status: ServiceDueStatus; label: string; urgencyColor: string; reason: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(nextRecommendedDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffKm = nextRecommendedMileage - currentMileage;

  // Overdue if past date or current mileage reached/exceeded recommended mileage
  if (diffDays < 0 || diffKm <= 0) {
    let reason = '';
    if (diffDays < 0 && diffKm <= 0) {
      reason = `${Math.abs(diffDays)} days & ${Math.abs(diffKm)} km overdue`;
    } else if (diffDays < 0) {
      reason = `${Math.abs(diffDays)} days overdue`;
    } else {
      reason = `${Math.abs(diffKm)} km overdue`;
    }
    return {
      status: 'overdue',
      label: 'Service Overdue',
      urgencyColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      reason
    };
  }

  // Due if within 14 days or within 500 km
  if (diffDays <= 14 || diffKm <= 500) {
    let reason = '';
    if (diffDays <= 14 && diffKm <= 500) {
      reason = `Due in ${diffDays} days (${diffKm} km left)`;
    } else if (diffDays <= 14) {
      reason = `Due in ${diffDays} days`;
    } else {
      reason = `Due in ${diffKm} km`;
    }
    return {
      status: 'due',
      label: 'Service Due',
      urgencyColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      reason
    };
  }

  // Otherwise upcoming
  return {
    status: 'upcoming',
    label: 'Service Upcoming',
    urgencyColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    reason: `In ${diffDays} days or ${diffKm} km`
  };
};
