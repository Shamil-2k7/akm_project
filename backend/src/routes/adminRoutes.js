const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserStatus,
  getAnalytics,
  createStudent,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('admin'), getUsers);
router.post('/users', protect, authorize('admin'), createStudent);
router.put('/users/:id/status', protect, authorize('admin'), updateUserStatus);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
