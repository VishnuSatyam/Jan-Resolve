const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getMySummary,
  getOfficials,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Citizen's own summary
router.get('/me/summary', getMySummary);

// List officials (for admin assignment dropdown)
router.get('/officials', authorize('admin'), getOfficials);

// Admin-only routes
router.route('/')
  .get(authorize('admin'), getAllUsers);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
