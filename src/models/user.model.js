const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  refreshToken: { type: String },
});

module.exports = mongoose.model('User', userSchema);
