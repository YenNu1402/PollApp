import mongoose from 'mongoose';


// Dùng mongoose để tạo schema cho các option trong poll
const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
    minlength: [1, 'Option text cannot be empty']
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  voteCount: {
    type: Number,
    default: 0
  }
});

// Dùng mongoose để tạo schema cho poll
const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Poll title is required'],
    trim: true,
    minlength: [3, 'Poll title must be at least 3 characters long'],
    maxlength: [200, 'Poll title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  options: [optionSchema],
  isLocked: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  },
  totalVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Dùng middleware để tự động cập nhật tổng số phiếu bầu khi lưu poll
pollSchema.pre('save', function(next) {
  if (this.isModified('options')) {
    this.totalVotes = this.options.reduce((sum, option) => sum + option.voteCount, 0);
  }
  next();
});
// Phương thức để kiểm tra xem poll đã hết hạn hay chưa
pollSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};
// Phương thức để kiểm tra xem người dùng đã vote hay chưa
pollSchema.methods.hasUserVoted = function(userId) {
  return this.options.some(option => 
    option.votes.some(vote => vote.toString() === userId.toString())
  );
};

// Phương thức để thêm một lựa chọn mới vào poll
pollSchema.methods.addVote = async function(userId, optionId) {
  const option = this.options.id(optionId);
  if (!option) throw new Error('Option not found');
  
  if (this.hasUserVoted(userId)) {
    throw new Error('User has already voted');
  }
  
  option.votes.push(userId);
  option.voteCount += 1;
  await this.save();
  
  return this;
};

// Phương thức để xóa một phiếu bầu của người dùng
pollSchema.methods.removeVote = async function(userId, optionId) {
  const option = this.options.id(optionId);
  if (!option) throw new Error('Option not found');
  
  const voteIndex = option.votes.findIndex(vote => 
    vote.toString() === userId.toString()
  );
  
  if (voteIndex === -1) {
    throw new Error('Vote not found');
  }
  
  option.votes.splice(voteIndex, 1);// Xóa phiếu bầu của người dùng
  option.voteCount -= 1;
  await this.save();
  
  return this;
};

const Poll = mongoose.model('Poll', pollSchema);

export default Poll; 