import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/poll_app');

    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
    mongoose.connection.on('connected', () => {
      console.log('Mongoose đã kết nối thành công');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Lỗi kết nối Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose đã ngắt kết nối');
    });

  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 