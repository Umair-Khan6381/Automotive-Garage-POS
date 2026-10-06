import { Router } from 'express';
import { purchaseController } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.post('/', requireManagerOrOwner, purchaseController.create);

export default router;
