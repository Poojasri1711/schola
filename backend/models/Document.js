const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: [
        'Academic / Marks Certificate',
        'Income Certificate',
        'Caste / Category Certificate',
        'Domicile / Residence Certificate',
        'Bonafide Certificate',
        'ID Proof',
        'Other',
      ],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
