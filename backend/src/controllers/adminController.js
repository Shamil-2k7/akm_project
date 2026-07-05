const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Session = require('../models/Session');

// @desc    Get all users with search/filter, augmented with active session & enrollment counts
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;

    const query = {};

    // Search filter (name or phone)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    // Augment users with session and enrollment counts
    const augmentedUsers = await Promise.all(
      users.map(async (user) => {
        const sessionCount = await Session.countDocuments({
          userId: user._id,
          expiresAt: { $gt: new Date() },
        });

        const enrollmentCount = await Enrollment.countDocuments({
          studentId: user._id,
        });

        const userObj = user.toObject();
        userObj.activeSessions = sessionCount;
        userObj.enrollmentsCount = enrollmentCount;
        return userObj;
      })
    );

    res.json(augmentedUsers);
  } catch (error) {
    next(error);
  }
};

// @desc    Enable/Disable a student account (boots active sessions if disabled)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Must be active or disabled');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent admin disabling themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot disable your own admin account');
    }

    user.status = status;
    await user.save();

    // If disabled, delete all active sessions immediately
    if (status === 'disabled') {
      await Session.deleteMany({ userId: user._id });
    }

    res.json({
      message: `User account is now ${status}`,
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

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const activeSessions = await Session.countDocuments({
      expiresAt: { $gt: new Date() },
    });

    // Course distribution (enrollments per course)
    const courses = await Course.find();
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const enrollCount = await Enrollment.countDocuments({ courseId: course._id });
        return {
          courseId: course._id,
          title: course.title,
          enrollments: enrollCount,
        };
      })
    );

    // Sort to get popular courses
    const popularCourses = [...courseStats]
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Recent activities (recent enrollments)
    const recentEnrollments = await Enrollment.find()
      .populate('studentId', 'name phone')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent logins
    const recentSessions = await Session.find()
      .populate('userId', 'name phone role')
      .sort({ loginTime: -1 })
      .limit(5);

    res.json({
      summary: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        activeSessions,
      },
      popularCourses,
      recentEnrollments,
      recentSessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student account and optionally enroll them in courses
// @route   POST /api/admin/users
// @access  Private/Admin
const createStudent = async (req, res, next) => {
  try {
    res.status(403);
    throw new Error('Direct student creation is disabled by settings.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  getAnalytics,
  createStudent,
};
