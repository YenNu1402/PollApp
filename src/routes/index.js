const express = require('express');
const router = express.Router();
const authRoutes = require('./apis/auth.route');

router.use('/auth', require('./apis/auth.route'));
router.use('/polls', require('./apis/poll.route'));
router.use('/users', require('./apis/user.route'));
router.use('/votes', require('./apis/vote.route'));

module.exports = router;