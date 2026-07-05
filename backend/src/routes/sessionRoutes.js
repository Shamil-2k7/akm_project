const express = require('express');
const router = express.Router();
const {
  getActiveSessions,
  terminateSession,
  forceLogoutUser,
} = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/active', protect, getActiveSessions);
router.delete('/:id', protect, terminateSession);
router.delete('/force-logout/:userId', protect, authorize('admin'), forceLogoutUser);

module.exports = router;
