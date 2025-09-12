const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const name = file.fieldname + '-' + uniqueSuffix + ext
    cb(null, name)
  }
})

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.'),
      false
    )
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only one file per upload
  },
  fileFilter: fileFilter
})

// Middleware for single file upload
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName)

    singleUpload(req, res, error => {
      if (error) {
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              status: 'error',
              message: 'File too large. Maximum size is 10MB.'
            })
          }
          if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              status: 'error',
              message: 'Too many files. Only one file is allowed.'
            })
          }
          if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              status: 'error',
              message: 'Unexpected field name for file upload.'
            })
          }
        }

        return res.status(400).json({
          status: 'error',
          message: error.message || 'File upload failed'
        })
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No file uploaded'
        })
      }

      next()
    })
  }
}

// Utility function to delete file
const deleteFile = filePath => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, error => {
      if (error && error.code !== 'ENOENT') {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

// Utility function to get file URL
const getFileUrl = (filename, type = 'uploads') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000'
  return `${baseUrl}/${type}/${filename}`
}

module.exports = {
  upload,
  uploadSingle,
  deleteFile,
  getFileUrl,
  uploadDir
}
