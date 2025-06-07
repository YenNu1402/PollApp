import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from '../../controllers/auth.controller.js';

import { authenticateJWT } from '../../middlewares/authenticateJWT.js';
import { authorize } from '../../middlewares/authenticateJWT.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Protected routes
router.use(authenticateJWT);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

export default router;
