import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireOwner } from '../middleware/role.middleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authRateLimiter, authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
router.get('/users', authenticate, requireOwner, authController.getUsers);
router.post('/users', authenticate, requireOwner, authController.createUser);
router.patch('/users/:id/status', authenticate, requireOwner, authController.toggleUserStatus);

export default router;
