import { Router } from 'express';
import { backupController } from '../controllers/backup.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(requireOwner);
router.get('/export', backupController.exportBackup);
router.post('/restore', backupController.restoreBackup);

export default router;
