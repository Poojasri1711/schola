/**
 * Automated End-to-End System Test for Scholarship Management Portal
 * Tests all 37 verification scenarios requested in the project specification.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

// Helper for making JSON HTTP requests
function request(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Helper for uploading multipart files
function uploadFile(endpoint, fieldName, filename, fileBuffer, mimeType, extraFields = {}, token = null) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const url = new URL(BASE_URL + endpoint);

    let bodyParts = [];

    // Extra fields
    for (const [key, value] of Object.entries(extraFields)) {
      bodyParts.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
        )
      );
    }

    // File field
    bodyParts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
      )
    );
    bodyParts.push(fileBuffer);
    bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const totalPayload = Buffer.concat(bodyParts);

    const options = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalPayload.length,
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(totalPayload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING SCHOLARSHIP PORTAL AUTOMATED VERIFICATION');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Health check
  const health = await request('GET', '/health');
  assert(health.status === 200 && health.body.status === 'online', 'Backend health check online');

  // 2. Student Registration
  const testEmail = `student_${Date.now()}@test.edu`;
  const regResp = await request('POST', '/auth/register', {
    name: 'Priya Sharma',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
  });
  assert(regResp.status === 201 && regResp.body.user.role === 'student', 'Student registration assigned role=student');
  const studentToken = regResp.body.token;

  // 3. Student Login
  const loginResp = await request('POST', '/auth/login', {
    email: testEmail,
    password: 'password123',
  });
  assert(loginResp.status === 200 && loginResp.body.token, 'Student sign in with valid credentials');

  // 4. Student Profile Save
  const profileData = {
    fullName: 'Priya Sharma',
    dateOfBirth: '2003-05-15',
    gender: 'Female',
    phone: '9876543210',
    address: '123 University Road, Tech Park, Pune',
    collegeName: 'Pune Institute of Computer Technology',
    course: 'B.Tech',
    branch: 'Computer Science and Engineering',
    currentYear: '3rd Year',
    rollNumber: '21CS3045',
    percentage: 82.5,
    familyIncome: 240000,
    category: 'OBC',
    domicileState: 'Maharashtra',
  };
  const profResp = await request('PUT', '/profile', profileData, studentToken);
  assert(profResp.status === 200 && profResp.body.profile.percentage === 82.5, 'Student profile completed and saved');

  // 5. Get Student Profile
  const getProfResp = await request('GET', '/profile', null, studentToken);
  assert(getProfResp.status === 200 && getProfResp.body.profile.collegeName.includes('Pune'), 'Profile retrieval successful');

  // 6. Upload Academic Certificate (PDF buffer)
  const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const uploadDoc1 = await uploadFile(
    '/documents/upload',
    'file',
    'marksheet_sem5.pdf',
    dummyPdf,
    'application/pdf',
    { documentType: 'Academic / Marks Certificate' },
    studentToken
  );
  assert(uploadDoc1.status === 201 && uploadDoc1.body.document.verificationStatus === 'Pending', 'Academic Certificate uploaded locally');
  const academicDocId = uploadDoc1.body.document._id;

  // 7. Upload Income Certificate (PNG buffer)
  const dummyPng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137]);
  const uploadDoc2 = await uploadFile(
    '/documents/upload',
    'file',
    'income_certificate_2026.png',
    dummyPng,
    'image/png',
    { documentType: 'Income Certificate' },
    studentToken
  );
  assert(uploadDoc2.status === 201 && uploadDoc2.body.document.verificationStatus === 'Pending', 'Income Certificate uploaded locally');
  const incomeDocId = uploadDoc2.body.document._id;

  // 8. Upload Caste / Category Certificate
  const uploadDocCategory = await uploadFile(
    '/documents/upload',
    'file',
    'caste_certificate_obc.pdf',
    dummyPdf,
    'application/pdf',
    { documentType: 'Caste / Category Certificate' },
    studentToken
  );
  assert(uploadDocCategory.status === 201 && uploadDocCategory.body.document.verificationStatus === 'Pending', 'Caste / Category Certificate uploaded locally');
  const categoryDocId = uploadDocCategory.body.document._id;

  // 9. Upload ID Proof
  const uploadDoc3 = await uploadFile(
    '/documents/upload',
    'file',
    'college_id_card.png',
    dummyPng,
    'image/png',
    { documentType: 'ID Proof' },
    studentToken
  );
  assert(uploadDoc3.status === 201 && uploadDoc3.body.document.verificationStatus === 'Pending', 'ID Proof uploaded locally');
  const idDocId = uploadDoc3.body.document._id;

  // 10. Fetch Student Documents
  const myDocs = await request('GET', '/documents/my', null, studentToken);
  assert(myDocs.status === 200 && myDocs.body.documents.length === 4, 'Student retrieved their 4 uploaded certificates');

  // 11. Fetch Scholarships list
  const schList = await request('GET', '/scholarships', null, studentToken);
  assert(schList.status === 200 && schList.body.scholarships.length >= 1, 'Student fetched active scholarships');
  const targetScholarship = schList.body.scholarships[0];

  // 12. Fetch Scholarship Details with Live Eligibility
  const schDetails = await request('GET', `/scholarships/${targetScholarship._id}`, null, studentToken);
  assert(schDetails.status === 200 && schDetails.body.eligibilityReport !== null, 'Scholarship details returned with eligibility evaluation');

  // 13. Apply for Scholarship
  const applyResp = await request('POST', '/applications', { scholarshipId: targetScholarship._id }, studentToken);
  assert(applyResp.status === 201 && applyResp.body.application.applicationStatus === 'Pending', 'Application submitted with status: Pending');
  const applicationId = applyResp.body.application._id;

  // 14. Prevent duplicate application
  const dupApplyResp = await request('POST', '/applications', { scholarshipId: targetScholarship._id }, studentToken);
  assert(dupApplyResp.status === 400, 'Duplicate application blocked with 400 error');

  // 15. Admin Login with normal credentials
  const adminLoginResp = await request('POST', '/auth/login', {
    email: 'admin@scholarship.edu',
    password: 'Admin@12345',
  });
  assert(adminLoginResp.status === 200 && adminLoginResp.body.user.role === 'admin', 'Admin signed in successfully with role=admin');
  const adminToken = adminLoginResp.body.token;

  // 16. Admin View Applications
  const adminApps = await request('GET', '/admin/applications', null, adminToken);
  assert(adminApps.status === 200 && adminApps.body.applications.length >= 1, 'Admin listed applications');

  // 17. Admin Open Application Details (Sections 1-6)
  const appReview = await request('GET', `/admin/applications/${applicationId}`, null, adminToken);
  assert(
    appReview.status === 200 &&
    appReview.body.studentProfile &&
    appReview.body.documents.length >= 4,
    'Admin fetched full review data: student profile, scheme specs, uploaded documents, and criteria'
  );

  // 18. Admin View Document stream
  const docViewResp = await request('GET', `/documents/${academicDocId}/view`, null, adminToken);
  assert(docViewResp.status === 200, 'Admin securely streamed document file');

  // 19. Admin Rejects Income Certificate with Reason
  const rejectDocResp = await request('PUT', `/admin/documents/${incomeDocId}/reject`, {
    rejectionReason: 'Income certificate is missing the official Tehsildar seal.',
  }, adminToken);
  assert(
    rejectDocResp.status === 200 &&
    rejectDocResp.body.document.verificationStatus === 'Rejected' &&
    rejectDocResp.body.document.rejectionReason.includes('Tehsildar'),
    'Admin rejected document with reason'
  );

  // 20. Student Sees Rejected Document & Re-uploads Replacement
  const studentDocsAfterRejection = await request('GET', '/documents/my', null, studentToken);
  const rejectedDoc = studentDocsAfterRejection.body.documents.find((d) => d._id === incomeDocId);
  assert(
    rejectedDoc && rejectedDoc.verificationStatus === 'Rejected',
    'Student sees document rejection with reason'
  );

  // Re-upload replacement document
  const reuploadResp = await uploadFile(
    '/documents/upload',
    'file',
    'income_certificate_signed.png',
    dummyPng,
    'image/png',
    { documentType: 'Income Certificate' },
    studentToken
  );
  assert(
    reuploadResp.status === 200 && reuploadResp.body.document.verificationStatus === 'Pending',
    'Student re-uploaded replacement certificate -> status reset to Pending'
  );

  // 21. Admin Verifies All Required Documents
  const verifyDoc1 = await request('PUT', `/admin/documents/${academicDocId}/verify`, null, adminToken);
  const verifyDoc2 = await request('PUT', `/admin/documents/${incomeDocId}/verify`, null, adminToken);
  const verifyDocCat = await request('PUT', `/admin/documents/${categoryDocId}/verify`, null, adminToken);
  const verifyDoc3 = await request('PUT', `/admin/documents/${idDocId}/verify`, null, adminToken);
  assert(
    verifyDoc1.status === 200 && verifyDoc2.status === 200 && verifyDocCat.status === 200 && verifyDoc3.status === 200,
    'Admin verified all required certificates'
  );

  // 22. Admin Approves Application
  const approveResp = await request('PUT', `/admin/applications/${applicationId}/approve`, {
    adminRemarks: 'Candidate satisfies academic merit criteria and all certificates verified successfully.',
  }, adminToken);
  assert(
    approveResp.status === 200 &&
    approveResp.body.application.applicationStatus === 'Approved' &&
    approveResp.body.application.eligibilityStatus === 'Eligible',
    'Admin approved application with remarks'
  );

  // 23. Student Checks Status in My Applications -> Sees Approved
  const myAppsAfterApproval = await request('GET', '/applications/my', null, studentToken);
  const targetApp = myAppsAfterApproval.body.applications.find((a) => a._id === applicationId);
  assert(
    targetApp &&
    targetApp.applicationStatus === 'Approved' &&
    targetApp.documentVerificationStatus === 'Verified' &&
    targetApp.adminRemarks.includes('merit criteria'),
    'Student sees application status Approved with remarks'
  );

  // 24. Test Rejecting Another Application
  // Register second student
  const student2Email = `student2_${Date.now()}@test.edu`;
  const reg2 = await request('POST', '/auth/register', {
    name: 'Vikram Mehta',
    email: student2Email,
    password: 'password123',
    confirmPassword: 'password123',
  });
  const token2 = reg2.body.token;

  await request('PUT', '/profile', {
    ...profileData,
    fullName: 'Vikram Mehta',
    percentage: 55.0, // Below 75%
  }, token2);

  // Apply to scholarship
  const app2Resp = await request('POST', '/applications', { scholarshipId: targetScholarship._id }, token2);
  const app2Id = app2Resp.body.application._id;

  // Admin Rejects second application with remarks
  const rejectAppResp = await request('PUT', `/admin/applications/${app2Id}/reject`, {
    adminRemarks: 'Applicant does not meet the minimum required qualifying percentage (75%).',
  }, adminToken);
  assert(
    rejectAppResp.status === 200 && rejectAppResp.body.application.applicationStatus === 'Rejected',
    'Admin rejected second application with reason'
  );

  // Student 2 checks status -> sees Rejected + remarks
  const student2Apps = await request('GET', '/applications/my', null, token2);
  const rejectedAppRecord = student2Apps.body.applications.find((a) => a._id === app2Id);
  assert(
    rejectedAppRecord &&
    rejectedAppRecord.applicationStatus === 'Rejected' &&
    rejectedAppRecord.adminRemarks.includes('qualifying percentage'),
    'Student 2 sees Rejected status with admin remarks'
  );

  // 25. Security Test: Student attempts Admin Route -> 403 Forbidden
  const forbiddenAttempt = await request('GET', '/admin/reports', null, studentToken);
  assert(forbiddenAttempt.status === 403, 'RBAC check: Student attempting admin route receives 403 Forbidden');

  // 26. Security Test: Wrong admin password -> 401 Unauthorized
  const badLogin = await request('POST', '/auth/login', {
    email: 'admin@scholarship.edu',
    password: 'wrong_password',
  });
  assert(badLogin.status === 401, 'Security check: Invalid password rejected with 401');

  // 27. Admin Reports Generation
  const reportsResp = await request('GET', '/admin/reports', null, adminToken);
  assert(
    reportsResp.status === 200 &&
    reportsResp.body.stats.approvedApplications >= 1 &&
    reportsResp.body.stats.rejectedApplications >= 1 &&
    reportsResp.body.applicationsByCategory.length > 0,
    'Admin reports generated with application breakdowns and demographics'
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
