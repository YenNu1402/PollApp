import Poll from '../models/poll.model.js';
import ApiResponse from '../utils/apiResponse.js';

// Get all polls with pagination
const getPolls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Poll.countDocuments();
    const polls = await Poll.find()
      .populate('creator', 'username')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json(
      ApiResponse.paginate(polls, page, limit, total)
    );
  } catch (error) {
    next(error);
  }
};

// Get single poll
const getPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('creator', 'username')
      .populate('options.votes', 'username');

    if (!poll) {
      return res.status(404).json(
        ApiResponse.error('Poll not found')
      );
    }

    res.status(200).json(
      ApiResponse.success('Poll retrieved successfully', poll)
    );
  } catch (error) {
    next(error);
  }
};

// Create poll
const createPoll = async (req, res, next) => {
  try {
    const { title, description, options, expiresAt } = req.body;

    if (!options || options.length < 2) {
      return res.status(400).json(
        ApiResponse.error('Please provide at least 2 options')
      );
    }

    const poll = await Poll.create({
      title,
      description,
      creator: req.user.id,
      options: options.map(opt => ({ text: opt })),
      expiresAt
    });

    res.status(201).json(
      ApiResponse.success('Poll created successfully', poll)
    );
  } catch (error) {
    next(error);
  }
};

// Update poll
const updatePoll = async (req, res, next) => {
  try {
    const { title, description, expiresAt } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json(
        ApiResponse.error('Poll not found')
      );
    }

    // Check ownership
    if (poll.creator.toString() !== req.user.id && !req.user.isAdmin()) {
      return res.status(403).json(
        ApiResponse.error('Not authorized to update this poll')
      );
    }

    if (poll.isLocked) {
      return res.status(400).json(
        ApiResponse.error('Cannot update a locked poll')
      );
    }

    poll.title = title || poll.title;
    poll.description = description || poll.description;
    poll.expiresAt = expiresAt || poll.expiresAt;

    await poll.save();

    res.status(200).json(
      ApiResponse.success('Poll updated successfully', poll)
    );
  } catch (error) {
    next(error);
  }
};

// Lock/Unlock poll
const togglePollLock = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json(
        ApiResponse.error('Poll not found')
      );
    }

    // Check ownership
    if (poll.creator.toString() !== req.user.id && !req.user.isAdmin()) {
      return res.status(403).json(
        ApiResponse.error('Not authorized to lock/unlock this poll')
      );
    }

    poll.isLocked = !poll.isLocked;
    await poll.save();

    res.status(200).json(
      ApiResponse.success(
        `Poll ${poll.isLocked ? 'locked' : 'unlocked'} successfully`,
        poll
      )
    );
  } catch (error) {
    next(error);
  }
};

// Add option to poll
const addOption = async (req, res, next) => {
  try {
    const { text } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json(
        ApiResponse.error('Poll not found')
      );
    }

    if (poll.isLocked) {
      return res.status(400).json(
        ApiResponse.error('Cannot add option to a locked poll')
      );
    }

    if (poll.isExpired()) {
      return res.status(400).json(
        ApiResponse.error('Cannot add option to an expired poll')
      );
    }

    poll.options.push({ text });
    await poll.save();

    res.status(200).json(
      ApiResponse.success('Option added successfully', poll)
    );
  } catch (error) {
    next(error);
  }
};

// Remove option from poll
const removeOption = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json(
        ApiResponse.error('Poll not found')
      );
    }

    if (poll.isLocked) {
      return res.status(400).json(
        ApiResponse.error('Cannot remove option from a locked poll')
      );
    }

    const option = poll.options.id(req.params.optionId);
    if (!option) {
      return res.status(404).json(
        ApiResponse.error('Option not found')
      );
    }

    if (option.votes.length > 0) {
      return res.status(400).json(
        ApiResponse.error('Cannot remove an option that has votes')
      );
    }

    option.remove();
    await poll.save();

    res.status(200).json(
      ApiResponse.success('Option removed successfully', poll)
    );
  } catch (error) {
    next(error);
  }
};

// Vote on poll
const vote = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.pollId);

    if (!poll) {
      return res.status(404).json(
        ApiResponse.error('Poll not found')
      );
    }

    if (poll.isLocked) {
      return res.status(400).json(
        ApiResponse.error('Cannot vote on a locked poll')
      );
    }

    if (poll.isExpired()) {
      return res.status(400).json(
        ApiResponse.error('Cannot vote on an expired poll')
      );
    }

    await poll.addVote(req.user.id, req.params.optionId);

    res.status(200).json(
      ApiResponse.success('Vote added successfully', poll)
    );
  } catch (error) {
    if (error.message === 'User has already voted') {
      return res.status(400).json(
        ApiResponse.error(error.message)
      );
    }
    next(error);
  }
};

// Remove vote from poll
const removeVote = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.pollId);

    if (!poll) {
      return res.status(404).json(
        ApiResponse.error('Poll not found')
      );
    }

    if (poll.isLocked) {
      return res.status(400).json(
        ApiResponse.error('Cannot remove vote from a locked poll')
      );
    }

    await poll.removeVote(req.user.id, req.params.optionId);

    res.status(200).json(
      ApiResponse.success('Vote removed successfully', poll)
    );
  } catch (error) {
    if (error.message === 'Vote not found') {
      return res.status(400).json(
        ApiResponse.error(error.message)
      );
    }
    next(error);
  }
};

export {
  getPolls,
  getPoll,
  createPoll,
  updatePoll,
  togglePollLock,
  addOption,
  removeOption,
  vote,
  removeVote,
};