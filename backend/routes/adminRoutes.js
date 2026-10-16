const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const {
  getAllApplicationsAdmin,
  getApplicationDetailsAdmin,
  approveApplicationAdmin,
  rejectApplicationAdmin,
} = require('../controllers/applicationController');
const {
  verifyDocumentAdmin,
  rejectDocumentAdmin,
} = require('../controllers/documentController');
const { getAdminReports } = require('../controllers/reportController');

// All routes here strictly require Admin authentication and authorization
router.use(authenticateToken);
router.use(authorizeAdmin);

// Admin Application management
router.get('/applications', getAllApplicationsAdmin);
router.get('/applications/:id', getApplicationDetailsAdmin);
router.put('/applications/:id/approve', approveApplicationAdmin);
router.put('/applications/:id/reject', rejectApplicationAdmin);

// Admin Document verification
router.put('/documents/:id/verify', verifyDocumentAdmin);
router.put('/documents/:id/reject', rejectDocumentAdmin);

// Admin Analytics & Reports
router.get('/reports', getAdminReports);

module.exports = router;
