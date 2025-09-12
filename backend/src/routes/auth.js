const express = require('express')
const rateLimit = require('express-rate-limit')
const { authenticate } = require('../middleware/auth')
const {
  register,
  login,
  logout,
  me,
  updateProfile
} = require('../controllers/authController')

const router = express.Router()

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Public routes
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)

// Protected routes
router.use(authenticate) // All routes below require authentication

router.post('/logout', logout)
router.get('/me', me)
router.put('/profile', updateProfile)

module.exports = router
