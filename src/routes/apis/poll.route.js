const express = require('express');
const router = express.Router();
const pollController = require('../../controllers/poll.controller');
const { authenticateJWT, isAdmin } = require('../../middlewares/authenticateJWT');

router.get('/', authenticateJWT, pollController.getAllPolls);
router.get('/:id', authenticateJWT, pollController.getPollById);
router.post('/', authenticateJWT, isAdmin, pollController.create);
router.patch('/:id', authenticateJWT, isAdmin, pollController.update);
router.patch('/:id/lock', authenticateJWT, isAdmin, pollController.lockPoll);

router.get('/create', pollController.renderCreatePollForm);
router.post('/create', pollController.handleCreatePoll);

module.exports = router;