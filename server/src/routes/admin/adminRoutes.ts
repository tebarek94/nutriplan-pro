import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/auth';
import adminController from '../../controllers/admin/adminController';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardAnalytics);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id/profile', adminController.getUserProfile);
router.put('/users/:id/status', adminController.updateUserStatus);

// Recipe management
router.get('/recipes/pending', adminController.getPendingRecipes);
router.put('/recipes/:id/approve', adminController.approveRecipe);

// AI logs
router.get('/ai-logs', adminController.getAIAnalysisLogs);

// Food categories
router.get('/categories', adminController.getFoodCategories);
router.post('/categories', adminController.createFoodCategory);
router.put('/categories/:id', adminController.updateFoodCategory);
router.delete('/categories/:id', adminController.deleteFoodCategory);

// Ingredients
router.get('/ingredients', adminController.getAllIngredients);
router.post('/ingredients', adminController.createIngredient);
router.put('/ingredients/:id', adminController.updateIngredient);
router.delete('/ingredients/:id', adminController.deleteIngredient);

export default router;
