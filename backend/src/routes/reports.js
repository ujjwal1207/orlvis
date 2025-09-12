const express = require('express')
const {
  authenticate,
  requireAuth,
  requireAdmin
} = require('../middleware/auth')
const {
  generateReport,
  downloadReport,
  previewReport,
  getReportInfo,
  deleteReport
} = require('../controllers/reportController')

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Report generation (admin only)
router.post('/:id/generate', requireAdmin, generateReport)

// Report access (patient can access their own, admin can access all)
router.get('/:id/download', requireAuth, downloadReport)
router.get('/:id/preview', requireAuth, previewReport)
router.get('/:id/info', requireAuth, getReportInfo)

// Report management (admin only)
router.delete('/:id', requireAdmin, deleteReport)

module.exports = router
