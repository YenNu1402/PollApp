import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const newUser = new User({
  username: 'nam123',
  email: 'nam@example.com',
  password: 'matkhau123' // sẽ được hash nếu dùng middleware `.pre('save')`
});

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra tồn tại
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();
    res.status(201).json({ success: true, message: 'User registered' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    const isPasswordValid = user && await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ success: true, token: accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// Làm mới token
const refreshToken = async (req, res) => {
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

// Đăng xuất
const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: "" } });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

// Lấy thông tin user từ token đã xác thực
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cập nhật thông tin user
const updateProfile = async (req, res) => {
  try {
    const disallowedFields = ['password', 'role', '_id', 'refreshToken'];
    disallowedFields.forEach(field => delete req.body[field]);

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Lấy danh sách tất cả user (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
};

// Admin cập nhật thông tin user theo id
const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password -refreshToken');
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

await newUser.save();

// Xuất tất cả các hàm
export {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserByAdmin
};