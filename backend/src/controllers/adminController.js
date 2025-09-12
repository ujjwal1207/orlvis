const Submission = require('../models/Submission')
const sharp = require('sharp')
// const { Canvas, createCanvas, loadImage } = require('canvas') // Temporarily disabled for Windows compatibility
const path = require('path')
const fs = require('fs').promises
const { getFileUrl, deleteFile } = require('../middleware/upload')

// Get all submissions for admin dashboard
const getAllSubmissions = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query

    const skip = (page - 1) * limit
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

    const options = {
      status,
      limit: parseInt(limit),
      skip,
      sortBy,
      sortOrder: sortOrder === 'desc' ? -1 : 1
    }

    const submissions = await Submission.getAdminDashboard(options)
    const total = await Submission.countDocuments(status ? { status } : {})

    const submissionsData = submissions.map(submission =>
      submission.getAdminData()
    )

    res.status(200).json({
      status: 'success',
      data: {
        submissions: submissionsData,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: submissions.length,
          totalSubmissions: total
        }
      }
    })
  } catch (error) {
    console.error('Get all submissions error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submissions'
    })
  }
}

// Get submission statistics for admin dashboard
const getSubmissionStats = async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const totalSubmissions = await Submission.countDocuments()
    const recentSubmissions = await Submission.countDocuments({
      submittedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })

    const statusStats = {}
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count
    })

    res.status(200).json({
      status: 'success',
      data: {
        total: totalSubmissions,
        recent: recentSubmissions,
        byStatus: statusStats,
        statusLabels: {
          uploaded: 'Uploaded',
          reviewing: 'Under Review',
          annotated: 'Annotated',
          reported: 'Report Generated',
          completed: 'Completed'
        }
      }
    })
  } catch (error) {
    console.error('Get submission stats error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve statistics'
    })
  }
}

// Update submission status
const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNotes } = req.body
    const adminId = req.user._id

    const submission = await Submission.findById(id)

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    // Validate status
    const validStatuses = [
      'uploaded',
      'reviewing',
      'annotated',
      'reported',
      'completed'
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      })
    }

    // Update submission
    await submission.updateStatus(status, adminId)

    if (adminNotes) {
      submission.adminNotes = adminNotes
      await submission.save()
    }

    await submission.populate('patient', 'name email patientId')
    await submission.populate('reviewedBy', 'name email')

    res.status(200).json({
      status: 'success',
      message: 'Submission status updated successfully',
      data: {
        submission: submission.getAdminData()
      }
    })
  } catch (error) {
    console.error('Update submission status error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to update submission status'
    })
  }
}

// Save annotations for a submission
const saveAnnotations = async (req, res) => {
  try {
    const { id } = req.params
    const { annotations, adminNotes } = req.body
    const adminId = req.user._id

    const submission = await Submission.findById(id)

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    // Validate annotations data
    if (!annotations || typeof annotations !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid annotations data'
      })
    }

    // Save annotations
    await submission.addAnnotations(annotations, adminId)

    if (adminNotes) {
      submission.adminNotes = adminNotes
      await submission.save()
    }

    // Generate annotated image
    try {
      const annotatedImagePath = await generateAnnotatedImage(
        submission,
        annotations
      )

      submission.annotatedImage.filename = path.basename(annotatedImagePath)
      submission.annotatedImage.path = annotatedImagePath
      submission.annotatedImage.url = getFileUrl(
        path.basename(annotatedImagePath)
      )
      await submission.save()
    } catch (imageError) {
      console.error('Error generating annotated image:', imageError)
      // Continue without failing the annotation save
    }

    await submission.populate('patient', 'name email patientId')
    await submission.populate('reviewedBy', 'name email')

    res.status(200).json({
      status: 'success',
      message: 'Annotations saved successfully',
      data: {
        submission: submission.getAdminData()
      }
    })
  } catch (error) {
    console.error('Save annotations error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to save annotations'
    })
  }
}

// Generate annotated image from canvas data (simplified version without canvas dependency)
const generateAnnotatedImage = async (submission, annotations) => {
  try {
    // For now, just copy the original image as a placeholder
    // In production, you would implement proper image annotation
    const originalImagePath = submission.originalImage.path
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const filename = `annotated-${timestamp}-${randomStr}.png`
    const outputPath = path.join(path.dirname(originalImagePath), filename)

    // Copy original image as annotated version (placeholder)
    const originalBuffer = await fs.readFile(originalImagePath)
    await fs.writeFile(outputPath, originalBuffer)

    console.log('Annotations saved (placeholder implementation):', annotations)

    return outputPath
  } catch (error) {
    console.error('Error generating annotated image:', error)
    throw error
  }
}

// Get submission for admin review
const getSubmissionForReview = async (req, res) => {
  try {
    const { id } = req.params

    const submission = await Submission.findById(id)
      .populate('patient', 'name email patientId phone')
      .populate('reviewedBy', 'name email')

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        submission: submission.getAdminData()
      }
    })
  } catch (error) {
    console.error('Get submission for review error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve submission'
    })
  }
}

// Assign submission to admin for review
const assignSubmission = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user._id

    const submission = await Submission.findById(id)

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    if (submission.status !== 'uploaded') {
      return res.status(400).json({
        status: 'error',
        message: 'Submission is already assigned or processed'
      })
    }

    await submission.updateStatus('reviewing', adminId)

    await submission.populate('patient', 'name email patientId')
    await submission.populate('reviewedBy', 'name email')

    res.status(200).json({
      status: 'success',
      message: 'Submission assigned successfully',
      data: {
        submission: submission.getAdminData()
      }
    })
  } catch (error) {
    console.error('Assign submission error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to assign submission'
    })
  }
}

module.exports = {
  getAllSubmissions,
  getSubmissionStats,
  updateSubmissionStatus,
  saveAnnotations,
  getSubmissionForReview,
  assignSubmission
}
