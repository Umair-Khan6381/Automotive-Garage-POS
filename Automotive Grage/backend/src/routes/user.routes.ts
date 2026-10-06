import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireOwner } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(requireOwner); // User administration is owner-restricted

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.patch('/:id/status', userController.toggleStatus);
router.post('/:id/reset-password', userController.resetPassword);
router.delete('/:id', userController.delete);

export default router;
