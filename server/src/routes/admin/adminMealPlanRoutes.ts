import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/auth';
import mealPlanController from '../../controllers/user/mealPlanController';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Admin meal plan management
router.get('/', mealPlanController.getAllMealPlans);

export default router;
