const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  applyScholarship,
  getMyApplications,
  getApplicationById,
  cancelApplication,
} = require('../controllers/applicationController');

router.use(authenticateToken);

// Standard REST endpoints
router.post('/', applyScholarship);
router.get('/my', getMyApplications);
router.get('/:id', getApplicationById);
router.put('/:id/cancel', cancelApplication);
router.delete('/:id', cancelApplication);

// Syllabus / Specification endpoint aliases
router.post('/applyScholarship', applyScholarship);
router.get('/myApplications', getMyApplications);
router.delete('/cancelApplication/:id', cancelApplication);

module.exports = router;
