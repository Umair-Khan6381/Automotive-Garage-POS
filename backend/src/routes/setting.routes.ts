import { Router } from 'express';
import { settingController } from '../controllers/setting.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', settingController.getSettings);
router.put('/', requireOwner, settingController.updateSettings);

export default router;
