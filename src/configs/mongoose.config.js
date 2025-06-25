// const mongoose = require('mongoose');
// mongoose.set('strictQuery', false);
// module.exports = mongoose;

import dotenv from 'dotenv';

// Load biến môi trường
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/poll-app',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '30d'
};

export default config; 