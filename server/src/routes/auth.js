import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', authLimiter, login);
router.get('/me', authenticateToken, getMe);

export default router;
