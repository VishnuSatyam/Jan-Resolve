const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('MongoDB URI not configured. Starting Jan Resolve API in local complaint storage mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB connection error: ${error.message}`);
    console.warn('Continuing in local complaint storage mode.');
    return false;
  }
};

module.exports = connectDB;
