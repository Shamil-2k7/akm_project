const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret_12345!'
      );

      // Get user from the token (exclude password)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      // Check if user is active (not disabled)
      if (user.status === 'disabled') {
        return res.status(403).json({ message: 'Your account has been disabled' });
      }

      // Validate session in database (real-time logout/expiry check)
      const session = await Session.findOne({
        userId: user._id,
        deviceId: decoded.deviceId,
      });

      if (!session) {
        return res.status(401).json({ message: 'Session expired or logged out' });
      }

      // Throttle session lastActivity update to once per minute to avoid write bloat
      const now = new Date();
      if (now - new Date(session.lastActivity) > 60 * 1000) {
        session.lastActivity = now;
        await session.save();
      }

      req.user = user;
      req.deviceId = decoded.deviceId;
      req.sessionId = session._id;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret_12345!'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (user && user.status === 'active') {
        const session = await Session.findOne({
          userId: user._id,
          deviceId: decoded.deviceId,
        });

        if (session) {
          req.user = user;
          req.deviceId = decoded.deviceId;
          req.sessionId = session._id;
        }
      }
    } catch (error) {
      // Silently catch and proceed as guest
    }
  }
  next();
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };
