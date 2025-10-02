const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Created uploads directory');
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: {type}-{timestamp}-{random}.{ext}
    const ext = path.extname(file.originalname);
    const type = req.body.upload_type || 'file'; // category, product, variant
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `${type}-${timestamp}-${random}${ext}`;
    
    cb(null, filename);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

// Multer config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Middleware untuk single file upload
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large. Maximum 5MB allowed.'
          });
        }
        return res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      // File uploaded successfully or no file provided
      if (req.file) {
        logger.info(`File uploaded: ${req.file.filename}`);
      }
      next();
    });
  };
};

// Middleware untuk multiple files upload
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large. Maximum 5MB per file.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: `Too many files. Maximum ${maxCount} files allowed.`
          });
        }
        return res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      // Files uploaded successfully
      if (req.files && req.files.length > 0) {
        logger.info(`${req.files.length} files uploaded`);
      }
      next();
    });
  };
};

// Middleware untuk dynamic fields upload (for bulk variant images)
const uploadFields = (maxCount = 20) => {
  return (req, res, next) => {
    // Dynamic fields: image_0, image_1, image_2, etc.
    const fields = [];
    for (let i = 0; i < maxCount; i++) {
      fields.push({ name: `image_${i}`, maxCount: 1 });
    }
    
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large. Maximum 5MB per file.'
          });
        }
        return res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      // Files uploaded successfully
      if (req.files) {
        const fileCount = Object.keys(req.files).length;
        if (fileCount > 0) {
          logger.info(`${fileCount} variant images uploaded`);
        }
      }
      next();
    });
  };
};

// Helper to delete file
const deleteFile = (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error deleting file ${filename}:`, error);
    return false;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile
};

