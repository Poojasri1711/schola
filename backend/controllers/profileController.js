const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// @desc    Get current student's profile
// @route   GET /api/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(200).json({
        success: true,
        profile: null,
        isComplete: false,
        message: 'No profile found. Please complete your profile.',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
      isComplete: true,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile.',
      error: error.message,
    });
  }
};

// @desc    Create or update current student's profile
// @route   PUT /api/profile
// @access  Private (Student)
const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      phone,
      address,
      collegeName,
      course,
      branch,
      currentYear,
      rollNumber,
      percentage,
      familyIncome,
      category,
      domicileState,
    } = req.body;

    // Validation
    if (
      !fullName ||
      !dateOfBirth ||
      !gender ||
      !phone ||
      !address ||
      !collegeName ||
      !course ||
      !branch ||
      !currentYear ||
      !rollNumber ||
      percentage === undefined ||
      familyIncome === undefined ||
      !category ||
      !domicileState
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required personal, academic, and eligibility fields.',
      });
    }

    const numPct = parseFloat(percentage);
    const numIncome = parseFloat(familyIncome);

    if (isNaN(numPct) || numPct < 0 || numPct > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage must be a valid number between 0 and 100.',
      });
    }

    if (isNaN(numIncome) || numIncome < 0) {
      return res.status(400).json({
        success: false,
        message: 'Family income must be a valid non-negative number.',
      });
    }

    const profileData = {
      userId: req.user._id,
      fullName: fullName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone: phone.trim(),
      address: address.trim(),
      collegeName: collegeName.trim(),
      course: course.trim(),
      branch: branch.trim(),
      currentYear: currentYear.trim(),
      rollNumber: rollNumber.trim(),
      percentage: numPct,
      familyIncome: numIncome,
      category,
      domicileState: domicileState.trim(),
      isProfileComplete: true,
    };

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true }
    );

    // Also update User name to match
    await User.findByIdAndUpdate(req.user._id, { name: fullName.trim() });

    return res.status(200).json({
      success: true,
      message: 'Profile saved successfully.',
      profile,
      isComplete: true,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving profile.',
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
