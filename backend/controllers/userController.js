const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { AppError, asyncHandler } = require('../utils/errorHandler');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, total, page: parseInt(page), users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin)
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({ success: true, user });
});

// @desc    Update user role / department (admin only)
// @route   PUT /api/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res, next) => {
  const { role, department, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));

  if (role) user.role = role;
  if (department !== undefined) user.department = department;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();
  res.status(200).json({ success: true, message: 'User updated.', user });
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));

  // Reassign complaints to unassigned
  await Complaint.updateMany({ submittedBy: user._id }, { $set: { status: 'Closed' } });
  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User deleted.' });
});

// @desc    Get citizen's own complaint summary
// @route   GET /api/users/me/summary
// @access  Private (citizen)
const getMySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [total, pending, inProgress, resolved, rejected] = await Promise.all([
    Complaint.countDocuments({ submittedBy: userId }),
    Complaint.countDocuments({ submittedBy: userId, status: 'Pending' }),
    Complaint.countDocuments({ submittedBy: userId, status: { $in: ['Under Review', 'In Progress'] } }),
    Complaint.countDocuments({ submittedBy: userId, status: 'Resolved' }),
    Complaint.countDocuments({ submittedBy: userId, status: 'Rejected' }),
  ]);

  const recentComplaints = await Complaint.find({ submittedBy: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title status category createdAt complaintId');

  res.status(200).json({
    success: true,
    summary: { total, pending, inProgress, resolved, rejected },
    recentComplaints,
  });
});

// @desc    Get all officials (for assignment dropdown)
// @route   GET /api/users/officials
// @access  Private (admin)
const getOfficials = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const filter = { role: 'official', isActive: true };
  if (department) filter.department = department;

  const officials = await User.find(filter).select('name email department');
  res.status(200).json({ success: true, officials });
});

module.exports = { getAllUsers, getUser, updateUser, deleteUser, getMySummary, getOfficials };
