import express from 'express';
import * as userController from '../../controllers/user.controller.js';
import { authenticateJWT, isAdmin } from '../../middlewares/authenticateJWT.js';

const router = express.Router();

// Người dùng tự cập nhật hồ sơ
router.patch('/me', authenticateJWT, userController.updateProfile);

// Lấy thông tin hồ sơ
router.get('/me', authenticateJWT, userController.getProfile);

// Admin lấy danh sách user
router.get('/admin/users', authenticateJWT, isAdmin, userController.getAllUsers);

// Admin cập nhật user theo id
router.patch('/admin/users/:id', authenticateJWT, isAdmin, userController.updateUserByAdmin);

// Admin routes
router.use(authenticateJWT, isAdmin);
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUserByAdmin);
router.get('/:userId/tokens', userController.getUserTokens);

export default router; // ✅ Xuất mặc định
