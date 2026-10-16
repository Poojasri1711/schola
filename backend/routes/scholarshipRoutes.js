const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} = require('../controllers/scholarshipController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Optional auth helper to detect logged in user without blocking public access
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'scholarship_jwt_secret_key_btech_2026_secure'
        );
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid/expired - continue as unauthenticated guest
      }
    }
  }
  next();
};

// Public / Student endpoints
router.get('/', optionalAuth, getScholarships);
router.get('/:id', optionalAuth, getScholarshipById);

// Admin endpoints
router.post('/', authenticateToken, authorizeAdmin, createScholarship);
router.put('/:id', authenticateToken, authorizeAdmin, updateScholarship);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteScholarship);

module.exports = router;
