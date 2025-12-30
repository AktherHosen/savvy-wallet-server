import { Router } from 'express';
import { validate } from '../middlewares/validate';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
