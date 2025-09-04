import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/auth';
import adminUserSuggestionController from '../../controllers/adminUserSuggestionController';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// User suggestions management
router.get('/users', adminUserSuggestionController.getUsersForSuggestions);
router.post('/meals', adminUserSuggestionController.sendMealSuggestionToUser);
router.post('/recipes', adminUserSuggestionController.sendRecipeSuggestionToUser);
router.post('/weekly', adminUserSuggestionController.sendWeeklyMealSuggestion);
router.get('/', adminUserSuggestionController.getUserSuggestions);
router.get('/weekly', adminUserSuggestionController.getWeeklyMealSuggestions);
router.get('/weekly/:id', adminUserSuggestionController.getWeeklyMealSuggestionDetails);
router.put('/:id/status', adminUserSuggestionController.updateUserSuggestionStatus);
router.put('/weekly/:id/status', adminUserSuggestionController.updateWeeklyMealSuggestionStatus);
router.get('/analytics', adminUserSuggestionController.getSuggestionAnalytics);

export default router;
