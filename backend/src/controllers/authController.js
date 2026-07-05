const User = require('../models/User');
const Session = require('../models/Session');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    // Check if user already exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Auto-detect role: if phone is "9999999999", make them admin
    const role = phone === '9999999999' ? 'admin' : 'student';

    const user = await User.create({
      name,
      phone,
      password,
      role,
      status: 'active',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user, start session, enforce device limits
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { phone, password, deviceId } = req.body;

    if (!phone || !password || !deviceId) {
      res.status(400);
      throw new Error('Please provide phone, password, and a device ID');
    }

    // Find user (explicitly request password field)
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid phone or password');
    }

    if (user.status === 'disabled') {
      res.status(403);
      throw new Error('Your account has been disabled. Please contact administrator.');
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid phone or password');
    }

    // Enforce 2-device login limit for students
    if (user.role === 'student') {
      // Find all active, non-expired sessions for this student
      const activeSessions = await Session.find({
        userId: user._id,
        expiresAt: { $gt: new Date() },
      });

      // Check if there is already an existing session for THIS device
      const existingSessionForDevice = activeSessions.find(
        (s) => s.deviceId === deviceId
      );

      // If no session exists for this device, and user already has 2 active sessions on other devices
      if (!existingSessionForDevice && activeSessions.length >= 2) {
        res.status(403);
        throw new Error(
          'Maximum active device limit reached (2 devices). Please log out from another device or contact admin.'
        );
      }
    }

    // Gather browser and IP metadata
    const browser = req.useragent
      ? `${req.useragent.browser} (${req.useragent.os})`
      : 'Unknown Browser';
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Create session in database
    const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    const expiresAt = new Date(Date.now() + sessionDuration);

    // Upsert session (update if device already registered, otherwise create new)
    await Session.findOneAndUpdate(
      { userId: user._id, deviceId },
      {
        browser,
        ip,
        loginTime: new Date(),
        lastActivity: new Date(),
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // Generate tokens
    const accessToken = generateAccessToken(user, deviceId);
    const refreshToken = generateRefreshToken(user, deviceId);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: sessionDuration,
    });

    res.json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token not found');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_67890!'
      );
    } catch (err) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    // Verify session still exists in DB
    const session = await Session.findOne({
      userId: decoded.id,
      deviceId: decoded.deviceId,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      res.status(401);
      throw new Error('Session has expired or been terminated');
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || user.status === 'disabled') {
      res.status(403);
      throw new Error('User is disabled or no longer exists');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user, decoded.deviceId);

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user, clear cookie, remove session from DB
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    // Delete session from DB
    await Session.findOneAndDelete({
      userId: req.user._id,
      deviceId: req.deviceId,
    });

    // Clear cookie
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
};
