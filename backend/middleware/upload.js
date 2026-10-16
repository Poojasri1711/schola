const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// Configure upload directory for local and Vercel environments
const uploadsDir = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate secure unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedExt = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, sanitizedExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    cb(null, `${baseName}-${uniqueSuffix}${sanitizedExt}`);
  },
});

// Allowed mime types & extensions
const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Explicitly reject executable / script extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.sh', '.js', '.vbs', '.cmd', '.msi', '.com', '.php', '.phtml', '.py'
  ];
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error('Executable or script files are strictly prohibited.'), false);
  }

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

module.exports = upload;
