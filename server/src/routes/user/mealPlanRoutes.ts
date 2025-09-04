import { Router } from 'express';
import { authenticateToken, requireUser } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { mealPlanSchemas } from '../../middleware/validation';
import mealPlanController from '../../controllers/user/mealPlanController';

const router = Router();

// All routes require authentication and user role
router.use(authenticateToken, requireUser);

router.get('/', mealPlanController.getUserMealPlans);
router.get('/stats', mealPlanController.getMealPlanStats);
router.get('/approved', mealPlanController.getApprovedMealPlans);
router.post('/', validateRequest(mealPlanSchemas.createMealPlan), mealPlanController.createMealPlan);
router.post('/generate', validateRequest(mealPlanSchemas.aiGenerateMealPlan), mealPlanController.generateMealPlan);
router.post('/generate-weekly', validateRequest(mealPlanSchemas.aiGenerateWeeklyMealPlan), mealPlanController.generateWeeklyMealPlan);
router.get('/:id', mealPlanController.getMealPlanById);
router.put('/:id', mealPlanController.updateMealPlan);
router.delete('/:id', mealPlanController.deleteMealPlan);
router.post('/:id/grocery-list', mealPlanController.generateGroceryList);
router.get('/:id/nutrition', mealPlanController.getNutritionSummary);
router.post('/:id/copy', mealPlanController.copyMealPlan);

export default router;
