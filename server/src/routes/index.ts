import { Router } from 'express';
import userRoutes from './user';
import adminRoutes from './admin';

const router = Router();

// Mount all routes
router.use('/api', userRoutes);
router.use('/api/admin', adminRoutes);

export default router;
