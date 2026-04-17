const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, complaint }) => {
  try {
    if (!recipient) {
      return;
    }

    await Notification.create({ recipient, type, title, message, complaint });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

const notifyStatusUpdate = async (complaint, updatedBy) => {
  if (complaint.submittedBy && complaint.submittedBy.toString() !== updatedBy.toString()) {
    await createNotification({
      recipient: complaint.submittedBy,
      type: 'status_updated',
      title: 'Complaint Status Updated',
      message: `Your complaint "${complaint.title}" status has been updated to "${complaint.status}".`,
      complaint: complaint._id,
    });
  }
};

module.exports = { createNotification, notifyStatusUpdate };
