const mongoose = require('mongoose');
const PollOptionSchema = new mongoose.Schema({
  text: String,
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const PollSchema = new mongoose.Schema({
  title: String,
  description: String,
  options: [PollOptionSchema],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isLocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

module.exports = mongoose.model('Poll', PollSchema);