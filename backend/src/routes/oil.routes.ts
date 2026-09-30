import { Router } from 'express';
import { oilController } from '../controllers/oil.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', oilController.getAll);
router.post('/', oilController.create);

export default router;
