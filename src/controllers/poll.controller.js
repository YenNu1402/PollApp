const Poll = require('../models/poll.model');

const create = async (req, res) => {
  const poll = new Poll({ ...req.body, creator: req.user.id });
  await poll.save();
  res.status(201).json({ success: true, data: poll });
};

const update = async (req, res) => {
  const updated = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
};

const getPolls = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const polls = await Poll.find()
    .populate('creator', 'username')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Poll.countDocuments();
  res.json({
    success: true,
    message: 'Get all Poll successfully',
    data: { polls, total, page: Number(page), limit: Number(limit) }
  });
};

const getPollById = async (req, res) => {
  const poll = await Poll.findById(req.params.id).populate('creator', 'username');
  res.json({ success: true, message: 'Get Poll successfully', data: poll });
};

const lockPoll = async (req, res) => {
  const poll = await Poll.findByIdAndUpdate(req.params.id, { isLocked: true }, { new: true });
  res.json({ success: true, message: 'Poll locked', data: poll });
};

const unlockPoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(req.params.id, { isLocked: false }, { new: true });

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({ success: true, message: 'Poll unlocked', data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

const renderCreatePollForm = (req, res) => {
  res.render('create-poll');
};

const handleCreatePoll = async (req, res) => {
  const { question, options } = req.body;
  const formattedOptions = options.map(text => ({ text, votes: [] })); // ✅ votes là array, không phải số 0
  const poll = new Poll({ question, options: formattedOptions });
  await poll.save();
  res.redirect(`/polls/${poll._id}`);
};

const getAllPolls = (req, res) => {
  res.send('List of polls');
};

const vote = async (req, res) => {
  res.json({ success: true, message: 'Vote API is working' });
};

const unvote = async (req, res) => {
  res.json({ success: true, message: 'Unvote API is working' });
};

const renderAllPollsPage = async (req, res) => {
  try {
    const polls = await Poll.find().populate('creator', 'username');
    res.render('poll-list', { polls }); // EJS template `views/poll-list.ejs`
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const renderPollDetailPage = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('creator', 'username');
    if (!poll) return res.status(404).send('Poll not found');
    res.render('poll-detail', { poll }); // EJS file: views/poll-detail.ejs
  } catch (error) {
    res.status(500).send('Server Error');
  }
};


module.exports = {
  create,
  update,
  getPolls,
  getPollById,
  lockPoll,
  unlockPoll,
  renderCreatePollForm,
  handleCreatePoll,
  getAllPolls,
  vote,
  unvote,
  renderAllPollsPage,
  renderPollDetailPage,
};
