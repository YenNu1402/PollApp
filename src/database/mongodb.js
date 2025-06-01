const mongoose = require('../configs/mongoose.config');
const { uri } = require('../configs/mongodb.config');
module.exports.connect = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};