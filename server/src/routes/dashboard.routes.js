import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { stats } from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/stats', protect, stats);
export default router;
