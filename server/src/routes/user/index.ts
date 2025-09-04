import { Router } from 'express';
import authRoutes from './authRoutes';
import recipeRoutes from './recipeRoutes';
import mealPlanRoutes from './mealPlanRoutes';
import suggestionRoutes from './suggestionRoutes';
import userSuggestionRoutes from './userSuggestionRoutes';
import progressRoutes from './progressRoutes';

const router = Router();

// Mount user routes
router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/meal-plans', mealPlanRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/user-suggestions', userSuggestionRoutes);
router.use('/progress', progressRoutes);

export default router;
