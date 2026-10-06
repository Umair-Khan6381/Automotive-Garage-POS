import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);
router.post('/', requireManagerOrOwner, supplierController.create);
router.put('/:id', requireManagerOrOwner, supplierController.update);
router.delete('/:id', requireManagerOrOwner, supplierController.delete);

export default router;
