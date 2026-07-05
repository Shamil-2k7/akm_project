const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  getAdminEnrollments,
  approveEnrollment,
  rejectEnrollment,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/enroll', protect, enrollInCourse);
router.get('/', protect, getMyEnrollments);
router.get('/admin', protect, authorize('admin'), getAdminEnrollments);
router.put('/:id/approve', protect, authorize('admin'), approveEnrollment);
router.put('/:id/reject', protect, authorize('admin'), rejectEnrollment);

module.exports = router;
