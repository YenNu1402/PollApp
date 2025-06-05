import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../../controllers/auth.controller.js';

import { authenticateJWT } from '../../middlewares/authenticateJWT.js'; // ✅ Sửa đúng đường dẫn và biến
import { authorize } from '../../middlewares/authenticateJWT.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(authenticateJWT); // ✅ Sử dụng biến đúng đã import
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

export default router;
