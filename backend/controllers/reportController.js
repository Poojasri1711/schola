const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const StudentProfile = require('../models/StudentProfile');
const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Get comprehensive system reports and statistics (Admin only)
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAdminReports = async (req, res) => {
  try {
    // 1. Overall counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalScholarships = await Scholarship.countDocuments();
    const activeScholarships = await Scholarship.countDocuments({ status: 'Active' });
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ applicationStatus: 'Pending' });
    const underReviewApplications = await Application.countDocuments({
      applicationStatus: 'Under Review',
    });
    const approvedApplications = await Application.countDocuments({
      applicationStatus: 'Approved',
    });
    const rejectedApplications = await Application.countDocuments({
      applicationStatus: 'Rejected',
    });
    const pendingDocuments = await Document.countDocuments({ verificationStatus: 'Pending' });
    const verifiedDocuments = await Document.countDocuments({ verificationStatus: 'Verified' });
    const rejectedDocuments = await Document.countDocuments({ verificationStatus: 'Rejected' });

    // 2. Total Disbursed / Allocated Amount for Approved applications
    const approvedApps = await Application.find({ applicationStatus: 'Approved' }).populate(
      'scholarshipId',
      'amount'
    );
    const totalAllocatedAmount = approvedApps.reduce(
      (sum, app) => sum + (app.scholarshipId?.amount || 0),
      0
    );

    // 3. Applications by Scholarship
    const applicationsByScholarshipAgg = await Application.aggregate([
      {
        $group: {
          _id: '$scholarshipId',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$applicationStatus', 'Approved'] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$applicationStatus', 'Rejected'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$applicationStatus', 'Pending'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'scholarships',
          localField: '_id',
          foreignField: '_id',
          as: 'scholarship',
        },
      },
      {
        $unwind: '$scholarship',
      },
      {
        $project: {
          _id: 1,
          name: '$scholarship.scholarshipName',
          provider: '$scholarship.provider',
          amount: '$scholarship.amount',
          count: 1,
          approved: 1,
          rejected: 1,
          pending: 1,
        },
      },
    ]);

    // 4. Applications by Student Category
    const allApplications = await Application.find().populate('studentId', '_id');
    const studentUserIds = allApplications.map((a) => a.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ userId: { $in: studentUserIds } });
    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.userId.toString(), p));

    const categoryCounts = {
      General: 0,
      OBC: 0,
      SC: 0,
      ST: 0,
      EWS: 0,
      Other: 0,
    };

    const courseCounts = {};

    allApplications.forEach((app) => {
      const studentIdStr = app.studentId?._id?.toString();
      const prof = profileMap.get(studentIdStr);
      if (prof) {
        // Category
        const cat = prof.category || 'Other';
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat]++;
        } else {
          categoryCounts.Other++;
        }

        // Course
        const course = prof.course ? prof.course.trim().toUpperCase() : 'UNKNOWN';
        courseCounts[course] = (courseCounts[course] || 0) + 1;
      }
    });

    const applicationsByCategory = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    const applicationsByCourse = Object.entries(courseCounts).map(([course, count]) => ({
      course,
      count,
    }));

    // Approval rate calculation
    const processedApps = approvedApplications + rejectedApplications;
    const approvalRate =
      processedApps > 0 ? Math.round((approvedApplications / processedApps) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalScholarships,
        activeScholarships,
        totalApplications,
        pendingApplications,
        underReviewApplications,
        approvedApplications,
        rejectedApplications,
        pendingDocuments,
        verifiedDocuments,
        rejectedDocuments,
        totalAllocatedAmount,
        approvalRate,
      },
      applicationsByScholarship: applicationsByScholarshipAgg,
      applicationsByCategory,
      applicationsByCourse,
    });
  } catch (error) {
    console.error('Reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating reports.',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminReports,
};
