import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as c from '../controllers/interview.controller.js';

const router = Router();
router.use(protect);
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, message: { success: false, message: 'Hourly AI limit reached. Please try again later' } });

router.post(
  '/generate',
  aiLimiter,
  body('role').trim().isLength({ min: 2, max: 80 }).withMessage('Enter a job role (2-80 characters)'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Choose a difficulty'),
  body('type').isIn(['Technical', 'HR', 'Behavioral', 'Mixed']).withMessage('Choose an interview type'),
  body('skills').optional().isArray({ max: 25 }).withMessage('Skills must be a list'),
  validate,
  c.generate
);
router.post(
  '/submit',
  aiLimiter,
  body('interviewId').isMongoId().withMessage('Invalid interview'),
  body('answers').isArray({ min: 1, max: 20 }).withMessage('Answers must be a list'),
  validate,
  c.submit
);
router.get('/history', c.history);
router.get('/:id', c.getInterview);
router.delete('/:id', c.removeInterview);
export default router;
