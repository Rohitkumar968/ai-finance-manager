const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected.');
    });

    return conn;
  } catch (error) {
    console.error(
      '❌ MongoDB initial connection failed:',
      error.message
    );

    logger.error(
      `MongoDB initial connection failed: ${error.message}`
    );

    process.exit(1);
  }
};

module.exports = connectDB;