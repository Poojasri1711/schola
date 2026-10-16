/**
 * Reusable eligibility checker
 * @param {Object} studentProfile - Complete student profile
 * @param {Array} documents - Student's uploaded documents
 * @param {Object} scholarship - Scholarship scheme definition
 * @returns {Object} Detailed eligibility report
 */
function checkEligibility(studentProfile, documents = [], scholarship) {
  if (!studentProfile) {
    return {
      overallStatus: 'Not Eligible',
      summary: 'Student profile is incomplete.',
      criteria: {},
      isProfileComplete: false,
      academicEligible: false,
    };
  }

  const criteria = {};

  // 1. Minimum Percentage
  const reqMinPct = scholarship.minimumPercentage || 0;
  const studentPct = Number(studentProfile.percentage || 0);
  const pctEligible = studentPct >= reqMinPct;
  criteria.percentage = {
    label: 'Minimum Percentage',
    required: `${reqMinPct}%`,
    studentValue: `${studentPct}%`,
    eligible: pctEligible,
    result: pctEligible ? 'Eligible' : 'Not Eligible',
  };

  // 2. Maximum Family Income
  const reqMaxIncome = scholarship.maximumFamilyIncome ?? 10000000;
  const studentIncome = Number(studentProfile.familyIncome || 0);
  const incomeEligible = studentIncome <= reqMaxIncome;
  criteria.familyIncome = {
    label: 'Family Income',
    required: `Below ₹${reqMaxIncome.toLocaleString('en-IN')}`,
    studentValue: `₹${studentIncome.toLocaleString('en-IN')}`,
    eligible: incomeEligible,
    result: incomeEligible ? 'Eligible' : 'Not Eligible',
  };

  // 3. Category
  const allowedCategories = scholarship.allowedCategories || ['All'];
  const studentCategory = (studentProfile.category || '').toLowerCase().trim();
  const categoryEligible =
    allowedCategories.includes('All') ||
    allowedCategories.some(
      (c) =>
        c.toLowerCase().trim() === studentCategory ||
        c.toLowerCase().includes(studentCategory) ||
        studentCategory.includes(c.toLowerCase().trim())
    );
  criteria.category = {
    label: 'Category',
    required: allowedCategories.includes('All')
      ? 'All Categories'
      : allowedCategories.join(', '),
    studentValue: studentProfile.category || 'Not specified',
    eligible: categoryEligible,
    result: categoryEligible ? 'Eligible' : 'Not Eligible',
  };

  // 4. Course
  const allowedCourses = scholarship.allowedCourses || ['All'];
  const studentCourse = (studentProfile.course || '').toLowerCase().trim();
  const courseEligible =
    allowedCourses.includes('All') ||
    allowedCourses.some(
      (c) =>
        c.toLowerCase().trim() === studentCourse ||
        c.toLowerCase().includes(studentCourse) ||
        studentCourse.includes(c.toLowerCase().trim())
    );
  criteria.course = {
    label: 'Course',
    required: allowedCourses.includes('All')
      ? 'All Courses'
      : allowedCourses.join(', '),
    studentValue: studentProfile.course || 'Not specified',
    eligible: courseEligible,
    result: courseEligible ? 'Eligible' : 'Not Eligible',
  };

  // 5. Current Year (Supports '1', '1st Year', '2', '2nd Year', '3', '3rd Year', '4', '4th Year', 'All')
  const allowedYears = scholarship.allowedYears || ['All'];
  const studentYearStr = (studentProfile.currentYear || '').trim();
  const studentYearDigit = studentYearStr.replace(/[^0-9]/g, '');

  const yearEligible =
    allowedYears.includes('All') ||
    allowedYears.some((y) => {
      const yStr = y.trim();
      const yDigit = yStr.replace(/[^0-9]/g, '');
      if (yDigit && studentYearDigit && yDigit === studentYearDigit) {
        return true;
      }
      return yStr.toLowerCase() === studentYearStr.toLowerCase();
    });

  criteria.currentYear = {
    label: 'Current Year',
    required: allowedYears.includes('All')
      ? 'All Years'
      : allowedYears.join(', '),
    studentValue: studentProfile.currentYear || 'Not specified',
    eligible: yearEligible,
    result: yearEligible ? 'Eligible' : 'Not Eligible',
  };

  // Helper to match document types flexibly
  const matchesDocType = (reqType, actualType) => {
    if (!reqType || !actualType) return false;
    const r = reqType.toLowerCase().trim();
    const a = actualType.toLowerCase().trim();
    if (r === a) return true;
    if (r.includes('academic') || r.includes('marks')) {
      return a.includes('academic') || a.includes('marks');
    }
    if (r.includes('income')) {
      return a.includes('income');
    }
    if (r.includes('caste') || r.includes('category')) {
      return a.includes('caste') || a.includes('category');
    }
    if (r.includes('domicile') || r.includes('residence')) {
      return a.includes('domicile') || a.includes('residence');
    }
    if (r.includes('bonafide')) {
      return a.includes('bonafide');
    }
    if (r.includes('id proof') || r.includes('identity')) {
      return a.includes('id proof') || a.includes('identity') || a.includes('id');
    }
    return false;
  };

  // 6. Required Documents Check
  const requiredDocs = scholarship.requiredDocuments || [];
  const docStatusList = requiredDocs.map((docType) => {
    const matchingDocs = documents.filter((d) =>
      matchesDocType(docType, d.documentType)
    );
    let bestDoc = null;
    if (matchingDocs.length > 0) {
      bestDoc =
        matchingDocs.find((d) => d.verificationStatus === 'Verified') ||
        matchingDocs.find((d) => d.verificationStatus === 'Pending') ||
        matchingDocs[0];
    }

    return {
      documentType: docType,
      uploaded: !!bestDoc,
      status: bestDoc ? bestDoc.verificationStatus : 'Not Uploaded',
      rejectionReason: bestDoc?.rejectionReason || '',
      documentId: bestDoc?._id || null,
      actualUploadedName: bestDoc?.originalName || null,
    };
  });

  const totalRequired = requiredDocs.length;
  const uploadedCount = docStatusList.filter((d) => d.uploaded).length;
  const verifiedCount = docStatusList.filter(
    (d) => d.status === 'Verified'
  ).length;
  const rejectedCount = docStatusList.filter(
    (d) => d.status === 'Rejected'
  ).length;
  const pendingCount = docStatusList.filter(
    (d) => d.status === 'Pending'
  ).length;

  let docOverallStatus = 'Eligible';
  if (totalRequired > 0) {
    if (verifiedCount === totalRequired) {
      docOverallStatus = 'Verified';
    } else if (rejectedCount > 0) {
      docOverallStatus = 'Rejected';
    } else {
      docOverallStatus = 'Pending';
    }
  } else {
    docOverallStatus = 'Verified';
  }

  criteria.documents = {
    label: 'Required Documents',
    required: `${totalRequired} document${totalRequired === 1 ? '' : 's'}`,
    studentValue: `${uploadedCount}/${totalRequired} Uploaded (${verifiedCount} Verified)`,
    status: docOverallStatus,
    docDetails: docStatusList,
    totalRequired,
    uploadedCount,
    verifiedCount,
    rejectedCount,
    pendingCount,
    eligible: totalRequired === 0 || verifiedCount === totalRequired,
    result:
      verifiedCount === totalRequired
        ? 'Verified'
        : rejectedCount > 0
        ? 'Rejected'
        : 'Pending',
  };

  // Determine Overall Eligibility
  const academicEligible =
    pctEligible &&
    incomeEligible &&
    categoryEligible &&
    courseEligible &&
    yearEligible;

  let overallStatus = 'Eligible';
  let summary = 'Student meets all academic and document requirements.';

  if (!academicEligible) {
    overallStatus = 'Not Eligible';
    summary = 'Student does not meet the basic academic or demographic criteria.';
  } else if (totalRequired > 0 && verifiedCount < totalRequired) {
    overallStatus = 'Pending';
    if (uploadedCount < totalRequired) {
      summary = `Missing ${totalRequired - uploadedCount} required document(s).`;
    } else if (rejectedCount > 0) {
      summary = `${rejectedCount} document(s) rejected. Re-upload required.`;
    } else {
      summary = `${pendingCount} document(s) awaiting administrative verification.`;
    }
  }

  return {
    overallStatus,
    summary,
    academicEligible,
    criteria,
    isProfileComplete: true,
  };
}

module.exports = {
  checkEligibility,
};
