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
import { authenticateJWT, authorize } from '../../middlewares/authenticateJWT.js';

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/:id', getPoll);

// Protected routes
router.use(authenticateJWT);

// User routes
router.post('/', authorize('user', 'admin'), createPoll);
router.put('/:id', authorize('user', 'admin'), updatePoll);
router.patch('/:id/lock', authorize('user', 'admin'), togglePollLock);
router.post('/:id/options', authorize('user', 'admin'), addOption);
router.delete('/:id/options/:optionId', authorize('user', 'admin'), removeOption);
router.post('/:pollId/vote/:optionId', authorize('user', 'admin'), vote);
router.delete('/:pollId/vote/:optionId', authorize('user', 'admin'), removeVote);

export default router; 