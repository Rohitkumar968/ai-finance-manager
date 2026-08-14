/**
 * One-off utility script to promote an existing user to the 'admin' role.
 * Usage: node src/scripts/setAdmin.js user@example.com
 */
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

const run = async () => {
  const email = process.argv[2];

  if (!email) {
    logger.error('Usage: node src/scripts/setAdmin.js <user-email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    logger.error(`No user found with email: ${email}`);
  } else {
    logger.info(`${user.email} is now an admin.`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Failed to set admin: ${err.message}`);
  process.exit(1);
});
