import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.post('/', invoiceController.create);
router.post('/:id/payments', invoiceController.addPayment);

export default router;
