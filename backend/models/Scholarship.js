const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    scholarshipName: {
      type: String,
      required: [true, 'Scholarship name is required'],
      trim: true,
    },
    provider: {
      type: String,
      required: [true, 'Provider/organization name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    eligibility: {
      type: String,
      required: [true, 'Eligibility criteria summary is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Scholarship amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    lastDate: {
      type: Date,
      required: [true, 'Deadline / last date is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Expired'],
      default: 'Active',
    },
    minimumPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    maximumFamilyIncome: {
      type: Number,
      default: 10000000,
      min: 0,
    },
    allowedCategories: {
      type: [String],
      default: ['All'],
    },
    allowedCourses: {
      type: [String],
      default: ['All'],
    },
    allowedYears: {
      type: [String],
      default: ['All'],
    },
    requiredDocuments: {
      type: [String],
      default: [
        'Academic / Marks Certificate',
        'Income Certificate',
        'ID Proof',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual helper or hook to check if expired
scholarshipSchema.methods.isExpired = function () {
  return new Date() > new Date(this.lastDate);
};

module.exports = mongoose.model('Scholarship', scholarshipSchema);
