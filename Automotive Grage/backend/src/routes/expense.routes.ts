import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner, requireOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// 1. Unified Listing & Financial Breakdown
router.get('/', expenseController.getUnified);
router.get('/unified', expenseController.getUnified);
router.get('/summary', expenseController.getMonthlySummary);

// 2. Daily Operational Expenses (Breakfast, Tea, Lunch, Conveyance, Workshop supplies)
router.post('/', requireManagerOrOwner, expenseController.createDaily);
router.post('/daily', requireManagerOrOwner, expenseController.createDaily);
router.put('/daily/:id', requireManagerOrOwner, expenseController.updateDaily);
router.post('/daily/:id/void', requireOwner, expenseController.voidExpense);
router.delete('/:id', requireOwner, expenseController.deleteExpense);
router.delete('/daily/:id', requireOwner, expenseController.deleteExpense);

// 3. Workshop Rent
router.get('/rents', expenseController.getRents);
router.post('/rents', requireManagerOrOwner, expenseController.createRent);
router.post('/rents/:id/pay', requireManagerOrOwner, expenseController.payRent);

// 4. Electricity Bills
router.get('/electricity', expenseController.getElectricityBills);
router.post('/electricity', requireManagerOrOwner, expenseController.createElectricityBill);
router.post('/electricity/:id/pay', requireManagerOrOwner, expenseController.payElectricityBill);

// 5. Licenses & Legal Fees
router.get('/licenses', expenseController.getLicenses);
router.post('/licenses', requireManagerOrOwner, expenseController.createLicense);
router.post('/licenses/:id/renew', requireManagerOrOwner, expenseController.renewLicense);

export default router;
