const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Atlas using Mongoose.
 * Exits process on failure so process managers (PM2 / Render) can restart cleanly.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 no longer needs useNewUrlParser/useUnifiedTopology, kept out intentionally.
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect is handled by the driver.');
    });
  // } catch (error) {
  //   logger.error(`MongoDB initial connection failed: ${error.message}`);
  //   process.exit(1);
  // }
} catch (error) {
  console.error(error);
  process.exit(1);
}
};

module.exports = connectDB;
