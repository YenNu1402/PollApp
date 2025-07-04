import jwt from 'jsonwebtoken';
import config from '../configs/mongoose.config.js';

// Middleware để xác thực JWT và phân quyền
/**
 * Middleware để xác thực JWT
 * Kiểm tra token trong header Authorization
 * Nếu hợp lệ, gán thông tin người dùng vào req.user
 * Nếu không hợp lệ, trả về lỗi 403 (Forbidden)
 */
export const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Invalid token',
      error: error.message 
    });
  }
};

// Dùng middleware này để kiểm tra quyền admin
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: Admins only' 
    });
  }
  next();
};

// Middleware để xử lý lỗi 404
// Nếu không tìm thấy route nào khớp với request
export const notFound = (req, res, next) => {
  // const error = new Error(`Không tìm thấy: ${req.originalUrl}`);
  // res.status(404);
  // next(error);
  res.status(404).json({
    success: false,
    message: `Không tìm thấy: ${req.originalUrl}`
  });
};

// Middleware để xử lý lỗi chung
// Trả về lỗi với status code 500 nếu không có lỗi cụ thể
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // Nếu là lỗi 404 thì không trả về stack
  if (statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Không tìm thấy'
    });
  }
  // Các lỗi khác
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware để phân quyền dựa trên vai trò
// Chỉ cho phép người dùng có vai trò cụ thể truy cập vào route
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Insufficient privileges' 
      });
    }
    next();
  };
};
