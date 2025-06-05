import mongoose from 'mongoose';

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

// Pre-save middleware to update totalVotes
pollSchema.pre('save', function(next) {
  if (this.isModified('options')) {
    this.totalVotes = this.options.reduce((sum, option) => sum + option.voteCount, 0);
  }
  next();
});

// Method to check if poll is expired
pollSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Method to check if user has voted
pollSchema.methods.hasUserVoted = function(userId) {
  return this.options.some(option => 
    option.votes.some(vote => vote.toString() === userId.toString())
  );
};

// Method to add vote
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

// Method to remove vote
pollSchema.methods.removeVote = async function(userId, optionId) {
  const option = this.options.id(optionId);
  if (!option) throw new Error('Option not found');
  
  const voteIndex = option.votes.findIndex(vote => 
    vote.toString() === userId.toString()
  );
  
  if (voteIndex === -1) {
    throw new Error('Vote not found');
  }
  
  option.votes.splice(voteIndex, 1);
  option.voteCount -= 1;
  await this.save();
  
  return this;
};

const Poll = mongoose.model('Poll', pollSchema);

export default Poll; 