const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['patient', 'admin'],
      default: 'patient'
    },
    patientId: {
      type: String,
      sparse: true, // Allow null values and create unique index only for non-null values
      unique: true,
      required: function () {
        return this.role === 'patient'
      }
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || validator.isMobilePhone(v)
        },
        message: 'Please provide a valid phone number'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient queries
userSchema.index({ email: 1 })
userSchema.index({ patientId: 1 })
userSchema.index({ role: 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Instance method to generate patient ID
userSchema.methods.generatePatientId = function () {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PAT-${timestamp.slice(-6)}-${random}`
}

// Pre-save middleware to generate patient ID for new patients
userSchema.pre('validate', function (next) {
  if (this.role === 'patient' && !this.patientId && this.isNew) {
    this.patientId = this.generatePatientId()
  }
  next()
})

// Instance method to get user info without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true })
}

const User = mongoose.model('User', userSchema)

module.exports = User
