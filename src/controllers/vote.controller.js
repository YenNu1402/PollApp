import Poll from '../models/poll.model.js';

const vote = async (req, res) => {
  const { optionId } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

  if (poll.isLocked) {
    return res.status(403).json({ success: false, message: 'Poll is locked' });
  }

  const option = poll.options.id(optionId);
  if (!option) {
    return res.status(404).json({ success: false, message: 'Option not found' });
  }

  if (option.votes.includes(req.user.id)) {
    return res.status(400).json({ success: false, message: 'Already voted' });
  }

  option.votes.push(req.user.id);
  await poll.save();
  res.json({ success: true, message: 'Voted successfully' });
};

const unvote = async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

  poll.options.forEach(opt => {
    opt.votes = opt.votes.filter(uid => uid.toString() !== req.user.id);
  });

  await poll.save();
  res.json({ success: true, message: 'Vote removed' });
};

// ✅ Sử dụng export default để ES Module hoạt động đúng
export default {
  vote,
  unvote
};
