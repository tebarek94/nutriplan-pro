import express from 'express';
import progressController from '../../controllers/user/progressController';
import { authenticateToken } from '../../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user progress data
router.get('/', progressController.getUserProgress);

// Get weight progress
router.get('/weight', progressController.getWeightProgress);

// Get nutrition trends
router.get('/nutrition', progressController.getNutritionTrends);

// Get achievements
router.get('/achievements', progressController.getAchievements);

// Get streak data
router.get('/streak', progressController.getStreakData);

export default router;
