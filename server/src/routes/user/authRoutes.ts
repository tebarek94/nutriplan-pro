import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { authSchemas, userProfileSchemas } from '../../middleware/validation';
import authController from '../../controllers/user/authController';

const router = Router();

// Public auth routes
router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/forgot-password', validateRequest(authSchemas.resetPassword), authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected auth routes
router.use(authenticateToken);
router.get('/profile', authController.getProfile);
router.put('/profile', validateRequest(userProfileSchemas.updateProfile), authController.updateProfile);
router.put('/user-info', validateRequest(authSchemas.updateUserInfo), authController.updateUserInfo);
router.put('/change-password', validateRequest(authSchemas.changePassword), authController.changePassword);
router.post('/logout', authController.logout);

export default router;
