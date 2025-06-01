const express = require('express');
const router = express.Router();
const voteController = require('../../controllers/vote.controller');
const { authenticateJWT } = require('../../middlewares/authenticateJWT');

router.post('/:id/vote', authenticateJWT, voteController.vote);
router.delete('/:id/unvote', authenticateJWT, voteController.unvote);

module.exports = router;