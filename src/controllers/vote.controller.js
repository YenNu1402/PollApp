exports.vote = async (req, res) => {
  const { optionId } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (poll.isLocked) return res.status(403).json({ success: false, message: 'Poll is locked' });
  const option = poll.options.id(optionId);
  if (!option) return res.status(404).json({ success: false, message: 'Option not found' });
  option.votes.push(req.user.id);
  await poll.save();
  res.json({ success: true, message: 'Voted successfully' });
};

exports.unvote = async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  poll.options.forEach(opt => {
    opt.votes = opt.votes.filter(uid => uid.toString() !== req.user.id);
  });
  await poll.save();
  res.json({ success: true, message: 'Vote removed' });
};