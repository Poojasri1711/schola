const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Details
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    // Academic Details
    collegeName: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    currentYear: {
      type: String,
      required: [true, 'Current year is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage or CGPA is required'],
      min: [0, 'Percentage cannot be less than 0'],
      max: [100, 'Percentage cannot exceed 100'],
    },
    // Eligibility Details
    familyIncome: {
      type: Number,
      required: [true, 'Annual family income is required'],
      min: [0, 'Income cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    },
    domicileState: {
      type: String,
      required: [true, 'Domicile state is required'],
      trim: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
