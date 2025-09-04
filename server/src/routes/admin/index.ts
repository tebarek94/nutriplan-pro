import { Router } from 'express';
import adminRoutes from './adminRoutes';
import adminSuggestionRoutes from './adminSuggestionRoutes';
import adminUserSuggestionRoutes from './adminUserSuggestionRoutes';
import adminMealPlanRoutes from './adminMealPlanRoutes';

const router = Router();

// Mount admin routes
router.use('/', adminRoutes);
router.use('/suggestions', adminSuggestionRoutes);
router.use('/user-suggestions', adminUserSuggestionRoutes);
router.use('/meal-plans', adminMealPlanRoutes);

export default router;
