const jwt = require('jsonwebtoken');

const generateAccessToken = (user, deviceId) => {
  return jwt.sign(
    { id: user._id, role: user.role, deviceId },
    process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret_12345!',
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user, deviceId) => {
  return jwt.sign(
    { id: user._id, deviceId },
    process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_67890!',
    { expiresIn: '7d' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
