import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import {
  loginValidation,
  registerValidation,
} from '../utils/validation';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authenticateToken);
router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
