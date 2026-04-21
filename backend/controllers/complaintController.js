const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const { createNotification, notifyStatusUpdate } = require('../utils/notifications');
const { createLocalComplaint, getLocalComplaintHistory } = require('../utils/localComplaintStore');

const departmentByCategory = {
  'Water Supply': 'Water Supply',
  Electricity: 'Electricity',
  'Road Safety': 'Roads & Infrastructure',
  'Waste Management': 'Sanitation',
  Healthcare: 'Public Health',
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildHistoryFilter = ({ email, name }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedName = name?.trim();
  const orConditions = [];

  if (normalizedEmail) {
    orConditions.push({ contactEmail: normalizedEmail });
  }

  if (normalizedName) {
    const exactNamePattern = new RegExp(`^${escapeRegExp(normalizedName)}$`, 'i');

    orConditions.push({
      $and: [
        {
          $or: [
            { contactEmail: { $exists: false } },
            { contactEmail: '' },
            { contactEmail: null },
          ],
        },
        { contactName: exactNamePattern },
      ],
    });
  }

  return orConditions.length > 0 ? { $or: orConditions } : null;
};

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Public
const createComplaint = asyncHandler(async (req, res) => {
  const { name, email, phone, location, category, description } = req.body;
  const normalizedLocation = location.trim();
  const imageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : '';
  const isMongoConnected = mongoose.connection.readyState === 1;

  const complaint = isMongoConnected
    ? await Complaint.create({
        title: `${category} issue at ${normalizedLocation}`.slice(0, 100),
        description,
        category,
        priority: 'Medium',
        status: 'Submitted',
        location: {
          address: normalizedLocation,
        },
        publicLocation: normalizedLocation,
        contactName: name.trim(),
        contactPhone: phone.trim(),
        contactEmail: email?.trim().toLowerCase() || '',
        submittedBy: req.user?._id,
        assignedDepartment: departmentByCategory[category] || 'General',
        attachments: imageUrl
          ? [
              {
                filename: req.file.filename,
                url: imageUrl,
                mimetype: req.file.mimetype,
                size: req.file.size,
              },
            ]
          : [],
        statusHistory: [
          {
            status: 'Submitted',
            comment: 'Complaint submitted successfully.',
            updatedBy: req.user?._id,
            updatedAt: new Date(),
          },
        ],
      })
    : createLocalComplaint({
        name,
        email,
        phone,
        location,
        category,
        description,
        file: req.file,
      });

  res.status(201).json({
    success: true,
    complaintId: complaint.complaintId,
    storageMode: isMongoConnected ? 'mongodb' : 'local',
  });
});

// @desc    Get complaint history for the current frontend user
// @route   GET /api/complaints/history
// @access  Public
const getComplaintHistory = asyncHandler(async (req, res) => {
  const { email, name } = req.query;
  const isMongoConnected = mongoose.connection.readyState === 1;

  const complaints = isMongoConnected
    ? await Complaint.find(buildHistoryFilter({ email, name }) || { _id: null })
        .sort({ createdAt: -1 })
        .lean()
    : getLocalComplaintHistory({ email, name });

  res.status(200).json({
    success: true,
    complaints,
  });
});

// @desc    Get all complaints (admin/official: all; citizen: own)
// @route   GET /api/complaints
// @access  Private
const getComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;

  const filter = {};

  // Citizens only see their own complaints
  if (req.user.role === 'citizen') {
    filter.submittedBy = req.user._id;
  }

  // Officials only see complaints for their department
  if (req.user.role === 'official') {
    filter.assignedDepartment = req.user.department;
  }

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { complaintId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email department')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    Complaint.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    complaints,
  });
});

// @desc    Get single complaint by ID or complaintId
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const query = id.startsWith('GOV-')
    ? { complaintId: id }
    : { _id: id };

  const complaint = await Complaint.findOne(query)
    .populate('submittedBy', 'name email phone')
    .populate('assignedTo', 'name email department')
    .populate('comments.user', 'name role')
    .populate('statusHistory.updatedBy', 'name role');

  if (!complaint) {
    return next(new AppError('Complaint not found.', 404));
  }

  // Citizens can only see their own complaints
  if (
    req.user.role === 'citizen' &&
    (!complaint.submittedBy || complaint.submittedBy._id.toString() !== req.user._id.toString())
  ) {
    return next(new AppError('Not authorized to view this complaint.', 403));
  }

  res.status(200).json({ success: true, complaint });
});

