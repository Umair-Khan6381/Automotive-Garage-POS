import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', jobController.getAll);
router.get('/:id', jobController.getById);
router.post('/', jobController.create);
router.put('/:id', jobController.update);
router.post('/:id/parts', jobController.addPart);
router.post('/:id/labour', jobController.addLabour);
router.post('/:id/photos', jobController.addPhoto);

export default router;
