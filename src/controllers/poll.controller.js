const Poll = require('../models/poll.model');

exports.create = async (req, res) => {
  const poll = new Poll({ ...req.body, creator: req.user.id });
  await poll.save();
  res.status(201).json({ success: true, data: poll });
};

exports.update = async (req, res) => {
  const updated = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: updated });
};

exports.getPolls = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const polls = await Poll.find()
    .populate('creator', 'username')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Poll.countDocuments();
  res.json({ success: true, message: 'Get all Poll successfully', data: { polls, total, page: Number(page), limit: Number(limit) } });
};

exports.getPollById = async (req, res) => {
  const poll = await Poll.findById(req.params.id).populate('creator', 'username');
  res.json({ success: true, message: 'Get Poll successfully', data: poll });
};

exports.lockPoll = async (req, res) => {
  const poll = await Poll.findByIdAndUpdate(req.params.id, { isLocked: true }, { new: true });
  res.json({ success: true, message: 'Poll locked', data: poll });
};

exports.renderCreatePollForm = (req, res) => {
  res.render('create-poll');
};

exports.handleCreatePoll = async (req, res) => {
  const { question, options } = req.body;
  const formattedOptions = options.map(text => ({ text, votes: 0 }));
  const poll = new Poll({ question, options: formattedOptions });
  await poll.save();
  res.redirect(`/polls/${poll._id}`);
};

exports.getAllPolls = (req, res) => {
  res.send('List of polls'); // Tạm thời, hoặc render EJS
};