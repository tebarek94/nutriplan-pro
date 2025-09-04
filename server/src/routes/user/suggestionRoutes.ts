import { Router } from 'express';
import { authenticateToken, requireUser } from '../../middleware/auth';
import { suggestionController } from '../../controllers/user/suggestionController';
import adminSuggestionController from '../../controllers/adminSuggestionController';

const router = Router();

// All routes require authentication and user role
router.use(authenticateToken, requireUser);

// User suggestions
router.get('/', suggestionController.getUserSuggestions);
router.get('/:id', suggestionController.getSuggestionById);
router.post('/', suggestionController.createSuggestion);
router.post('/:id/interact', suggestionController.interactWithSuggestion);

// Approved suggestions
router.get('/approved', suggestionController.getApprovedSuggestions);

// Public meal suggestions
router.get('/meals', adminSuggestionController.getPublicMealSuggestions);

// Public recipe suggestions
router.get('/recipes', adminSuggestionController.getPublicRecipeSuggestions);

// Meal suggestion interaction
router.post('/meals/:id/interact', adminSuggestionController.interactWithMealSuggestion);

// Recipe suggestion interaction
router.post('/recipes/:id/interact', adminSuggestionController.interactWithRecipeSuggestion);

// User saved suggestions
router.get('/saved', adminSuggestionController.getUserSavedSuggestions);

export default router;
