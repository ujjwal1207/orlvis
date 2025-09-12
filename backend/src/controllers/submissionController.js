const Submission = require('../models/Submission')
const { getFileUrl, deleteFile } = require('../middleware/upload')
const path = require('path')

// Create a new submission (Patient upload)
const createSubmission = async (req, res) => {
  try {
    const { patientNotes } = req.body
    const user = req.user
    const uploadedFile = req.file

    // Validate user role
    if (user.role !== 'patient') {
      return res.status(403).json({
        status: 'error',
        message: 'Only patients can create submissions'
      })
    }

    // Validate file upload
    if (!uploadedFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Image file is required'
      })
    }

    // Create submission data
    const submissionData = {
      patient: user._id,
      patientName: user.name,
      patientId: user.patientId,
      patientEmail: user.email,
      originalImage: {
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        mimetype: uploadedFile.mimetype,
        size: uploadedFile.size,
        path: uploadedFile.path,
        url: getFileUrl(uploadedFile.filename)
      },
      patientNotes: patientNotes || '',
      status: 'uploaded',
      submittedAt: new Date(),
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      }
    }

    // Create new submission
    const submission = new Submission(submissionData)
    await submission.save()

    // Populate patient data
    await submission.populate('patient', 'name email patientId')

    res.status(201).json({
      status: 'success',
      message: 'Submission created successfully',
      data: {
        submission: submission.getPublicData()
      }
    })
  } catch (error) {
    console.error('Create submission error:', error)

    // Clean up uploaded file if submission creation fails
    if (req.file) {
      try {
        await deleteFile(req.file.path)
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError)
      }
    }

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
      message: 'Failed to create submission'
    })
  }
}

// Get patient's submissions
const getMySubmissions = async (req, res) => {
  try {
    const user = req.user

    // Validate user role
    if (user.role !== 'patient') {
      return res.status(403).json({
        status: 'error',
        message: 'Only patients can view their submissions'
      })
    }

    const submissions = await Submission.findByPatient(user._id)

    const submissionsData = submissions.map(submission =>
      submission.getPublicData()
    )

    res.status(200).json({
      status: 'success',
      data: {
        submissions: submissionsData,
        count: submissions.length
      }
    })
  } catch (error) {
    console.error('Get my submissions error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submissions'
    })
  }
}

// Get specific submission (patient can only see their own)
const getSubmission = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const submission = await Submission.findById(id).populate(
      'patient',
      'name email patientId'
    )

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    // Check access permissions
    if (
      user.role === 'patient' &&
      submission.patient._id.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own submissions.'
      })
    }

    // Return appropriate data based on user role
    const submissionData =
      user.role === 'admin'
        ? submission.getAdminData()
        : submission.getPublicData()

    res.status(200).json({
      status: 'success',
      data: {
        submission: submissionData
      }
    })
  } catch (error) {
    console.error('Get submission error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submission'
    })
  }
}

// Update submission notes (patient can only update their own)
const updateSubmissionNotes = async (req, res) => {
  try {
    const { id } = req.params
    const { patientNotes } = req.body
    const user = req.user

    const submission = await Submission.findById(id)

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    // Check access permissions
    if (
      user.role === 'patient' &&
      submission.patient.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update your own submissions.'
      })
    }

    // Only allow updates if submission is still in uploaded status
    if (submission.status !== 'uploaded') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot update submission. It is already being processed.'
      })
    }

    // Update notes
    if (patientNotes !== undefined) {
      submission.patientNotes = patientNotes
    }

    await submission.save()

    const submissionData =
      user.role === 'admin'
        ? submission.getAdminData()
        : submission.getPublicData()

    res.status(200).json({
      status: 'success',
      message: 'Submission updated successfully',
      data: {
        submission: submissionData
      }
    })
  } catch (error) {
    console.error('Update submission error:', error)

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
      message: 'Failed to update submission'
    })
  }
}

// Delete submission (patient can only delete their own, only if not processed)
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const submission = await Submission.findById(id)

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    // Check access permissions
    if (
      user.role === 'patient' &&
      submission.patient.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only delete your own submissions.'
      })
    }

    // Only allow deletion if submission is still in uploaded status
    if (submission.status !== 'uploaded') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete submission. It is already being processed.'
      })
    }

    // Delete associated files
    try {
      if (submission.originalImage.path) {
        await deleteFile(submission.originalImage.path)
      }
      if (submission.annotatedImage.path) {
        await deleteFile(submission.annotatedImage.path)
      }
      if (submission.reportPath) {
        await deleteFile(submission.reportPath)
      }
    } catch (deleteError) {
      console.error('Error deleting files:', deleteError)
      // Continue with submission deletion even if file deletion fails
    }

    // Delete submission
    await Submission.findByIdAndDelete(id)

    res.status(200).json({
      status: 'success',
      message: 'Submission deleted successfully'
    })
  } catch (error) {
    console.error('Delete submission error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete submission'
    })
  }
}

module.exports = {
  createSubmission,
  getMySubmissions,
  getSubmission,
  updateSubmissionNotes,
  deleteSubmission
}
