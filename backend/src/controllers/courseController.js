const Course = require('../models/Course');
const Section = require('../models/Section');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public (filtered by role if auth is passed)
const getCourses = async (req, res, next) => {
  try {
    let query = { isPublished: true };

    // If request contains admin context, let them see draft courses too
    if (req.user && req.user.role === 'admin') {
      query = {};
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course with sections & lessons (obfuscates video URLs if not enrolled)
// @route   GET /api/courses/:id
// @access  Private/Public (depending on login, but protect can be optional or handled)
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Find sections
    const sections = await Section.find({ courseId: course._id }).sort({ order: 1 });

    // Find lessons
    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });

    // Determine if student is enrolled or is admin
    let isEnrolled = false;
    let enrollment = null;

    if (req.user) {
      if (req.user.role === 'admin') {
        isEnrolled = true;
      } else {
        enrollment = await Enrollment.findOne({
          studentId: req.user._id,
          courseId: course._id,
        });
        if (enrollment && enrollment.status === 'approved') {
          isEnrolled = true;
        }
      }
    }

    // Assemble structure and strip videoUrl if NOT enrolled/admin
    const assembledSections = sections.map((sec) => {
      const secLessons = lessons
        .filter((les) => les.sectionId.toString() === sec._id.toString())
        .map((les) => {
          const lessonObj = les.toObject();
          if (!isEnrolled) {
            // Remove direct videoUrl text to protect the source
            delete lessonObj.videoUrl;
            lessonObj.isLocked = true;
          } else {
            lessonObj.isLocked = false;
            // Mark if completed
            if (enrollment && enrollment.completedLessons) {
              lessonObj.isCompleted = enrollment.completedLessons.includes(les._id);
            }
          }
          return lessonObj;
        });

      return {
        ...sec.toObject(),
        lessons: secLessons,
      };
    });

    res.json({
      course,
      sections: assembledSections,
      enrollment: enrollment
        ? {
            status: enrollment.status,
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons,
          }
        : null,
      isEnrolled,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res, next) => {
  try {
    const { title, description, thumbnail, isPublished } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error('Please add a title and description');
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      isPublished: isPublished || false,
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res, next) => {
  try {
    const { title, description, thumbnail, isPublished } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.thumbnail = thumbnail !== undefined ? thumbnail : course.thumbnail;
    course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course (Cascading delete sections & lessons)
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Cascade delete sections, lessons, and enrollments
    await Section.deleteMany({ courseId: course._id });
    await Lesson.deleteMany({ courseId: course._id });
    await Enrollment.deleteMany({ courseId: course._id });

    await course.deleteOne();

    res.json({ message: 'Course and all related sections/lessons/enrollments deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
