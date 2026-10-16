const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

// @desc    Upload or re-upload a student document
// @route   POST /api/documents/upload
// @access  Private (Student)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a valid PDF, JPG, JPEG, or PNG file.',
      });
    }

    const { documentType } = req.body;
    if (!documentType) {
      // Remove uploaded file if validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Document type is required.',
      });
    }

    const validTypes = [
      'Academic / Marks Certificate',
      'Income Certificate',
      'Caste / Category Certificate',
      'Domicile / Residence Certificate',
      'Bonafide Certificate',
      'ID Proof',
      'Other',
    ];

    if (!validTypes.includes(documentType)) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Allowed types: ${validTypes.join(', ')}`,
      });
    }

    // Check if document of this type already exists for this student
    const existingDoc = await Document.findOne({
      studentId: req.user._id,
      documentType,
    });

    if (existingDoc) {
      // If previous file exists on disk, delete the old file to conserve space
      const oldFilePath = path.join(__dirname, '..', 'uploads', existingDoc.fileName);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.warn('Could not delete old file:', err.message);
        }
      }

      existingDoc.fileName = req.file.filename;
      existingDoc.originalName = req.file.originalname;
      existingDoc.filePath = `/uploads/${req.file.filename}`;
      existingDoc.fileSize = req.file.size;
      existingDoc.mimeType = req.file.mimetype;
      existingDoc.verificationStatus = 'Pending';
      existingDoc.rejectionReason = '';
      existingDoc.uploadedAt = Date.now();

      await existingDoc.save();

      return res.status(200).json({
        success: true,
        message: 'Document re-uploaded successfully. Status is now Pending verification.',
        document: existingDoc,
      });
    }

    // Create new document record
    const document = await Document.create({
      studentId: req.user._id,
      documentType,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      verificationStatus: 'Pending',
      rejectionReason: '',
      uploadedAt: Date.now(),
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. Status is Pending verification.',
      document,
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading document.',
      error: error.message,
    });
  }
};

// @desc    Get all documents for logged-in student
// @route   GET /api/documents/my
// @access  Private (Student)
const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ studentId: req.user._id }).sort({
      uploadedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching documents.',
      error: error.message,
    });
  }
};

// @desc    View / stream document securely
// @route   GET /api/documents/:id/view
// @access  Private (Admin or Owning Student)
const viewDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    // Authorization check: Admin or Owning Student
    const isOwner = document.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this document.',
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', document.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server.',
      });
    }

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${document.originalName || document.fileName}"`
    );

    const fileStream = fs.createReadStream(filePath);
    return fileStream.pipe(res);
  } catch (error) {
    console.error('Error viewing document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while accessing document.',
      error: error.message,
    });
  }
};

// @desc    Delete a student document
// @route   DELETE /api/documents/:id
// @access  Private (Student)
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '..', 'uploads', document.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete file from disk:', err.message);
      }
    }

    await Document.findByIdAndDelete(document._id);

    return res.status(200).json({
      success: true,
      message: 'Document removed successfully.',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting document.',
      error: error.message,
    });
  }
};

// @desc    Admin verify document
// @route   PUT /api/admin/documents/:id/verify
// @access  Private (Admin)
const verifyDocumentAdmin = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    document.verificationStatus = 'Verified';
    document.rejectionReason = '';
    await document.save();

    return res.status(200).json({
      success: true,
      message: 'Document verified successfully.',
      document,
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying document.',
      error: error.message,
    });
  }
};

// @desc    Admin reject document with reason
// @route   PUT /api/admin/documents/:id/reject
// @access  Private (Admin)
const rejectDocumentAdmin = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
      });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    document.verificationStatus = 'Rejected';
    document.rejectionReason = rejectionReason.trim();
    await document.save();

    return res.status(200).json({
      success: true,
      message: 'Document has been rejected. Student will see the reason.',
      document,
    });
  } catch (error) {
    console.error('Error rejecting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while rejecting document.',
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  viewDocument,
  deleteDocument,
  verifyDocumentAdmin,
  rejectDocumentAdmin,
};
