const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

// Import routes
const authRoutes = require('./routes/auth')
const submissionRoutes = require('./routes/submissions')
const adminRoutes = require('./routes/admin')
const reportRoutes = require('./routes/reports')

const app = express()

// Ensure necessary directories exist
const uploadsDir = path.join(__dirname, '../uploads')
const reportsDir = path.join(__dirname, '../reports')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', // Development
  process.env.FRONTEND_URL, // Production frontend URL
  'https://orlvis.onrender.com', // Render frontend deployment
  'https://orlvis-frontend.onrender.com' // Alternative Render naming
].filter(Boolean) // Remove any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/reports', express.static(path.join(__dirname, '../reports')))

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/orlvis'

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB')
    console.log(
      `🔗 Database: ${
        MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'
      }`
    )
  })
  .catch(error => {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  })

// Routes
app.use('/auth', authRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reports', reportRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'OralVis API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Error:', error)

  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`
  )
})

module.exports = app
