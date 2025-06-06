import Poll from '../models/poll.model.js';

//Vote controller để xử lý các yêu cầu liên quan đến việc bình chọn trong các cuộc thăm dò ý kiến
const vote = async (req, res) => {
  const { optionId } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

  if (poll.isLocked) {
    return res.status(403).json({ success: false, message: 'Poll is locked' });
  }
// Kiểm tra xem người dùng đã bình chọn hay chưa
  const option = poll.options.id(optionId);
  if (!option) {
    return res.status(404).json({ success: false, message: 'Option not found' });
  }

  if (option.votes.includes(req.user.id)) {
    return res.status(400).json({ success: false, message: 'Already voted' });
  }
// Kiểm tra xem người dùng đã bình chọn trong cuộc thăm dò này hay chưa
  option.votes.push(req.user.id);
  await poll.save();
  res.json({ success: true, message: 'Voted successfully' });
};
// Xoá bình chọn của người dùng
const unvote = async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });
  poll.options.forEach(opt => { // Lặp qua từng option trong poll
    opt.votes = opt.votes.filter(uid => uid.toString() !== req.user.id);
  });

  await poll.save();
  res.json({ success: true, message: 'Vote removed' });
};

export default {
  vote,
  unvote
};
