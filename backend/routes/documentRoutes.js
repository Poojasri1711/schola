const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const {
  uploadDocument,
  getMyDocuments,
  viewDocument,
  deleteDocument,
} = require('../controllers/documentController');

// All document routes require authentication
router.use(authenticateToken);

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error.',
      });
    }
    next();
  });
}, uploadDocument);

router.get('/my', getMyDocuments);
router.get('/:id/view', viewDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
