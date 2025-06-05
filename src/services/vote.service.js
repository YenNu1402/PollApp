import Poll from "../models/poll.model.js";
import User from "../models/user.model.js"; 
class VoteService {
  constructor() {
    this.poll = Poll;
    this.user = User;
  }

  async vote(pollId, optionId, userId) {
    try {
      const poll = await this.poll.findById(pollId);
      if (!poll) {
        throw new Error("Poll not found");
      }
      if (poll.isLocked) {
        throw new Error("Poll is locked, cannot vote");
      }

      const option = poll.options.id(optionId);
      if (!option) {
        throw new Error("Option not found in this poll");
      }

      // Kiểm tra nguời dùng đã vote hay chưa
      let userAlreadyVoted = false;
      poll.options.forEach(opt => {
          if (opt.votes.includes(userId)) {
              userAlreadyVoted = true;
          }
      });

      if (userAlreadyVoted) {
          throw new Error("User has already voted in this poll. Please unvote first to change your vote.");
      }

      // Thêm userId vào vote của option
      option.votes.push(userId);
      await poll.save();
      return { message: "Voted successfully", poll };
    } catch (err) {
      throw new Error("Error voting: " + err.message);
    }
  }

  async unvote(pollId, userId) {
    try {
      const poll = await this.poll.findById(pollId);
      if (!poll) {
        throw new Error("Poll not found");
      }
      if (poll.isLocked) {
        throw new Error("Poll is locked, cannot unvote");
      }

      let voteRemoved = false;
      // Lặp qua tất cả các lựa chọn và loại bỏ phiếu
      poll.options.forEach(opt => {
        const initialVotesLength = opt.votes.length;
        opt.votes = opt.votes.filter(voterId => voterId.toString() !== userId.toString());
        if (opt.votes.length < initialVotesLength) {
            voteRemoved = true;
        }
      });

      if (!voteRemoved) {
        throw new Error("User has not voted in this poll");
      }

      await poll.save();
      return { message: "Vote removed successfully", poll };
    } catch (err) {
      throw new Error("Error unvoting: " + err.message);
    }
  }
}

export default new VoteService();