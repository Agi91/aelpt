import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';

const router = Router();

// GET /api/v1/health
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);

export default router;
