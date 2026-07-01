import { Router } from 'express';
import {
  getMyProfile,
  createProfile,
  updateProfile,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Secure all user profile endpoints
router.use(authMiddleware);

// GET /api/v1/users/me
router.get('/me', getMyProfile);

// POST /api/v1/users/profile
router.post('/profile', createProfile);

// PATCH /api/v1/users/me
router.patch('/me', updateProfile);

export default router;
