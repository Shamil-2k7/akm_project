const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/enrollments/enroll
// @access  Private/Student
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      res.status(400);
      throw new Error('Please provide a course ID');
    }

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (!course.isPublished && req.user.role !== 'admin') {
      res.status(400);
      throw new Error('Cannot enroll in an unpublished course');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'approved') {
        return res.status(200).json({
          message: 'Already enrolled in this course',
          enrollment: existingEnrollment,
        });
      } else if (existingEnrollment.status === 'pending') {
        return res.status(200).json({
          message: 'Enrollment request is already pending approval',
          enrollment: existingEnrollment,
        });
      } else {
        // rejected, allow re-request
        existingEnrollment.status = 'pending';
        existingEnrollment.lastActivity = new Date();
        await existingEnrollment.save();
        return res.status(200).json({
          message: 'Enrollment request re-submitted successfully',
          enrollment: existingEnrollment,
        });
      }
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId,
      progress: 0,
      completedLessons: [],
      status: 'pending',
    });

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student enrolled courses
// @route   GET /api/enrollments
// @access  Private/Student
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate('courseId')
      .populate('lastWatchedLessonId')
      .sort({ lastActivity: -1 });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments (Admin only)
// @route   GET /api/enrollments/admin
// @access  Private/Admin
const getAdminEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('studentId', 'name phone status')
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a student enrollment
// @route   PUT /api/enrollments/:id/approve
// @access  Private/Admin
const approveEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    enrollment.status = 'approved';
    enrollment.lastActivity = new Date();
    await enrollment.save();

    res.json({
      message: 'Enrollment approved successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a student enrollment
// @route   PUT /api/enrollments/:id/reject
// @access  Private/Admin
const rejectEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    enrollment.status = 'rejected';
    enrollment.lastActivity = new Date();
    await enrollment.save();

    res.json({
      message: 'Enrollment rejected successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getAdminEnrollments,
  approveEnrollment,
  rejectEnrollment,
};
