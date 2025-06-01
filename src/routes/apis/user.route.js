const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { authenticateJWT, isAdmin } = require('../../middlewares/authenticateJWT');

router.get('/me', authenticateJWT, userController.getProfile);
router.patch('/admin/users', authenticateJWT, isAdmin, userController.updateProfile);


// Lấy danh sách user (chỉ admin)
router.get('/admin/users', authenticateJWT, isAdmin, userController.getAllUsers);

// Admin cập nhật thông tin user theo id
router.patch('/admin/users/:id', authenticateJWT, isAdmin, userController.updateUserByAdmin);

module.exports = router;