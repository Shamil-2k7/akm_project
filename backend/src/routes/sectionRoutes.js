const express = require('express');
const router = express.Router();
const {
  createSection,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createSection);
router.put('/:id', protect, authorize('admin'), updateSection);
router.delete('/:id', protect, authorize('admin'), deleteSection);

module.exports = router;
