import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Định nghĩa schema cho người dùng
const userSchema = new mongoose.Schema({
  // Tên đăng nhập 
  username: {
    type: String,
    required: [true, 'Vui lòng nhập tên đăng nhập'],
    trim: true,
    minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên đăng nhập không được vượt quá 30 ký tự']
  },

  // Email
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Email không hợp lệ'
    ]
  },

  // Mật khẩu được mã hoá
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },

  // Vai trò người dùng
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Ảnh đại diện
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },

  // Thông tin bổ sung
  profile: {
    fullName: String,
    bio: String,
    location: String,
    website: String
  },

  // Thống kê hoạt động
  stats: {
    pollsCreated: {
      type: Number,
      default: 0
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    pollsParticipated: {
      type: Number,
      default: 0
    }
  },

  // Thời gian tạo và cập nhật tự động
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware tự động mã hóa password trước khi lưu vào
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// So sánh password với password đã được mã hoá
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Lỗi khi so sánh mật khẩu');
  }
};

// Kiểm tra quyền admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Cập nhật thống kê khi tạo poll mới
userSchema.methods.incrementPollCount = async function() {
  this.stats.pollsCreated += 1;
  return this.save();
};

// Cập nhật thống kê khi vote
userSchema.methods.incrementVoteCount = async function() {
  this.stats.totalVotes += 1;
  if (this.stats.pollsParticipated === 0) {
    this.stats.pollsParticipated = 1;
  }
  return this.save();
};

// Cập nhật thống kê khi hủy vote
userSchema.methods.decrementVoteCount = async function() {
  this.stats.totalVotes = Math.max(0, this.stats.totalVotes - 1);
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User; 