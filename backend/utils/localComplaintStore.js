const fs = require('fs');
const path = require('path');

const dataDirectory = path.join(__dirname, '..', 'data');
const complaintsFile = path.join(dataDirectory, 'complaints.json');

const departmentByCategory = {
  'Water Supply': 'Water Supply',
  Electricity: 'Electricity',
  'Road Safety': 'Roads & Infrastructure',
  'Waste Management': 'Sanitation',
  Healthcare: 'Public Health',
};

const ensureComplaintsFile = () => {
  fs.mkdirSync(dataDirectory, { recursive: true });

  if (!fs.existsSync(complaintsFile)) {
    fs.writeFileSync(complaintsFile, '[]', 'utf8');
  }
};

const readComplaints = () => {
  ensureComplaintsFile();

  try {
    return JSON.parse(fs.readFileSync(complaintsFile, 'utf8'));
  } catch {
    fs.writeFileSync(complaintsFile, '[]', 'utf8');
    return [];
  }
};

const writeComplaints = (complaints) => {
  ensureComplaintsFile();
  fs.writeFileSync(complaintsFile, JSON.stringify(complaints, null, 2), 'utf8');
};

const generateComplaintId = (complaints) => {
  const existingIds = new Set(complaints.map((complaint) => complaint.complaintId));
  let complaintId = '';

  do {
    complaintId = `GOV-${Math.floor(100000 + Math.random() * 900000)}`;
  } while (existingIds.has(complaintId));

  return complaintId;
};

const normalizeUserIdentifier = ({ email, name }) => ({
  email: email?.trim().toLowerCase() || '',
  name: name?.trim().toLowerCase() || '',
});

const complaintBelongsToUser = (complaint, userIdentifier) => {
  const complaintEmail = complaint.contactEmail?.trim().toLowerCase() || '';
  const complaintName = complaint.contactName?.trim().toLowerCase() || '';

  if (userIdentifier.email && complaintEmail === userIdentifier.email) {
    return true;
  }

  return Boolean(userIdentifier.name) && !complaintEmail && complaintName === userIdentifier.name;
};

const createLocalComplaint = ({ name, email, phone, location, category, description, file }) => {
  const complaints = readComplaints();
  const timestamp = new Date().toISOString();
  const normalizedLocation = location.trim();
  const complaintId = generateComplaintId(complaints);

  const complaint = {
    _id: `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    complaintId,
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
    assignedDepartment: departmentByCategory[category] || 'General',
    attachments: file
      ? [
          {
            filename: file.filename,
            url: `/uploads/complaints/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: timestamp,
          },
        ]
      : [],
    statusHistory: [
      {
        status: 'Submitted',
        comment: 'Complaint submitted successfully.',
        updatedAt: timestamp,
      },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  complaints.unshift(complaint);
  writeComplaints(complaints);

  return complaint;
};

const getLocalComplaintHistory = ({ email, name }) => {
  const userIdentifier = normalizeUserIdentifier({ email, name });

  return readComplaints()
    .filter((complaint) => complaintBelongsToUser(complaint, userIdentifier))
    .sort((leftComplaint, rightComplaint) =>
      new Date(rightComplaint.createdAt) - new Date(leftComplaint.createdAt)
    );
};

module.exports = {
  createLocalComplaint,
  getLocalComplaintHistory,
};
