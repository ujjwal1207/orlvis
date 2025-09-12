const { verifyToken } = require('../utils/jwt')
const User = require('../models/User')

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided or invalid format.'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token)

      // Get current user data
      const user = await User.findById(decoded.id)

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. User not found.'
        })
      }

      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated.'
        })
      }

      // Add user to request object
      req.user = user
      next()
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token has expired. Please login again.'
        })
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token.'
        })
      }

      throw jwtError
    }
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    })
  }
}

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required role: ${roles.join(' or ')}`
      })
    }

    next()
  }
}

// Middleware to check if user is patient
const requirePatient = authorize('patient')

// Middleware to check if user is admin
const requireAdmin = authorize('admin')

// Middleware to allow both patient and admin
const requireAuth = authorize('patient', 'admin')

module.exports = {
  authenticate,
  authorize,
  requirePatient,
  requireAdmin,
  requireAuth
}
