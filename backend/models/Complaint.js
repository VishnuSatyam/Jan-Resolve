const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Submitted', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Water Supply',
        'Electricity',
        'Road Safety',
        'Waste Management',
        'Healthcare',
        'Roads & Infrastructure',
        'Sanitation',
        'Public Health',
        'Education',
        'Police',
        'Revenue',
        'Other',
      ],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
      default: 'Submitted',
    },
    location: {
      address: {
        type: String,
        required: [true, 'Location address is required'],
      },
      city: String,
      state: String,
      pincode: {
        type: String,
        match: [/^\d{6}$/, 'Pincode must be 6 digits'],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    contactPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    publicLocation: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [250, 'Location cannot exceed 250 characters'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDepartment: {
      type: String,
      enum: [
        'Water Supply',
        'Electricity',
        'Roads & Infrastructure',
        'Sanitation',
        'Public Health',
        'Education',
        'Police',
        'Revenue',
        'General',
      ],
    },
    statusHistory: [statusHistorySchema],
    comments: [commentSchema],
    resolvedAt: Date,
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    expectedResolutionDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate complaintId before saving
complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    let isUnique = false;

    while (!isUnique) {
      const candidate = `GOV-${Math.floor(100000 + Math.random() * 900000)}`;
      const existingComplaint = await mongoose.model('Complaint').findOne({ complaintId: candidate });

      if (!existingComplaint) {
        this.complaintId = candidate;
        isUnique = true;
      }
    }
  }
  next();
});

// Virtual: upvote count
complaintSchema.virtual('upvoteCount').get(function () {
  return this.upvotes ? this.upvotes.length : 0;
});

// Index for fast search
complaintSchema.index({ status: 1, category: 1, submittedBy: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
