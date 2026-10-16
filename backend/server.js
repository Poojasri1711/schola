require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const documentRoutes = require('./routes/documentRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import specific controllers for syllabus root aliases
const { authenticateToken } = require('./middleware/auth');
const {
  applyScholarship,
  getMyApplications,
  cancelApplication,
} = require('./controllers/applicationController');

const app = express();

// Ensure uploads folder exists automatically
// Configure uploads directory for local and Vercel environments
const uploadsPath = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Global Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Scholarship Management Portal API',
  });
});

// Mount Main Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Syllabus / Specification Direct Route Aliases
app.post('/api/applyScholarship', authenticateToken, applyScholarship);
app.get('/api/myApplications', authenticateToken, getMyApplications);
app.delete('/api/cancelApplication/:id', authenticateToken, cancelApplication);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Database Connection & Server Initialization
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scholarship_portal';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Database.');
    app.listen(PORT, () => {
      console.log(`Scholarship Portal Backend is running on port ${PORT}`);
      console.log(`Uploads directory configured at: ${uploadsPath}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
