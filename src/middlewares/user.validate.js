import ApiResponse from '../utils/apiResponse.js';

// Validate đăng ký tài khoản
export const validateRegister = (req, res, next) => {
  const { username, email, password, fullName, role } = req.body;

  // Validate username
  if (!username || username.trim().length === 0) {
    return res.status(400).json(
      ApiResponse.error('Username is required')
    );
  }
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json(
      ApiResponse.error('Username must be between 3 and 30 characters')
    );
  }

  // Validate email
  if (!email || email.trim().length === 0) {
    return res.status(400).json(
      ApiResponse.error('Email is required')
    );
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json(
      ApiResponse.error('Invalid email format')
    );
  }

  // Validate password
  if (!password || password.trim().length === 0) {
    return res.status(400).json(
      ApiResponse.error('Password is required')
    );
  }
  if (password.length < 6) {
    return res.status(400).json(
      ApiResponse.error('Password must be at least 6 characters')
    );
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json(
      ApiResponse.error('Password must contain at least one uppercase letter, one lowercase letter and one number')
    );
  }

  // Validate role nếu có
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json(
      ApiResponse.error('Role must be either "user" or "admin"')
    );
  }

  // Validate fullName (optional)
  if (fullName && (fullName.length < 2 || fullName.length > 50)) {
    return res.status(400).json(
      ApiResponse.error('Full name must be between 2 and 50 characters')
    );
  }

  next();
};

// Validate đăng nhập
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Validate email
  if (!email || email.trim().length === 0) {
    return res.status(400).json(
      ApiResponse.error('Email is required')
    );
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json(
      ApiResponse.error('Invalid email format')
    );
  }

  // Validate mật khẩu
  if (!password || password.trim().length === 0) {
    return res.status(400).json(
      ApiResponse.error('Password is required')
    );
  }

  next();
};

// Validate cập nhật profile
export const validateUpdateProfile = (req, res, next) => {
  const { username, fullName, bio, location, website } = req.body;

  // Validate username
  if (username) {
    if (username.trim().length === 0) {
      return res.status(400).json(
        ApiResponse.error('Username cannot be empty')
      );
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json(
        ApiResponse.error('Username must be between 3 and 30 characters')
      );
    }
  }

  // Validate fullName
  if (fullName && (fullName.length < 2 || fullName.length > 50)) {
    return res.status(400).json(
      ApiResponse.error('Full name must be between 2 and 50 characters')
    );
  }

  // Validate bio dùng để mô tả ngắn gọn về người dùng
  if (bio && bio.length > 160) {
    return res.status(400).json(
      ApiResponse.error('Bio cannot exceed 160 characters')
    );
  }

  // Validate location
  if (location && location.length > 100) {
    return res.status(400).json(
      ApiResponse.error('Location cannot exceed 100 characters')
    );
  }
 
  // Validate website dùng để liên kết đến trang cá nhân hoặc trang web của người dùng
  if (website) {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(website)) {
      return res.status(400).json(
        ApiResponse.error('Invalid website URL format')
      );
    }
  }

  next();
};

// Validate đổi mật khẩu
export const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Validate current password
  if (!currentPassword || currentPassword.trim().length === 0) {
    return res.status(400).json(
      ApiResponse.error('Current password is required')
    );
  }

  // Validate new password
  if (!newPassword || newPassword.trim().length === 0) {
    return res.status(400).json(
      ApiResponse.error('New password is required')
    );
  }
  if (newPassword.length < 6) {
    return res.status(400).json(
      ApiResponse.error('New password must be at least 6 characters')
    );
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json(
      ApiResponse.error('New password must contain at least one uppercase letter, one lowercase letter and one number')
    );
  }

  if (currentPassword === newPassword) {
    return res.status(400).json(
      ApiResponse.error('New password must be different from current password')
    );
  }

  next();
};