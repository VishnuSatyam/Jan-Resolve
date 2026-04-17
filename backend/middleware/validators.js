const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

// Run validations and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages[0], 400));
  }
  next();
};

// Auth validators
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Enter a valid 10-digit phone number'),
  validate,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Complaint validators
const complaintValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
  body('category').notEmpty().withMessage('Category is required').isIn(['Water Supply', 'Electricity', 'Roads & Infrastructure', 'Sanitation', 'Public Health', 'Education', 'Police', 'Revenue', 'Other']).withMessage('Invalid category'),
  body('location.address').notEmpty().withMessage('Location address is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority'),
  validate,
];

const submitComplaintValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 250 })
    .withMessage('Location cannot exceed 250 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Water Supply', 'Electricity', 'Road Safety', 'Waste Management', 'Healthcare'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be 20-2000 characters'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  validate,
];

const complaintHistoryValidator = [
  query('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email'),
  query('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  query()
    .custom((value, { req }) => {
      if (!req.query.email && !req.query.name) {
        throw new Error('Email or name is required.');
      }

      return true;
    }),
  validate,
];

const statusUpdateValidator = [
  body('status').notEmpty().withMessage('Status is required').isIn(['Submitted', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed']).withMessage('Invalid status value'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  validate,
];

const commentValidator = [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
  complaintValidator,
  submitComplaintValidator,
  complaintHistoryValidator,
  statusUpdateValidator,
  commentValidator,
};
