import express from 'express';
import {
  getPolls,
  getPoll,
  createPoll,
  updatePoll,
  togglePollLock,
  addOption,
  removeOption,
  vote,
  removeVote
} from '../../controllers/poll.controller.js';
import { authenticateJWT } from '../../middlewares/authenticateJWT.js';

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/:id', getPoll);

// Protected routes
router.post('/', authenticateJWT, createPoll);
router.put('/:id', authenticateJWT, updatePoll);
router.patch('/:id/lock', authenticateJWT, togglePollLock);
router.post('/:id/options', authenticateJWT, addOption);
router.delete('/:id/options/:optionId', authenticateJWT, removeOption);
router.post('/:pollId/vote/:optionId', authenticateJWT, vote);
router.delete('/:pollId/vote/:optionId', authenticateJWT, removeVote);

export default router; 