const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.JWT_SECRET || 'jan-resolve-dev-access-secret';
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'jan-resolve-dev-refresh-secret';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, accessTokenSecret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, refreshTokenSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshTokenSecret);
};

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        department: user.department,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sendTokenResponse,
};
