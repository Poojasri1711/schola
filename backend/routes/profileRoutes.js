const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// All profile routes require authentication
router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
