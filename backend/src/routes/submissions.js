const express = require('express')
const {
  authenticate,
  requirePatient,
  requireAuth
} = require('../middleware/auth')
const { uploadSingle } = require('../middleware/upload')
const {
  createSubmission,
  getMySubmissions,
  getSubmission,
  updateSubmissionNotes,
  deleteSubmission
} = require('../controllers/submissionController')

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Patient routes for submissions
router.post('/', requirePatient, uploadSingle('image'), createSubmission)
router.get('/my', requirePatient, getMySubmissions)

// Routes accessible by both patient and admin (with different access levels)
router.get('/:id', requireAuth, getSubmission)

// Patient-only routes for managing their submissions
router.put('/:id/notes', requirePatient, updateSubmissionNotes)
router.delete('/:id', requirePatient, deleteSubmission)

module.exports = router
