const express = require('express');
const router = express.Router();
const pollController = require('../../controllers/poll.controller');
const { authenticateJWT, isAdmin } = require('../../middlewares/authenticateJWT');

// ==== API Routes ====
// Lấy tất cả các poll (có phân trang)
router.get('/', authenticateJWT, pollController.getAllPolls);

// Lấy chi tiết 1 poll theo ID
router.get('/:id', authenticateJWT, pollController.getPollById);

// Admin tạo poll mới
router.post('/', authenticateJWT, isAdmin, pollController.create);

// Admin cập nhật poll
router.patch('/:id', authenticateJWT, isAdmin, pollController.update);

// Admin khóa poll
router.patch('/:id/lock', authenticateJWT, isAdmin, pollController.lockPoll);

// Admin mở khóa poll (nếu muốn)
router.patch('/:id/unlock', authenticateJWT, isAdmin, pollController.unlockPoll); // OPTIONAL

// Người dùng bình chọn
router.post('/:id/vote', authenticateJWT, pollController.vote);

// Người dùng hủy bình chọn
router.post('/:id/unvote', authenticateJWT, pollController.unvote);

// ==== Render EJS Pages ====
// Hiển thị form tạo poll
router.get('/create', authenticateJWT, isAdmin, pollController.renderCreatePollForm);

// Submit form tạo poll
router.post('/create', authenticateJWT, isAdmin, pollController.handleCreatePoll);

// Danh sách Poll hiển thị bằng EJS
router.get('/view/all', authenticateJWT, pollController.renderAllPollsPage);

// Xem poll chi tiết bằng EJS
router.get('/view/:id', authenticateJWT, pollController.renderPollDetailPage);

module.exports = router;
