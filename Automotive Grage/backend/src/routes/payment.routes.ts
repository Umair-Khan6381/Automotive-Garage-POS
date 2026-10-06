import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', paymentController.getAll);
router.get('/:id', paymentController.getById);
router.post('/', paymentController.create);

export default router;
