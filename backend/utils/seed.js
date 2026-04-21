require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Complaint.deleteMany({});

  console.log('🗑️  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@janresolve.gov.in',
    password: 'Admin@1234',
    role: 'admin',
    phone: '9000000001',
    address: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
  });

  // Create an official
  const official = await User.create({
    name: 'Rajesh Kumar',
    email: 'official@janresolve.gov.in',
    password: 'Official@1234',
    role: 'official',
    department: 'Water Supply',
    phone: '9000000002',
    address: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
  });

  // Create sample citizens
  const citizen1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'Citizen@1234',
    role: 'citizen',
    phone: '9876543210',
    address: { street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  });

  const citizen2 = await User.create({
    name: 'Amit Verma',
    email: 'amit@example.com',
    password: 'Citizen@1234',
    role: 'citizen',
    phone: '9123456789',
    address: { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  });

  // Create sample complaints
  await Complaint.create([
    {
      title: 'Broken water pipe causing flooding on Main Street',
      description:
        'There is a broken water pipe near the main street causing severe waterlogging. The road is flooded and it has been like this for 3 days. Multiple vehicles have been damaged and residents are unable to commute.',
      category: 'Water Supply',
      priority: 'High',
      status: 'In Progress',
      location: {
        address: '12 Main Street, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
      },
      submittedBy: citizen1._id,
      assignedTo: official._id,
      assignedDepartment: 'Water Supply',
      statusHistory: [
        { status: 'Pending', comment: 'Complaint submitted', updatedBy: citizen1._id },
        {
          status: 'Under Review',
          comment: 'Under review by department',
          updatedBy: admin._id,
        },
        {
          status: 'In Progress',
          comment: 'Team dispatched to location',
          updatedBy: official._id,
        },
      ],
    },
    {
      title: 'Street lights not working in Sector 14',
      description:
        'Over 15 street lights in Sector 14 have been non-functional for the past week. This has led to increased crime and road accidents in the area. Residents are scared to go out at night.',
      category: 'Electricity',
      priority: 'Medium',
      status: 'Pending',
      location: {
        address: 'Sector 14, Near Park',
        city: 'Gurgaon',
        state: 'Haryana',
        pincode: '122001',
      },
      submittedBy: citizen2._id,
      statusHistory: [
        {
          status: 'Pending',
          comment: 'Complaint submitted',
          updatedBy: citizen2._id,
        },
      ],
    },
    {
      title: 'Garbage not collected for 10 days in Colony B',
      description:
        'The garbage collection truck has not visited Colony B in over 10 days. Garbage is piling up near the main entrance creating a health hazard. Residents are facing issues due to the smell and mosquito breeding.',
      category: 'Sanitation',
      priority: 'Urgent',
      status: 'Resolved',
      location: {
        address: 'Colony B, Block 3',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226001',
      },
      submittedBy: citizen2._id,
      assignedTo: official._id,
      resolvedAt: new Date(),
      statusHistory: [
        { status: 'Pending', comment: 'Complaint submitted', updatedBy: citizen2._id },
        { status: 'In Progress', comment: 'Garbage truck dispatched', updatedBy: official._id },
        {
          status: 'Resolved',
          comment: 'Garbage collected and area cleaned',
          updatedBy: official._id,
        },
      ],
    },
  ]);

  console.log('✅ Seed data created successfully!\n');
  console.log('📋 Test Credentials:');
  console.log('   Admin    → admin@janresolve.gov.in / Admin@1234');
  console.log('   Official → official@janresolve.gov.in / Official@1234');
  console.log('   Citizen  → priya@example.com / Citizen@1234');
  console.log('   Citizen  → amit@example.com / Citizen@1234');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
