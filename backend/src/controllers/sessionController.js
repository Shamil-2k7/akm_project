const Session = require('../models/Session');

// @desc    Get active sessions of logged-in user
// @route   GET /api/sessions/active
// @access  Private
const getActiveSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActivity: -1 });

    // Mark which session is the current device
    const formattedSessions = sessions.map((session) => {
      const sessObj = session.toObject();
      sessObj.isCurrentDevice = session.deviceId === req.deviceId;
      return sessObj;
    });

    res.json(formattedSessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Terminate a specific session by ID
// @route   DELETE /api/sessions/:id
// @access  Private
const terminateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }

    // Students can only terminate their own sessions
    if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to terminate this session');
    }

    await session.deleteOne();

    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Force logout all active sessions for a user (Admin only)
// @route   DELETE /api/sessions/force-logout/:userId
// @access  Private/Admin
const forceLogoutUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Delete all sessions for this user
    await Session.deleteMany({ userId });

    res.json({ message: `Successfully forced logout for user ${userId} across all devices` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveSessions,
  terminateSession,
  forceLogoutUser,
};
