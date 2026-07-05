const express = require('express');
const router = express.Router();
const {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  toggleLessonProgress,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createLesson);

router
  .route('/:id')
  .get(protect, getLessonById)
  .put(protect, authorize('admin'), updateLesson)
  .delete(protect, authorize('admin'), deleteLesson);

router.post('/:id/progress', protect, toggleLessonProgress);

module.exports = router;
