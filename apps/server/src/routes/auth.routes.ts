import { Router } from 'express';
import { verifyToken } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// POST /api/v1/auth/verify
router.post('/verify', authLimiter, authMiddleware, verifyToken);

export default router;
