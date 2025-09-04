import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/auth';
import { suggestionController } from '../../controllers/user/suggestionController';
import adminSuggestionController from '../../controllers/adminSuggestionController';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// General suggestions management
router.get('/', suggestionController.getAllSuggestions);
router.get('/analytics', suggestionController.getSuggestionAnalytics);
router.get('/:id', suggestionController.getSuggestionById);
router.put('/:id/status', suggestionController.updateSuggestionStatus);
router.delete('/:id', suggestionController.deleteSuggestion);

// Meal suggestions
router.post('/meals', adminSuggestionController.createMealSuggestion);
router.get('/meals', adminSuggestionController.getAllMealSuggestions);
router.put('/meals/:id', adminSuggestionController.updateMealSuggestion);
router.delete('/meals/:id', adminSuggestionController.deleteMealSuggestion);
router.post('/meals/:id/toggle-status', adminSuggestionController.toggleMealSuggestionStatus);

// Recipe suggestions
router.post('/recipes', adminSuggestionController.createRecipeSuggestion);
router.get('/recipes', adminSuggestionController.getAllRecipeSuggestions);
router.put('/recipes/:id', adminSuggestionController.updateRecipeSuggestion);
router.delete('/recipes/:id', adminSuggestionController.deleteRecipeSuggestion);
router.post('/recipes/:id/toggle-status', adminSuggestionController.toggleRecipeSuggestionStatus);
router.post('/recipes/:id/toggle-featured', adminSuggestionController.toggleRecipeSuggestionFeatured);

export default router;
