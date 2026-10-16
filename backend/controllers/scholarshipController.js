const Scholarship = require('../models/Scholarship');
const StudentProfile = require('../models/StudentProfile');
const Document = require('../models/Document');
const { checkEligibility } = require('../utils/eligibility');

// @desc    Get all scholarships (filtered for students, all for admin)
// @route   GET /api/scholarships
// @access  Public / Private
const getScholarships = async (req, res) => {
  try {
    const { search, category, course, status, sortBy, sortOrder } = req.query;
    const query = {};

    // If user is not admin, only show Active scholarships
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      query.status = 'Active';
    } else if (status) {
      query.status = status;
    }

    // Search by title or provider
    if (search) {
      query.$or = [
        { scholarshipName: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.allowedCategories = { $in: [category, 'All'] };
    }

    // Filter by course
    if (course && course !== 'All') {
      query.allowedCourses = { $in: [course, 'All'] };
    }

    // Sort order
    let sort = { createdAt: -1 };
    if (sortBy === 'amount') {
      sort = { amount: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'lastDate') {
      sort = { lastDate: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'name') {
      sort = { scholarshipName: sortOrder === 'desc' ? -1 : 1 };
    }

    const scholarships = await Scholarship.find(query).sort(sort);

    return res.status(200).json({
      success: true,
      count: scholarships.length,
      scholarships,
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching scholarships.',
      error: error.message,
    });
  }
};

// @desc    Get single scholarship by ID (with eligibility check if student)
// @route   GET /api/scholarships/:id
// @access  Public / Private
const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.',
      });
    }

    let eligibilityReport = null;
    // If student is logged in, compute eligibility details
    if (req.user && req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      const documents = await Document.find({ studentId: req.user._id });
      if (profile) {
        eligibilityReport = checkEligibility(profile, documents, scholarship);
      }
    }

    return res.status(200).json({
      success: true,
      scholarship,
      eligibilityReport,
    });
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching scholarship details.',
      error: error.message,
    });
  }
};

// @desc    Create new scholarship (Admin only)
// @route   POST /api/scholarships
// @access  Private (Admin)
const createScholarship = async (req, res) => {
  try {
    const {
      scholarshipName,
      provider,
      description,
      eligibility,
      amount,
      lastDate,
      status,
      minimumPercentage,
      maximumFamilyIncome,
      allowedCategories,
      allowedCourses,
      allowedYears,
      requiredDocuments,
    } = req.body;

    if (!scholarshipName || !provider || !description || !eligibility || !amount || !lastDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required scholarship fields.',
      });
    }

    const scholarship = await Scholarship.create({
      scholarshipName: scholarshipName.trim(),
      provider: provider.trim(),
      description: description.trim(),
      eligibility: eligibility.trim(),
      amount: Number(amount),
      lastDate: new Date(lastDate),
      status: status || 'Active',
      minimumPercentage: minimumPercentage !== undefined ? Number(minimumPercentage) : 0,
      maximumFamilyIncome:
        maximumFamilyIncome !== undefined ? Number(maximumFamilyIncome) : 10000000,
      allowedCategories:
        Array.isArray(allowedCategories) && allowedCategories.length > 0
          ? allowedCategories
          : ['All'],
      allowedCourses:
        Array.isArray(allowedCourses) && allowedCourses.length > 0
          ? allowedCourses
          : ['All'],
      allowedYears:
        Array.isArray(allowedYears) && allowedYears.length > 0
          ? allowedYears
          : ['All'],
      requiredDocuments:
        Array.isArray(requiredDocuments) && requiredDocuments.length > 0
          ? requiredDocuments
          : ['Academic / Marks Certificate', 'Income Certificate', 'ID Proof'],
    });

    return res.status(201).json({
      success: true,
      message: 'Scholarship created successfully.',
      scholarship,
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating scholarship.',
      error: error.message,
    });
  }
};

// @desc    Update scholarship (Admin only)
// @route   PUT /api/scholarships/:id
// @access  Private (Admin)
const updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.',
      });
    }

    const updated = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully.',
      scholarship: updated,
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating scholarship.',
      error: error.message,
    });
  }
};

// @desc    Delete scholarship (Admin only)
// @route   DELETE /api/scholarships/:id
// @access  Private (Admin)
const deleteScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.',
      });
    }

    await Scholarship.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Scholarship deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting scholarship.',
      error: error.message,
    });
  }
};

module.exports = {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
};
