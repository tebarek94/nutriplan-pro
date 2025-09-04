import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { recipeSchemas } from '../../middleware/validation';
import * as recipeController from '../../controllers/user/recipeController';

const router = Router();

// Public recipe routes
router.get('/', recipeController.getAllRecipes);
router.get('/featured', recipeController.getFeaturedRecipes);
router.get('/:id', recipeController.getRecipeById);

// Protected recipe routes
router.use(authenticateToken);
router.post('/', validateRequest(recipeSchemas.createRecipe), recipeController.createRecipe);
router.post('/generate', validateRequest(recipeSchemas.aiGenerateRecipe), recipeController.generateRecipe);
router.put('/:id', validateRequest(recipeSchemas.updateRecipe), recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);
router.post('/:id/review', validateRequest(recipeSchemas.recipeReview), recipeController.addRecipeReview);
router.post('/:id/like', recipeController.toggleRecipeLike);
router.get('/suggestions', recipeController.getRecipeSuggestions);

export default router;
