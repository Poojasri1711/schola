const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const StudentProfile = require('../models/StudentProfile');
const Document = require('../models/Document');
const User = require('../models/User');
const { checkEligibility } = require('../utils/eligibility');

// @desc    Apply for a scholarship
// @route   POST /api/applications
// @access  Private (Student)
const applyScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.body;

    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship ID is required.',
      });
    }

    // 1. Check if student profile exists and is complete
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before applying.',
      });
    }

    // 2. Check scholarship
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.',
      });
    }

    if (scholarship.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This scholarship is not currently active.',
      });
    }

    if (new Date() > new Date(scholarship.lastDate)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline for this scholarship has passed.',
      });
    }

    // 3. Prevent duplicate applications
    const existingApp = await Application.findOne({
      studentId: req.user._id,
      scholarshipId,
    });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this scholarship.',
      });
    }

    // 4. Fetch student's documents and evaluate eligibility
    const documents = await Document.find({ studentId: req.user._id });
    const eligibilityResult = checkEligibility(profile, documents, scholarship);

    // Initial eligibility status
    let initialEligibility = 'Pending';
    if (!eligibilityResult.academicEligible) {
      initialEligibility = 'Not Eligible';
    } else if (eligibilityResult.overallStatus === 'Eligible') {
      initialEligibility = 'Eligible';
    }

    // Initial doc verification status
    let initialDocStatus = 'Pending';
    if (eligibilityResult.criteria.documents.verifiedCount === scholarship.requiredDocuments.length) {
      initialDocStatus = 'Verified';
    } else if (eligibilityResult.criteria.documents.rejectedCount > 0) {
      initialDocStatus = 'Rejected';
    }

    const application = await Application.create({
      studentId: req.user._id,
      scholarshipId,
      applicationDate: new Date(),
      applicationStatus: 'Pending',
      documentVerificationStatus: initialDocStatus,
      eligibilityStatus: initialEligibility,
      adminRemarks: '',
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Your application is now Pending admin review.',
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this scholarship.',
      });
    }
    console.error('Apply error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting application.',
      error: error.message,
    });
  }
};

// @desc    Get all applications of logged-in student
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('scholarshipId')
      .sort({ applicationDate: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error fetching student applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching applications.',
      error: error.message,
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Student or Admin)
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scholarshipId')
      .populate('studentId', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Permission check
    const isOwner = application.studentId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching application.',
      error: error.message,
    });
  }
};

// @desc    Cancel a pending application
// @route   PUT /api/applications/:id/cancel
// @access  Private (Student)
const cancelApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.applicationStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an application that is already ${application.applicationStatus}.`,
      });
    }

    await Application.findByIdAndDelete(application._id);

    return res.status(200).json({
      success: true,
      message: 'Application cancelled successfully.',
    });
  } catch (error) {
    console.error('Error cancelling application:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error cancelling application.',
      error: error.message,
    });
  }
};

// ================= ADMIN CONTROLLERS =================

// @desc    Get all applications (Admin)
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAllApplicationsAdmin = async (req, res) => {
  try {
    const { status, scholarshipId, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.applicationStatus = status;
    }

    if (scholarshipId && scholarshipId !== 'All') {
      query.scholarshipId = scholarshipId;
    }

    let applications = await Application.find(query)
      .populate('scholarshipId', 'scholarshipName provider amount lastDate')
      .populate('studentId', 'name email')
      .sort({ applicationDate: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      applications = applications.filter((app) => {
        const studentName = app.studentId?.name?.toLowerCase() || '';
        const studentEmail = app.studentId?.email?.toLowerCase() || '';
        const schName = app.scholarshipId?.scholarshipName?.toLowerCase() || '';
        return (
          studentName.includes(searchLower) ||
          studentEmail.includes(searchLower) ||
          schName.includes(searchLower)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error in getAllApplicationsAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching applications.',
      error: error.message,
    });
  }
};

// @desc    Get complete application review details (Admin)
// @route   GET /api/admin/applications/:id
// @access  Private (Admin)
const getApplicationDetailsAdmin = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scholarshipId')
      .populate('studentId', 'name email createdAt')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const studentUser = application.studentId;
    const scholarship = application.scholarshipId;

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ userId: studentUser._id });

    // Get student's uploaded documents
    const documents = await Document.find({ studentId: studentUser._id }).sort({
      uploadedAt: -1,
    });

    // Run eligibility checker
    const eligibilityAnalysis = checkEligibility(studentProfile, documents, scholarship);

    return res.status(200).json({
      success: true,
      application,
      scholarship,
      studentUser,
      studentProfile,
      documents,
      eligibilityAnalysis,
    });
  } catch (error) {
    console.error('Error in getApplicationDetailsAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching application details.',
      error: error.message,
    });
  }
};

// @desc    Approve application (Admin)
// @route   PUT /api/admin/applications/:id/approve
// @access  Private (Admin)
const approveApplicationAdmin = async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    const application = await Application.findById(req.params.id).populate('scholarshipId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Backend validation: Student profile must exist
    const profile = await StudentProfile.findOne({ userId: application.studentId });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Approval denied: Student profile is incomplete.',
      });
    }

    // Backend validation: Required documents must be uploaded and verified
    const scholarship = application.scholarshipId;
    const documents = await Document.find({ studentId: application.studentId });
    const eligibility = checkEligibility(profile, documents, scholarship);

    if (!eligibility.academicEligible) {
      return res.status(400).json({
        success: false,
        message: 'Approval denied: Student does not meet the basic scholarship criteria.',
      });
    }

    const unverifiedDocs = eligibility.criteria.documents.docDetails.filter(
      (d) => d.status !== 'Verified'
    );
    if (unverifiedDocs.length > 0) {
      const docNames = unverifiedDocs.map((d) => d.documentType).join(', ');
      return res.status(400).json({
        success: false,
        message: `Approval denied: All required documents must be verified first. Unverified: ${docNames}`,
      });
    }

    application.applicationStatus = 'Approved';
    application.documentVerificationStatus = 'Verified';
    application.eligibilityStatus = 'Eligible';
    application.adminRemarks = adminRemarks?.trim() || 'All requirements satisfied and documents verified successfully.';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application approved successfully.',
      application,
    });
  } catch (error) {
    console.error('Error in approveApplicationAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while approving application.',
      error: error.message,
    });
  }
};

// @desc    Reject application (Admin)
// @route   PUT /api/admin/applications/:id/reject
// @access  Private (Admin)
const rejectApplicationAdmin = async (req, res) => {
  try {
    const { adminRemarks } = req.body;

    if (!adminRemarks || !adminRemarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Admin remarks / rejection reason is required.',
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    application.applicationStatus = 'Rejected';
    application.adminRemarks = adminRemarks.trim();
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application rejected.',
      application,
    });
  } catch (error) {
    console.error('Error in rejectApplicationAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while rejecting application.',
      error: error.message,
    });
  }
};

module.exports = {
  applyScholarship,
  getMyApplications,
  getApplicationById,
  cancelApplication,
  getAllApplicationsAdmin,
  getApplicationDetailsAdmin,
  approveApplicationAdmin,
  rejectApplicationAdmin,
};
