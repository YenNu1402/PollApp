import express from 'express';
import * as userController from '../../controllers/user.controller.js';
import { authenticateJWT, isAdmin } from '../../middlewares/authenticateJWT.js';

const router = express.Router();

router.get('/me', authenticateJWT, userController.getProfile);
router.patch('/admin/users', authenticateJWT, isAdmin, userController.updateProfile);

// Lấy danh sách user (chỉ admin)
router.get('/admin/users', authenticateJWT, isAdmin, userController.getAllUsers);

// Admin cập nhật thông tin user theo id
router.patch('/admin/users/:id', authenticateJWT, isAdmin, userController.updateUserByAdmin);

export default router; // ✅ Xuất mặc định
