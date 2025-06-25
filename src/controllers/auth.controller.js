import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import config from '../configs/mongoose.config.js';
import ApiResponse from '../utils/apiResponse.js';
import crypto from 'crypto';

    //Tạo token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role 
    }, 
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

    //Đăng ký tài khoản
export const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Kiểm tra email đã tồn tại hay chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        ApiResponse.error('Email đã được sử dụng')
      );
    }

    // Tạo người dùng mới
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user', // Cho phép chỉ định role, mặc định là 'user'
      profile: { fullName }
    });

    // Tạo token 
    const token = generateToken(user);

    // Trả về thông tin user
    res.status(201).json(
      ApiResponse.success('Đăng ký thành công', {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token
      })
    );
  } catch (error) {
    next(error);
  }
};

    //Đăng nhập
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password
    if (!email || !password) {
      return res.status(400).json(
        ApiResponse.error('Vui lòng nhập email và mật khẩu')
      );
    }

    // Tìm user theo email và lấy cả password
    const user = await User.findOne({ email }).select('+password');
    
    // Kiểm tra user tồn tại và mật khẩu đúng
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json(
        ApiResponse.error('Email hoặc mật khẩu không đúng')
      );
    }

    // Tạo token
    const token = generateToken(user);

    // Trả về thông tin người dùng
    res.status(200).json(
      ApiResponse.success('Đăng nhập thành công', {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          stats: user.stats
        },
        token
      })
    );
  } catch (error) {
    next(error);
  }
};
//Lấy thông tin hiện tại của người dùng
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json(
      ApiResponse.success('Lấy thông tin thành công', {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          stats: user.stats,
          avatar: user.avatar
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin cá nhân
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, location, website } = req.body;
    const user = await User.findById(req.user.id);

    user.profile = {
      ...user.profile,
      fullName: fullName || user.profile.fullName,
      bio: bio || user.profile.bio,
      location: location || user.profile.location,
      website: website || user.profile.website
    };

    await user.save();

    res.status(200).json(
      ApiResponse.success('Cập nhật thông tin thành công', {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          stats: user.stats
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json(
        ApiResponse.error('Mật khẩu hiện tại không đúng')
      );
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(
      ApiResponse.success('Đổi mật khẩu thành công')
    );
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Tìm user với email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng với email này'
      });
    }

    // Tạo reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email reset password đã được gửi',
      resetToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Lấy token từ params và hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    // Tìm user với token và kiểm tra token còn hạn không
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Set mật khẩu mới
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Tạo JWT token mới
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: config.jwtExpire
    });

    res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}; 