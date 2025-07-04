import express from 'express';
import authRoutes from './apis/auth.route.js';
import pollRoutes from './apis/poll.route.js';
import userRoutes from './apis/user.route.js'; // Thêm .js và đường dẫn đúng
import voteRoutes from './apis/vote.route.js'; // Thêm .js và đường dẫn đúng

const router = express.Router();

// Route kiểm tra server hoạt động
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server hoạt động',
    timestamp: new Date().toISOString()
  });
});

// Gắn các routes
router.use('/auth', authRoutes);
router.use('/polls', pollRoutes);
router.use('/users', userRoutes);
router.use('/votes', voteRoutes);

export default router; // Thay thế module.exports = router;