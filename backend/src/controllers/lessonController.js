const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const Enrollment = require('../models/Enrollment');
const { getEmbedUrl } = require('../utils/youtube');

// @desc    Get single lesson details (restricted to enrolled students or admins)
// @route   GET /api/lessons/:id
// @access  Private
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    // Check enrollment if user is a student
    let isEnrolled = false;
    let enrollment = null;

    if (req.user.role === 'admin') {
      isEnrolled = true;
    } else {
      enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: lesson.courseId,
      });

      if (enrollment && enrollment.status === 'approved') {
        isEnrolled = true;
      }
    }

    if (!isEnrolled) {
      res.status(403);
      throw new Error('Access denied. You must be enrolled in the course to watch this lesson.');
    }

    // Update last watched lesson for student
    if (enrollment) {
      enrollment.lastWatchedLessonId = lesson._id;
      enrollment.lastActivity = new Date();
      await enrollment.save();
    }

    res.json(lesson);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a lesson
// @route   POST /api/lessons
// @access  Private/Admin
const createLesson = async (req, res, next) => {
  try {
    const { sectionId, courseId, title, description, videoUrl, order } = req.body;

    if (!sectionId || !courseId || !title || !videoUrl) {
      res.status(400);
      throw new Error('Please fill in all required fields (sectionId, courseId, title, videoUrl)');
    }

    // Check if section exists and belongs to the course
    const section = await Section.findById(sectionId);
    if (!section || section.courseId.toString() !== courseId) {
      res.status(400);
      throw new Error('Invalid section or section does not belong to the course');
    }

    // Convert raw video URL to YouTube embed URL
    const embedVideoUrl = getEmbedUrl(videoUrl);

    const lesson = await Lesson.create({
      sectionId,
      courseId,
      title,
      description,
      videoUrl: embedVideoUrl,
      order: order !== undefined ? order : 0,
    });

    res.status(201).json(lesson);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private/Admin
const updateLesson = async (req, res, next) => {
  try {
    const { sectionId, title, description, videoUrl, order } = req.body;

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    if (sectionId) {
      const section = await Section.findById(sectionId);
      if (!section || section.courseId.toString() !== lesson.courseId.toString()) {
        res.status(400);
        throw new Error('Invalid section or section does not belong to the same course');
      }
      lesson.sectionId = sectionId;
    }

    lesson.title = title || lesson.title;
    lesson.description = description !== undefined ? description : lesson.description;
    lesson.order = order !== undefined ? order : lesson.order;

    if (videoUrl) {
      lesson.videoUrl = getEmbedUrl(videoUrl);
    }

    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    // Pull lesson from all student enrollments completed lessons array
    await Enrollment.updateMany(
      { courseId: lesson.courseId },
      { $pull: { completedLessons: lesson._id } }
    );

    // Re-calculate progress for all student enrollments in this course
    const totalLessons = await Lesson.countDocuments({
      courseId: lesson.courseId,
      _id: { $ne: lesson._id },
    });

    const enrollments = await Enrollment.find({ courseId: lesson.courseId });
    for (const enroll of enrollments) {
      const completedCount = enroll.completedLessons.filter(
        (id) => id.toString() !== lesson._id.toString()
      ).length;
      enroll.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      await enroll.save();
    }

    await lesson.deleteOne();

    res.json({ message: 'Lesson deleted successfully and student progress updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle progress (completed/incomplete) for a lesson
// @route   POST /api/lessons/:id/progress
// @access  Private/Student
const toggleLessonProgress = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: lesson.courseId,
    });

    if (!enrollment) {
      res.status(403);
      throw new Error('You are not enrolled in this course');
    }

    const lessonIndex = enrollment.completedLessons.indexOf(lesson._id);
    if (lessonIndex > -1) {
      // Remove from completed
      enrollment.completedLessons.splice(lessonIndex, 1);
    } else {
      // Add to completed
      enrollment.completedLessons.push(lesson._id);
    }

    // Recalculate progress
    const totalLessonsCount = await Lesson.countDocuments({ courseId: lesson.courseId });
    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
    enrollment.lastActivity = new Date();

    await enrollment.save();

    res.json({
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  toggleLessonProgress,
};
