const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaintHistory,
  getComplaints,
  getComplaint,
  updateStatus,
  assignComplaint,
  addComment,
  toggleUpvote,
  deleteComplaint,
  getStats,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const {
  complaintValidator,
  submitComplaintValidator,
  complaintHistoryValidator,
  statusUpdateValidator,
  commentValidator,
} = require('../middleware/validators');
const upload = require('../middleware/upload');

router.get('/history', complaintHistoryValidator, getComplaintHistory);
router.post('/', upload.single('image'), submitComplaintValidator, createComplaint);

// All routes below require authentication
router.use(protect);

// Stats – admin and officials
router.get('/stats', authorize('admin', 'official'), getStats);

// CRUD
router.route('/')
  .get(getComplaints);

router.route('/:id')
  .get(getComplaint)
  .delete(deleteComplaint);

// Status update
router.put('/:id/status', authorize('admin', 'official'), statusUpdateValidator, updateStatus);

// Assign
router.put('/:id/assign', authorize('admin'), assignComplaint);

// Comments
router.post('/:id/comments', commentValidator, addComment);

// Upvote
router.post('/:id/upvote', authorize('citizen'), toggleUpvote);

module.exports = router;
