const Submission = require('../models/Submission')
const PDFReportGenerator = require('../utils/pdfGenerator')
const path = require('path')
const fs = require('fs').promises

// Generate PDF report for a submission
const generateReport = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user._id

    const submission = await Submission.findById(id)
      .populate('patient', 'name email patientId phone')
      .populate('reviewedBy', 'name email')

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    // Check if submission is ready for report generation
    if (!['annotated', 'reported', 'completed'].includes(submission.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Submission must be annotated before generating report'
      })
    }

    // Generate PDF report
    const pdfGenerator = new PDFReportGenerator()
    const reportData = await pdfGenerator.generateReport(submission)

    // Update submission with report information
    submission.reportPath = reportData.path
    submission.reportUrl = reportData.url
    submission.reportGenerated = true
    submission.reportGeneratedAt = new Date()

    // Update status to reported if not already
    if (submission.status !== 'completed') {
      await submission.updateStatus('reported', adminId)
    }

    await submission.save()

    res.status(200).json({
      status: 'success',
      message: 'Report generated successfully',
      data: {
        submission: submission.getAdminData(),
        report: {
          filename: reportData.filename,
          url: reportData.url,
          downloadUrl: `/api/reports/${submission._id}/download`
        }
      }
    })
  } catch (error) {
    console.error('Generate report error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate report'
    })
  }
}

// Download PDF report
const downloadReport = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const submission = await Submission.findById(id)
      .populate('patient', 'name email patientId phone')
      .populate('reviewedBy', 'name email')

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
        message: 'Access denied. You can only download your own reports.'
      })
    }

    // Check if submission is ready for report generation
    if (!['annotated', 'reported', 'completed'].includes(submission.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Submission must be annotated before report can be downloaded'
      })
    }

    let reportPath = submission.reportPath

    // Check if report file exists, regenerate if not
    if (!reportPath) {
      // Report never generated, generate it now
      const pdfGenerator = new PDFReportGenerator()
      const reportData = await pdfGenerator.generateReport(submission)

      // Update submission with report information
      submission.reportPath = reportData.path
      submission.reportUrl = reportData.url
      submission.reportGenerated = true
      submission.reportGeneratedAt = new Date()

      // Update status to reported if not already
      if (submission.status !== 'completed') {
        await submission.updateStatus('reported', user._id)
      }

      await submission.save()
      reportPath = reportData.path
    } else {
      // Check if file exists on disk
      try {
        await fs.access(reportPath)
      } catch (error) {
        // File doesn't exist, regenerate it
        console.log('Report file not found, regenerating...')
        const pdfGenerator = new PDFReportGenerator()
        const reportData = await pdfGenerator.generateReport(submission)

        // Update submission with new report information
        submission.reportPath = reportData.path
        submission.reportUrl = reportData.url
        submission.reportGeneratedAt = new Date()
        await submission.save()
        reportPath = reportData.path
      }
    }

    // Set response headers for PDF download
    const filename = `OralVis-Report-${submission.patientId}-${Date.now()}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-cache')

    // Stream the file
    const fileStream = require('fs').createReadStream(reportPath)
    fileStream.pipe(res)

    fileStream.on('error', error => {
      console.error('File stream error:', error)
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Error streaming file'
        })
      }
    })
  } catch (error) {
    console.error('Download report error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to download report'
    })
  }
}

// Preview PDF report (view in browser)
const previewReport = async (req, res) => {
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
        message: 'Access denied. You can only preview your own reports.'
      })
    }

    if (!submission.reportGenerated || !submission.reportPath) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not available'
      })
    }

    // Check if file exists
    try {
      await fs.access(submission.reportPath)
    } catch (error) {
      return res.status(404).json({
        status: 'error',
        message: 'Report file not found'
      })
    }

    // Set response headers for PDF preview
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('Cache-Control', 'no-cache')

    // Stream the file
    const fileStream = require('fs').createReadStream(submission.reportPath)
    fileStream.pipe(res)

    fileStream.on('error', error => {
      console.error('File stream error:', error)
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Error streaming file'
        })
      }
    })
  } catch (error) {
    console.error('Preview report error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to preview report'
    })
  }
}

// Get report information
const getReportInfo = async (req, res) => {
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
        message: 'Access denied. You can only view your own reports.'
      })
    }

    if (!submission.reportGenerated) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not generated yet'
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        report: {
          generated: submission.reportGenerated,
          generatedAt: submission.reportGeneratedAt,
          url: submission.reportUrl,
          downloadUrl: `/api/reports/${submission._id}/download`,
          previewUrl: `/api/reports/${submission._id}/preview`
        }
      }
    })
  } catch (error) {
    console.error('Get report info error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to get report information'
    })
  }
}

// Delete report (admin only)
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params

    const submission = await Submission.findById(id)

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      })
    }

    if (!submission.reportGenerated || !submission.reportPath) {
      return res.status(404).json({
        status: 'error',
        message: 'No report to delete'
      })
    }

    // Delete the file
    try {
      await fs.unlink(submission.reportPath)
    } catch (error) {
      console.error('Error deleting report file:', error)
      // Continue with database update even if file deletion fails
    }

    // Update submission
    submission.reportPath = null
    submission.reportUrl = null
    submission.reportGenerated = false
    submission.reportGeneratedAt = null

    // Revert status if it was reported
    if (submission.status === 'reported') {
      submission.status = 'annotated'
    }

    await submission.save()

    res.status(200).json({
      status: 'success',
      message: 'Report deleted successfully'
    })
  } catch (error) {
    console.error('Delete report error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete report'
    })
  }
}

module.exports = {
  generateReport,
  downloadReport,
  previewReport,
  getReportInfo,
  deleteReport
}
