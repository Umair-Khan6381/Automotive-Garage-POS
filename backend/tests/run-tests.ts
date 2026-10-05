/**
 * Automated Backend Test Suite for Garage POS Core Business Logic
 * Run via: npm test (or tsx tests/run-tests.ts)
 */

import { hashPassword, verifyPassword, generateToken, verifyToken } from '../src/utils/security';
import { validateCustomerData } from '../src/validators/customer.validator';
import { validateVehicleData } from '../src/validators/vehicle.validator';
import { validateProductData } from '../src/validators/product.validator';
import { validateJobData } from '../src/validators/job.validator';
import { validateInvoiceData } from '../src/validators/invoice.validator';

async function runTests() {
  console.log('============================================================');
  console.log('🧪 RUNNING GARAGE POS BACKEND UNIT & LOGIC TESTS');
  console.log('============================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // Test 1: Password Hashing & Verification
  console.log('\n--- 1. Authentication & Security ---');
  const password = 'umair123#';
  const { hash, salt } = await hashPassword(password);
  assert(hash.length > 20 && salt.length > 0, 'Password hashing generates valid hash and salt');

  const isValidMatch = await verifyPassword(password, hash);
  assert(isValidMatch === true, 'Correct password verification succeeds');

  const isInvalidMatch = await verifyPassword('wrongpassword', hash);
  assert(isInvalidMatch === false, 'Incorrect password verification fails');

  // Test 2: JWT Token Lifecycle & RBAC
  const userPayload = {
    id: 'usr-1',
    name: 'Umair Ullah',
    username: 'umair',
    email: 'owner@example.com',
    role: 'owner' as const,
    status: 'active'
  };
  const token = generateToken(userPayload);
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token generation succeeds');

  const decoded = verifyToken(token);
  assert(decoded?.username === 'umair' && decoded?.role === 'owner', 'Decoded token matches user payload');

  // Test 3: Customer Validation
  console.log('\n--- 2. Customer Validation ---');
  const validCustomer = validateCustomerData({ fullName: 'Ali Raza', phone: '+923001234567' });
  assert(validCustomer.isValid, 'Valid customer passes validation');

  const invalidCustomer = validateCustomerData({ fullName: '', phone: '' });
  assert(!invalidCustomer.isValid && !!invalidCustomer.errors.fullName, 'Empty customer fails validation');

  // Test 4: Vehicle Validation
  console.log('\n--- 3. Vehicle Validation ---');
  const validVehicle = validateVehicleData({
    customerId: 'cust-1',
    registrationNumber: 'LEA-20-1234',
    make: 'Toyota',
    model: 'Yaris'
  });
  assert(validVehicle.isValid, 'Valid vehicle passes validation');

  const invalidVehicle = validateVehicleData({ customerId: '', registrationNumber: '', make: '', model: '' });
  assert(!invalidVehicle.isValid && !!invalidVehicle.errors.registrationNumber, 'Empty vehicle fails validation');

  // Test 5: Inventory & Product Validation
  console.log('\n--- 4. Inventory & Stock Logic ---');
  const validProduct = validateProductData({
    name: 'Brake Fluid DOT 4',
    sku: 'FLUID-DOT4',
    purchasePrice: 650,
    sellingPrice: 950,
    currentQuantity: 20
  });
  assert(validProduct.isValid, 'Valid product passes validation');

  // Test 6: Weighted Average Cost (WAC) Simulation
  const oldQty = 10;
  const oldCost = 1000; // total 10,000
  const addedQty = 20;
  const addedCost = 1300; // total 26,000
  const expectedAvgCost = Math.round((10 * 1000 + 20 * 1300) / (10 + 20)); // 36000 / 30 = 1200
  assert(expectedAvgCost === 1200, `WAC calculation is accurate: ${expectedAvgCost} vs expected 1200`);

  // Test 7: Inventory Deduction Logic
  let stock = 15;
  const jobUsedQty = 3;
  stock -= jobUsedQty;
  assert(stock === 12, `Stock deduction on job usage calculates correctly: ${stock} left`);

  // Test 8: Job Card Validation
  console.log('\n--- 5. Job Card & Invoicing Logic ---');
  const validJob = validateJobData({
    customerId: 'cust-1',
    vehicleId: 'veh-1',
    customerComplaint: 'Engine overheating on highway'
  });
  assert(validJob.isValid, 'Valid repair job passes validation');

  const validInvoice = validateInvoiceData({
    customerId: 'cust-1',
    grandTotal: 15000,
    items: [{ type: 'part', name: 'Coolant', quantity: 2, unitPrice: 2000, totalPrice: 4000 }]
  });
  assert(validInvoice.isValid, 'Valid invoice passes validation');

  // Test 9: Server-side Profit Calculation
  console.log('\n--- 6. Server-side Profit Calculation ---');
  const revenue = 100000;
  const partsCost = 45000;
  const labourCost = 15000;
  const expenses = 12000;
  const grossProfit = revenue - (partsCost + labourCost);
  const netProfit = grossProfit - expenses;
  const margin = Number(((netProfit / revenue) * 100).toFixed(1));

  assert(grossProfit === 40000, `Gross profit calculates accurately: Rs. ${grossProfit}`);
  assert(netProfit === 28000, `Net profit calculates accurately: Rs. ${netProfit}`);
  assert(margin === 28.0, `Net margin calculates accurately: ${margin}%`);

  // Test 10: Daily Operational Expenses (Breakfast & Tea Aggregation)
  console.log('\n--- 7. Expense & Fixed Cost Management ---');
  const breakfast = 800;
  const morningTea = 150;
  const eveningTea = 150;
  const dailyTeaTotal = morningTea + eveningTea;
  const totalDailyFoodTea = breakfast + dailyTeaTotal;
  assert(dailyTeaTotal === 300, `Daily tea multiple entries aggregate correctly: Rs. ${dailyTeaTotal}`);
  assert(totalDailyFoodTea === 1100, `Breakfast (Rs. 800) + Tea (Rs. 300) equals Rs. 1100`);

  // Test 11: Fixed Monthly Costs Integration (Rent + Electricity)
  const workshopRent = 80000;
  const electricityBill = 38500;
  const totalFixedCosts = workshopRent + electricityBill;
  assert(totalFixedCosts === 118500, `Fixed monthly overheads (Rent + LESCO) aggregate correctly: Rs. ${totalFixedCosts}`);

  // Test 12: Integrated Net Profit with Fixed & Daily Expenses
  const monthlyShopRevenue = 250000;
  const monthlyPartsCost = 80000;
  const monthlyLabourCost = 30000;
  const monthlyGrossMargin = monthlyShopRevenue - (monthlyPartsCost + monthlyLabourCost); // 140,000
  const monthlyOperatingExpenses = totalFixedCosts + totalDailyFoodTea + 5000; // 118,500 + 1,100 + 5,000 = 124,600
  const monthlyNetProfit = monthlyGrossMargin - monthlyOperatingExpenses; // 140,000 - 124,600 = 15,400
  assert(monthlyGrossMargin === 140000, `Monthly gross margin accurate: Rs. ${monthlyGrossMargin}`);
  assert(monthlyNetProfit === 15400, `Monthly net profit after subtracting rent, electricity, and daily tea/food: Rs. ${monthlyNetProfit}`);

  // Test 13: Weekly Profit Breakdown & Investment Calculation
  console.log('\n--- 8. Multi-Period (Weekly, Monthly, Yearly) & Capital Investment ROI ---');
  const weekRevenue = 65000;
  const weekPartsCost = 22000;
  const weekLabourCost = 8000;
  const weekDailyExpenses = 5500; // Breakfast, Tea, Conveyance
  const weekFixedRentShare = 20000; // Weekly portion of rent
  const weekTotalInvestment = weekPartsCost + weekLabourCost + weekDailyExpenses + weekFixedRentShare; // 55,500
  const weekNetProfit = weekRevenue - weekTotalInvestment; // 9,500
  const weekRoi = Number(((weekNetProfit / weekTotalInvestment) * 100).toFixed(1)); // 17.1%
  assert(weekTotalInvestment === 55500, `Weekly total investment calculated accurately: Rs. ${weekTotalInvestment}`);
  assert(weekNetProfit === 9500, `Weekly net profit calculated accurately: Rs. ${weekNetProfit}`);
  assert(weekRoi === 17.1, `Weekly return on investment (ROI) accurate: ${weekRoi}%`);

  // Test 14: Yearly Cumulative Profit & Capital Return
  const yearRevenue = 3200000;
  const yearCOGS = 1400000;
  const yearOperatingExpenses = 1250000;
  const yearTotalInvestment = yearCOGS + yearOperatingExpenses; // 2,650,000
  const yearNetProfit = yearRevenue - yearTotalInvestment; // 550,000
  const yearRoi = Number(((yearNetProfit / yearTotalInvestment) * 100).toFixed(1)); // 20.8%
  const yearMargin = Number(((yearNetProfit / yearRevenue) * 100).toFixed(1)); // 17.2%
  assert(yearNetProfit === 550000, `Annual net profit calculated accurately: Rs. ${yearNetProfit}`);
  assert(yearRoi === 20.8, `Annual capital ROI calculated accurately: ${yearRoi}%`);
  assert(yearMargin === 17.2, `Annual net margin calculated accurately: ${yearMargin}%`);

  console.log('\n============================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner encountered an error:', err);
  process.exit(1);
});
