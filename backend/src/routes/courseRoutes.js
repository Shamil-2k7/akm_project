const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(optionalProtect, getCourses)
  .post(protect, authorize('admin'), createCourse);

router
  .route('/:id')
  .get(optionalProtect, getCourseById)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;
