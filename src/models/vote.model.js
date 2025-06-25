const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    poll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
        required: true
    },
    option: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Option',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Tạo chỉ mục duy nhất cho user và poll để tránh việc người dùng bỏ phiếu nhiều lần cho cùng một cuộc thăm dò
voteSchema.index({ user: 1, poll: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
