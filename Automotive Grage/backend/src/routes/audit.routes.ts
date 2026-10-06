import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(requireManagerOrOwner);

router.get('/', auditController.getAll);

export default router;
