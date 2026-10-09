import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as c from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts. Try again in a few minutes' } });

const email = body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail();
const strong = (field) =>
  body(field)
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password needs at least one letter')
    .matches(/\d/).withMessage('Password needs at least one number');

router.post('/register', limiter, body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'), email, strong('password'), validate, c.register);
router.post('/login', limiter, email, body('password').notEmpty().withMessage('Enter your password'), validate, c.login);
router.post('/forgot-password', limiter, email, validate, c.forgotPassword);
router.post('/reset-password/:token', limiter, strong('password'), validate, c.resetPassword);

router.get('/me', protect, c.me);
router.put('/profile', protect, uploadAvatar, body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'), validate, c.updateProfile);
router.put('/password', protect, body('currentPassword').notEmpty().withMessage('Enter your current password'), strong('newPassword'), validate, c.changePassword);

export default router;
