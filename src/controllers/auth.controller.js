const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

exports.register = async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ username, email, password: hashed, role });
  await user.save();

  res.status(201).json({ success: true, message: `${role} registered` });
};


//Đăng nhập & tạo refreshToken + accessToken
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  const isPasswordValid = user && await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  //Lưu refreshToken vào DB
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ success: true, token: accessToken, refreshToken });
};

// Làm mới access token từ refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ success: false, message: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ success: true, token: newAccessToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// Logout (xóa refreshToken khỏi DB)
exports.logout = async (req, res) => {
  const { id } = req.user; // middleware decode token sẽ gắn req.user

  await User.findByIdAndUpdate(id, { $unset: { refreshToken: "" } });

  res.json({ success: true, message: "Logged out successfully" });
};