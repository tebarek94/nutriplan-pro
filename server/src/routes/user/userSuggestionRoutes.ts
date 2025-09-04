import { Router } from 'express';
import { authenticateToken, requireUser } from '../../middleware/auth';
import userSuggestionController from '../../controllers/user/userSuggestionController';

const router = Router();

// All routes require authentication and user role
router.use(authenticateToken, requireUser);

// User suggestion routes (for users to view admin suggestions)
router.get('/', userSuggestionController.getAdminSuggestions);
router.get('/weekly', userSuggestionController.getWeeklyMealSuggestions);
router.get('/weekly/:id', userSuggestionController.getWeeklyMealSuggestionDetails);
router.post('/:id/read', userSuggestionController.markSuggestionAsRead);
router.post('/:id/respond', userSuggestionController.respondToSuggestion);
router.post('/weekly/:id/read', userSuggestionController.markWeeklySuggestionAsRead);
router.post('/weekly/:id/respond', userSuggestionController.respondToWeeklySuggestion);
router.get('/stats', userSuggestionController.getSuggestionStats);
router.post('/weekly/:id/convert', userSuggestionController.convertWeeklySuggestionToMealPlan);

export default router;
