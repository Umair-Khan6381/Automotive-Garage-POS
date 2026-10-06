import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(requireManagerOrOwner);

router.get('/profit', reportController.getProfitReport);
router.get('/sales', reportController.getSalesReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/payroll', reportController.getLabourPayrollReport);
router.get('/expenses', reportController.getExpenseReport);

export default router;
