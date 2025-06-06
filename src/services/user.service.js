import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { mailService } from "../config/sendMail.config.js";
import { RandomOTP, GetExpiredOtp } from "../utils/otpUtil.js";

class UserService {
  constructor() {
    this.user = User;
  }

  async register(username, email, password, role = 'user') {
    try {
      const existingUser = await this.user.findOne({ email });
      if (existingUser) {
        throw new Error("Email already registered");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new this.user({ username, email, password: hashedPassword, role });
      await newUser.save();
      return newUser;
    } catch (err) {
      throw new Error("Error registering user: " + err.message);
    }
  }

  async login(email, password) {
    try {
      const user = await this.user.findOne({ email });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

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

      return { accessToken, refreshToken, user: { id: user._id, username: user.username, email: user.email, role: user.role } };
    } catch (err) {
      throw new Error("Error logging in user: " + err.message);
    }
  }

  async refreshToken(oldRefreshToken) {
    try {
      if (!oldRefreshToken) {
        throw new Error("Refresh token required");
      }

      const payload = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

      const user = await this.user.findById(payload.id);
      if (!user || user.refreshToken !== oldRefreshToken) {
        throw new Error("Invalid refresh token");
      }

      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token: " + error.message);
    }
  }

  async forgotPassword(email) {
    try {
      const user = await this.user.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const otp = RandomOTP();
      const expiredOtp = GetExpiredOtp();

      user.otp = otp;
      user.expiredOtp = expiredOtp;
      await user.save();

      const mailOptions = {
        emailFrom: process.env.EMAIL_USER,
        emailTo: email,
        emailSubject: "Password Reset OTP",
        emailText: `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes. If you did not request this, please ignore this email.`,
      };

      const result = await mailService.sendMail(mailOptions);
      if (!result) {
        throw new Error("Error sending email");
      }
      return { message: "OTP sent successfully" };
    } catch (err) {
      throw new Error("Error processing forgot password: " + err.message);
    }
  }

  async resetPassword(otp, email, newPassword) {
    try {
      const user = await this.user.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.expiredOtp || user.expiredOtp < new Date()) {
        throw new Error("OTP expired or not set");
      }

      if (!user.otp || user.otp.toString().trim() !== otp.toString().trim()) {
        throw new Error("Invalid OTP");
      }

      const hashedPass = await bcrypt.hash(newPassword, 10);
      user.password = hashedPass;
      user.otp = null;
      user.expiredOtp = null;

      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      throw new Error("Error resetting password: " + err.message);
    }
  }

  async getMyProfile(userId) {
    try {
      const user = await this.user.findById(userId).select('-password -otp -expiredOtp');
      if (!user) {
        throw new Error("User profile not found");
      }
      return user;
    } catch (err) {
      throw new Error("Error getting user profile: " + err.message);
    }
  }

  async updateMyProfile(userId, updateData) {
    try {
      //Ngăn không cho update các trường bí mật
      const disallowedFields = ['password', 'role', '_id', 'otp', 'expiredOtp'];
      disallowedFields.forEach(field => delete updateData[field]);

      const updatedUser = await this.user.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password -otp -expiredOtp');
      if (!updatedUser) {
        throw new Error("User not found or update failed");
      }
      return updatedUser;
    } catch (err) {
      throw new Error("Error updating user profile: " + err.message);
    }
  }

  // Chức năng của admin
  async getAllUsers(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await this.user.find().select('-password -otp -expiredOtp').skip(skip).limit(Number(limit));
      const totalUsers = await this.user.countDocuments();
      return { users, totalUsers, page: Number(page), limit: Number(limit) };
    } catch (err) {
      throw new Error("Error getting all users: " + err.message);
    }
  }

  async getUserById(id) {
    try {
      const user = await this.user.findById(id).select('-password -otp -expiredOtp');
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (err) {
      throw new Error("Error getting user by ID: " + err.message);
    }
  }

  async createUser(username, email, password, role) {
    try {
      const existingUser = await this.user.findOne({ email });
      if (existingUser) {
        throw new Error("Email already registered");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new this.user({ username, email, password: hashedPassword, role });
      await newUser.save();
      return newUser;
    } catch (err) {
      throw new Error("Error creating user: " + err.message);
    }
  }

  async updateUserById(id, updateData) {
    try {
      // Admin update role nhưng không update được các dữ liệu khác như password, accesstoken, refreshToken, otp, expiredOtp
      const disallowedFields = ['password', '_id', 'refreshToken', 'otp', 'expiredOtp'];
      disallowedFields.forEach(field => delete updateData[field]);

      const updatedUser = await this.user.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password -refreshToken -otp -expiredOtp');
      if (!updatedUser) {
        throw new Error("User not found or update failed");
      }
      return updatedUser;
    } catch (err) {
      throw new Error("Error updating user by ID: " + err.message);
    }
  }

  async deleteUserById(id) {
    try {
      const deletedUser = await this.user.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new Error("User not found or delete failed");
      }
      return deletedUser;
    } catch (err) {
      throw new Error("Error deleting user by ID: " + err.message);
    }
  }
}

export default new UserService();