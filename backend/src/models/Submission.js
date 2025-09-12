const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
  {
    // Patient Information
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      trim: true
    },
    patientEmail: {
      type: String,
      required: [true, 'Patient email is required'],
      trim: true,
      lowercase: true
    },

    // Image Information
    originalImage: {
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      mimetype: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      url: String // For S3 or external storage
    },

    // Annotated Image (after admin review)
    annotatedImage: {
      filename: String,
      path: String,
      url: String, // For S3 or external storage
      annotations: {
        type: mongoose.Schema.Types.Mixed, // JSON data for canvas annotations
        default: null
      }
    },

    // Notes and Details
    patientNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Patient notes cannot exceed 1000 characters']
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters']
    },

    // Status Tracking
    status: {
      type: String,
      enum: ['uploaded', 'reviewing', 'annotated', 'reported', 'completed'],
      default: 'uploaded'
    },

    // Report Information
    reportGenerated: {
      type: Boolean,
      default: false
    },
    reportPath: String,
    reportUrl: String, // For S3 or external storage
    reportGeneratedAt: Date,

    // Admin who processed the submission
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,

    // Timestamps
    submittedAt: {
      type: Date,
      default: Date.now
    },

    // Additional metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
      browserInfo: String
    }
  },
  {
    timestamps: true
  }
)

// Indexes for efficient queries
submissionSchema.index({ patient: 1 })
submissionSchema.index({ patientId: 1 })
submissionSchema.index({ status: 1 })
submissionSchema.index({ submittedAt: -1 })
submissionSchema.index({ reviewedBy: 1 })

// Virtual for submission age
submissionSchema.virtual('ageInHours').get(function () {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60))
})

// Virtual for submission age in days
submissionSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60 * 24))
})

// Instance method to update status
submissionSchema.methods.updateStatus = function (newStatus, adminId = null) {
  this.status = newStatus

  if (adminId) {
    this.reviewedBy = adminId
    this.reviewedAt = new Date()
  }

  // Update specific timestamps based on status
  switch (newStatus) {
    case 'reviewing':
      if (!this.reviewedAt && adminId) {
        this.reviewedAt = new Date()
      }
      break
    case 'reported':
      this.reportGenerated = true
      if (!this.reportGeneratedAt) {
        this.reportGeneratedAt = new Date()
      }
      break
  }

  return this.save()
}

// Instance method to add annotations
submissionSchema.methods.addAnnotations = function (annotationsData, adminId) {
  this.annotatedImage.annotations = annotationsData
  this.status = 'annotated'
  this.reviewedBy = adminId
  this.reviewedAt = new Date()

  return this.save()
}

// Instance method to set annotated image
submissionSchema.methods.setAnnotatedImage = function (imageData) {
  this.annotatedImage = {
    ...this.annotatedImage,
    ...imageData
  }

  return this.save()
}

// Static method to get submissions by status
submissionSchema.statics.findByStatus = function (status) {
  return this.find({ status })
    .populate('patient', 'name email role')
    .populate('reviewedBy', 'name email')
}

// Static method to get patient's submissions
submissionSchema.statics.findByPatient = function (patientId) {
  return this.find({ patient: patientId }).sort({ submittedAt: -1 })
}

// Static method to get submissions for admin dashboard
submissionSchema.statics.getAdminDashboard = function (options = {}) {
  const {
    status,
    limit = 50,
    skip = 0,
    sortBy = 'submittedAt',
    sortOrder = -1
  } = options

  const query = status ? { status } : {}

  return this.find(query)
    .populate('patient', 'name email role patientId')
    .populate('reviewedBy', 'name email')
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
}

// Pre-save middleware to ensure patient data consistency
submissionSchema.pre('save', async function (next) {
  if (this.isNew && this.patient) {
    try {
      const User = mongoose.model('User')
      const patient = await User.findById(this.patient)

      if (patient) {
        this.patientName = patient.name
        this.patientId = patient.patientId
        this.patientEmail = patient.email
      }
    } catch (error) {
      console.error('Error populating patient data:', error)
    }
  }
  next()
})

// Instance method to get public data (for patient view)
submissionSchema.methods.getPublicData = function () {
  return {
    id: this._id,
    patientName: this.patientName,
    patientId: this.patientId,
    patientNotes: this.patientNotes,
    status: this.status,
    submittedAt: this.submittedAt,
    reportGenerated: this.reportGenerated,
    reportUrl: this.reportUrl,
    ageInHours: this.ageInHours,
    ageInDays: this.ageInDays
  }
}

// Instance method to get admin data (for admin view)
submissionSchema.methods.getAdminData = function () {
  return {
    id: this._id,
    patient: this.patient,
    patientName: this.patientName,
    patientId: this.patientId,
    patientEmail: this.patientEmail,
    originalImage: this.originalImage,
    annotatedImage: this.annotatedImage,
    patientNotes: this.patientNotes,
    adminNotes: this.adminNotes,
    status: this.status,
    reportGenerated: this.reportGenerated,
    reportPath: this.reportPath,
    reportUrl: this.reportUrl,
    reviewedBy: this.reviewedBy,
    reviewedAt: this.reviewedAt,
    submittedAt: this.submittedAt,
    reportGeneratedAt: this.reportGeneratedAt,
    ageInHours: this.ageInHours,
    ageInDays: this.ageInDays,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

const Submission = mongoose.model('Submission', submissionSchema)

module.exports = Submission
