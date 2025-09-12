const User = require('../models/User')
const { createTokenResponse } = require('../utils/jwt')
const validator = require('validator')

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required'
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
      })
    }

    if (role && !['patient', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Role must be either patient or admin'
      })
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      })
    }

    // Create new user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'patient'
    }

    if (phone) {
      userData.phone = phone.trim()
    }

    const user = new User(userData)
    await user.save()

    // Generate token response
    const tokenResponse = createTokenResponse(user)

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: tokenResponse
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      })
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({
        status: 'error',
        message: `${field} already exists`
      })
    }

    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      })
    }

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password')

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token response
    const tokenResponse = createTokenResponse(user)

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: tokenResponse
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    })
  }
}

// Get current user
const me = async (req, res) => {
  try {
    const user = req.user

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          patientId: user.patientId,
          phone: user.phone,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user information'
    })
  }
}

// Logout user (client-side token removal)
const logout = async (req, res) => {
  try {
    // In JWT stateless authentication, logout is handled on client-side
    // This endpoint is mainly for consistency and could be used for logging
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    })
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = req.user

    const updateData = {}

    if (name && name.trim()) {
      updateData.name = name.trim()
    }

    if (phone !== undefined) {
      if (phone && !validator.isMobilePhone(phone)) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide a valid phone number'
        })
      }
      updateData.phone = phone
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      })
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          patientId: updatedUser.patientId,
          phone: updatedUser.phone,
          createdAt: updatedUser.createdAt
        }
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      })
    }

    res.status(500).json({
      status: 'error',
      message: 'Profile update failed'
    })
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
  updateProfile
}
