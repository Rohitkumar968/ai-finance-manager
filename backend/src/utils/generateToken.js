const jwt = require('jsonwebtoken');

/**
 * Signs a JWT containing the user id.
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Signs a token, sets it as an httpOnly cookie, and sends the auth response.
 * Also strips the password field before sending the user object back.
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieExpiresDays = parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS || '7', 10);
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.twoFactorSecret;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

module.exports = { signToken, createSendToken };
