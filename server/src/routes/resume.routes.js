import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { uploadPdf } from '../middleware/upload.js';
import { uploadResume, listResumes, deleteResume } from '../controllers/resume.controller.js';

const router = Router();
router.use(protect);
router.get('/', listResumes);
router.post('/upload', uploadPdf, uploadResume);
router.delete('/:id', deleteResume);
export default router;
