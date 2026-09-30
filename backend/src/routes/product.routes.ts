import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/', productController.getAll);
router.get('/transactions', productController.getTransactions);
router.get('/:id', productController.getById);
router.post('/', requireManagerOrOwner, productController.create);
router.put('/:id', requireManagerOrOwner, productController.update);
router.post('/:id/adjust', requireManagerOrOwner, productController.adjustStock);
router.post('/purchases', requireManagerOrOwner, productController.recordPurchase);

export default router;
