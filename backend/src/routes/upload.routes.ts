import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Only authenticated staff/owners can upload sensitive receipts and salary documents
router.post('/', authenticate, uploadController.uploadDocument);

export default router;