// @desc    Update complaint status (admin/official only)
// @route   PUT /api/complaints/:id/status
// @access  Private (admin, official)
const updateStatus = asyncHandler(async (req, res, next) => {
  const { status, comment } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError('Complaint not found.', 404));

  // Officials can only update complaints in their department
  if (req.user.role === 'official' && complaint.assignedDepartment !== req.user.department) {
    return next(new AppError('Not authorized to update this complaint.', 403));
  }

  complaint.status = status;
  if (status === 'Resolved') complaint.resolvedAt = new Date();

  complaint.statusHistory.push({
    status,
    comment: comment || `Status updated to ${status}`,
    updatedBy: req.user._id,
    updatedAt: new Date(),
  });

  await complaint.save();

  // Notify the complaint submitter
  await notifyStatusUpdate(complaint, req.user._id);

  await complaint.populate('submittedBy', 'name email');
  await complaint.populate('assignedTo', 'name email department');

  res.status(200).json({
    success: true,
    message: 'Status updated successfully.',
    complaint,
  });
});

// @desc    Assign complaint to an official
// @route   PUT /api/complaints/:id/assign
// @access  Private (admin only)
const assignComplaint = asyncHandler(async (req, res, next) => {
  const { officialId, department } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError('Complaint not found.', 404));

  complaint.assignedTo = officialId || null;
  if (department) complaint.assignedDepartment = department;

  if (complaint.status === 'Pending') {
    complaint.status = 'Under Review';
    complaint.statusHistory.push({
      status: 'Under Review',
      comment: 'Complaint assigned and under review.',
      updatedBy: req.user._id,
      updatedAt: new Date(),
    });
  }

  await complaint.save();

  // Notify the submitter
  if (complaint.submittedBy) {
    await createNotification({
      recipient: complaint.submittedBy,
      type: 'complaint_assigned',
      title: 'Complaint Assigned',
      message: `Your complaint "${complaint.title}" has been assigned to the ${complaint.assignedDepartment} department.`,
      complaint: complaint._id,
    });
  }

  await complaint.populate('submittedBy', 'name email');
  await complaint.populate('assignedTo', 'name email department');

  res.status(200).json({ success: true, message: 'Complaint assigned.', complaint });
});

// @desc    Add a comment to a complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError('Complaint not found.', 404));

  // Citizens can only comment on their own complaints
  if (
    req.user.role === 'citizen' &&
    (!complaint.submittedBy || complaint.submittedBy.toString() !== req.user._id.toString())
  ) {
    return next(new AppError('Not authorized to comment on this complaint.', 403));
  }

  complaint.comments.push({
    user: req.user._id,
    text,
    isOfficial: ['admin', 'official'].includes(req.user.role),
  });

  await complaint.save();

  // Notify complaint owner
  if (complaint.submittedBy && complaint.submittedBy.toString() !== req.user._id.toString()) {
    await createNotification({
      recipient: complaint.submittedBy,
      type: 'comment_added',
      title: 'New Comment on Your Complaint',
      message: `An update has been posted on your complaint "${complaint.title}".`,
      complaint: complaint._id,
    });
  }

  await complaint.populate('comments.user', 'name role');

  res.status(201).json({
    success: true,
    message: 'Comment added.',
    comments: complaint.comments,
  });
});

// @desc    Upvote / un-upvote a complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private (citizen)
const toggleUpvote = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError('Complaint not found.', 404));

  const userId = req.user._id.toString();
  const alreadyUpvoted = complaint.upvotes.map((u) => u.toString()).includes(userId);

  if (alreadyUpvoted) {
    complaint.upvotes = complaint.upvotes.filter((u) => u.toString() !== userId);
  } else {
    complaint.upvotes.push(req.user._id);
  }

  await complaint.save();

  res.status(200).json({
    success: true,
    upvoted: !alreadyUpvoted,
    upvoteCount: complaint.upvotes.length,
  });
});

// @desc    Delete a complaint (own + admin)
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError('Complaint not found.', 404));

  const isOwner = complaint.submittedBy?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this complaint.', 403));
  }

  // Citizens can only delete complaints before processing starts.
  if (req.user.role === 'citizen' && !['Submitted', 'Pending'].includes(complaint.status)) {
    return next(new AppError('Cannot delete a complaint that is already being processed.', 400));
  }

  await complaint.deleteOne();
  res.status(200).json({ success: true, message: 'Complaint deleted successfully.' });
});

// @desc    Get dashboard stats
// @route   GET /api/complaints/stats
// @access  Private (admin/official)
const getStats = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'official') {
    filter.assignedDepartment = req.user.department;
  }

  const [statusStats, categoryStats, priorityStats, totalComplaints, resolvedThisMonth] =
    await Promise.all([
      Complaint.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Complaint.countDocuments(filter),
      Complaint.countDocuments({
        ...filter,
        status: 'Resolved',
        resolvedAt: { $gte: new Date(new Date().setDate(1)) },
      }),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      total: totalComplaints,
      resolvedThisMonth,
      byStatus: statusStats,
      byCategory: categoryStats,
      byPriority: priorityStats,
    },
  });
});

module.exports = {
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
};
