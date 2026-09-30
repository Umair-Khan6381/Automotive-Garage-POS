import { Router } from 'express';
import { labourController } from '../controllers/labour.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/workers', labourController.getAllWorkers);
router.post('/workers', requireManagerOrOwner, labourController.createWorker);
router.get('/payments', labourController.getAllPayments);
router.post('/payments', requireManagerOrOwner, labourController.createPayment);

export default router;
