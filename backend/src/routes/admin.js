const express = require('express')
const { authenticate, requireAdmin } = require('../middleware/auth')
const {
  getAllSubmissions,
  getSubmissionStats,
  updateSubmissionStatus,
  saveAnnotations,
  getSubmissionForReview,
  assignSubmission
} = require('../controllers/adminController')

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(requireAdmin)

// Dashboard and statistics
router.get('/submissions', getAllSubmissions)
router.get('/stats', getSubmissionStats)

// Individual submission management
router.get('/submissions/:id', getSubmissionForReview)
router.put('/submissions/:id/status', updateSubmissionStatus)
router.put('/submissions/:id/assign', assignSubmission)
router.post('/submissions/:id/annotations', saveAnnotations)

module.exports = router
