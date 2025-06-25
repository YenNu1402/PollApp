import express from 'express';
import voteController from '../../controllers/vote.controller.js';
import { authenticateJWT } from '../../middlewares/authenticateJWT.js';

const router = express.Router();

router.post('/:id/vote', authenticateJWT, voteController.vote);
router.delete('/:id/unvote', authenticateJWT, voteController.unvote);

export default router;
