import Poll from "../models/poll.model.js";
import User from "../models/user.model.js";

class PollService {
  constructor() {
    this.poll = Poll;
  }

  // Tạo một cuộc thăm dò mới
  async createPoll(title, description, options, creatorId, expiresAt) {
    try {
      // Kiểm tra format đúng hay không?
      const formattedOptions = options.map(opt => ({ text: opt.text, votes: [] }));
      const newPoll = new this.poll({
        title,
        description,
        options: formattedOptions,
        creator: creatorId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });
      await newPoll.save();
      return newPoll;
    } catch (err) {
      throw new Error("Error creating poll: " + err.message);
    }
  }

  // Cập nhật thông tin của một cuộc thăm dò
  async updatePoll(pollId, updateData, userId) {
    try {
      const poll = await this.poll.findById(pollId);
      if (!poll) {
        throw new Error("Poll not found");
      }
      // Chỉ người tạo hoặc admin mới được update poll
      if (poll.creator.toString() !== userId && req.user.role !== 'admin') {
          throw new Error("Unauthorized to update this poll");
      }

      // Cập nhật các trường có trong poll
      poll.title = updateData.title || poll.title;
      poll.description = updateData.description || poll.description;
      poll.expiresAt = updateData.expiresAt ? new Date(updateData.expiresAt) : poll.expiresAt;

      // Thêm/xóa
      if (updateData.options && Array.isArray(updateData.options)) {
        // Logic cập nhật options:
        // 1. Giữ lại các option cũ có ID và cập nhật text
        // 2. Thêm các option mới không có ID
        // 3. Xóa các option cũ không có trong danh sách mới (cần cẩn thận với vote count)
        const newOptionsMap = new Map(updateData.options.map(opt => [opt.id, opt]));
        const updatedPollOptions = [];

        // Cập nhật hoặc giữ lại các option đang có trong poll
        poll.options.forEach(existingOpt => {
            if (newOptionsMap.has(existingOpt._id.toString())) {
                const updatedOpt = newOptionsMap.get(existingOpt._id.toString());
                existingOpt.text = updatedOpt.text;
                updatedPollOptions.push(existingOpt);
                newOptionsMap.delete(existingOpt._id.toString()); // Đánh dấu xử lý
            }
            // Nếu không có trong newOptionsMap thì sẽ bị xoá khỏi poll
        });

        // Thêm các option mới
        newOptionsMap.forEach(newOpt => {
            if (!newOpt.id) { 
                updatedPollOptions.push({ text: newOpt.text, votes: [] });
            }
        });
        poll.options = updatedPollOptions;
      }
      // Chỉ cho admin khóa/mở khóa poll
      if (typeof updateData.isLocked === 'boolean' && req.user.role === 'admin') {
        poll.isLocked = updateData.isLocked;
      }

      await poll.save();
      return poll;
    } catch (err) {
      throw new Error("Error updating poll: " + err.message);
    }
  }


  // Xóa một cuộc thăm dò
  async deletePoll(pollId, userId, userRole) {
    try {
      const poll = await this.poll.findById(pollId);
      if (!poll) {
        throw new Error("Poll not found");
      }
      // Chỉ admin hoặc người tạo mới được xóa
      if (userRole !== 'admin' && poll.creator.toString() !== userId) {
        throw new Error("Unauthorized to delete this poll");
      }
      const deletedPoll = await this.poll.findByIdAndDelete(pollId);
      return deletedPoll;
    } catch (err) {
      throw new Error("Error deleting poll: " + err.message);
    }
  }


  // Lấy tất cả các cuộc thăm dò với phân trang
  async getAllPolls(page, limit) {
    try {
      const skip = (page - 1) * limit;
      const polls = await this.poll.find()
        .populate('creator', 'username')
        .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
        .skip(skip)
        .limit(Number(limit))
        .lean(); // Dùng .lean() để trả về plain JavaScript objects

      // Tính tổng phiếu bầu cho mỗi poll và thêm vào poll
      for (const poll of polls) {
        poll.totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
        // Xóa đi mảng votes chi tiết trong options nếu không cần ở GET ALL
        // poll.options.forEach(opt => delete opt.votes);
      }

      const total = await this.poll.countDocuments();
      return { polls, total, page: Number(page), limit: Number(limit) };
    } catch (err) {
      throw new Error("Error getting all polls: " + err.message);
    }
  }

  // Lấy thông tin chi tiết của một cuộc thăm dò theo ID
  async getPollById(pollId) {
    try {
      const poll = await this.poll.findById(pollId)
        .populate('creator', 'username')
        .populate({
          path: 'options.votes', // Populate thông tin người dùng đã vote
          select: 'username', // Chỉ lấy username của người vote
        })
        .lean(); // Dùng .lean() để chỉnh sửa object

      if (!poll) {
        throw new Error("Poll not found");
      }

      // Tính tổng vote
      poll.totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

      // Format để hiển thị ID và Name
      poll.options.forEach(option => {
        option.userVote = option.votes.map(user => ({ id: user._id, username: user.username }));
        // Xóa trường 'votes' gốc trong mảng votes
        delete option.votes;
      });

      return poll;
    } catch (err) {
      throw new Error("Error getting poll by ID: " + err.message);
    }
  }

  //Khoá hoặc mở khoá một cuộc thăm dò
  async lockUnlockPoll(pollId, isLocked, userRole) {
    try {
      if (userRole !== 'admin') {
        throw new Error("Access denied: Only admins can lock/unlock polls");
      }
      const updatedPoll = await this.poll.findByIdAndUpdate(
        pollId,
        { isLocked: isLocked },
        { new: true }
      );
      if (!updatedPoll) {
        throw new Error("Poll not found");
      }
      return updatedPoll;
    } catch (err) {
      throw new Error("Error locking/unlocking poll: " + err.message);
    }
  }

  // Thêm option mới vào một cuộc thăm dò
  async addOptionToPoll(pollId, newOptionText, userId, userRole) {
    try {
      const poll = await this.poll.findById(pollId);
      if (!poll) throw new Error("Poll not found");
      if (poll.creator.toString() !== userId && userRole !== 'admin') {
        throw new Error("Unauthorized to add options to this poll");
      }
      if (poll.isLocked) throw new Error("Cannot add options to a locked poll");

      poll.options.push({ text: newOptionText, votes: [] });
      await poll.save();
      return poll;
    } catch (err) {
      throw new Error("Error adding option: " + err.message);
    }
  }

  // Xóa option khỏi một cuộc thăm dò
  async removeOptionFromPoll(pollId, optionId, userId, userRole) {
    try {
      const poll = await this.poll.findById(pollId);
      if (!poll) throw new Error("Poll not found");
      if (poll.creator.toString() !== userId && userRole !== 'admin') {
        throw new Error("Unauthorized to remove options from this poll");
      }
      if (poll.isLocked) throw new Error("Cannot remove options from a locked poll");

      const initialOptionsCount = poll.options.length;
      poll.options = poll.options.filter(opt => opt._id.toString() !== optionId);

      if (poll.options.length === initialOptionsCount) {
        throw new Error("Option not found in this poll");
      }

      if (poll.options.length < 2) { // Đảm bảo luôn có ít nhất 2 lựa chọn
        throw new Error("A poll must have at least two options.");
      }

      await poll.save();
      return poll;
    } catch (err) {
      throw new Error("Error removing option: " + err.message);
    }
  }

}

export default new PollService();