import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  adminAPI,
  reportAPI,
  openPDFInNewTab,
  downloadFile
} from '../utils/api'
import {
  ArrowLeft,
  Edit3,
  User,
  Calendar,
  FileText,
  Save,
  Download,
  RefreshCw,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSubmissionView = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin')
      return
    }
    fetchSubmission()
  }, [id, user, navigate])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSubmission(id)
      setSubmission(response.data.data.submission)
      setAdminNotes(response.data.data.submission.adminNotes || '')
    } catch (error) {
      console.error('Error fetching submission:', error)
      toast.error('Failed to load submission')
      navigate('/admin')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async newStatus => {
    try {
      await adminAPI.updateSubmissionStatus(id, { status: newStatus })
      setSubmission(prev => ({ ...prev, status: newStatus }))
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleSaveNotes = async () => {
    try {
      setSaving(true)
      await adminAPI.updateSubmissionStatus(id, {
        status: submission.status,
        adminNotes
      })
      setSubmission(prev => ({ ...prev, adminNotes }))
      toast.success('Notes saved successfully')
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  const handleViewReport = () => {
    if (!submission?._id) {
      toast.error('Submission not available')
      return
    }

    // Navigate to the new dental report UI
    navigate(`/admin/reports/${submission._id}`)
  }

  const handleDownloadReport = async () => {
    if (!submission?.reportPath || !submission?._id) {
      toast.error('Report not available')
      return
    }

    try {
      console.log('Downloading report for submission:', submission._id)
      const response = await reportAPI.downloadReport(submission._id)

      // Generate filename with patient and submission info
      const fileName = `report-${submission.patientId}-${
        submission._id
      }-${Date.now()}.pdf`
      downloadFile(response.data, fileName)
      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  const handleRegenerateReport = async () => {
    if (!submission?._id) {
      toast.error('Submission not available')
      return
    }

    if (
      !window.confirm(
        'Are you sure you want to regenerate the report? This will overwrite the existing report.'
      )
    ) {
      return
    }

    try {
      toast.loading('Regenerating report...')
      console.log('Regenerating report for submission:', submission._id)

      await reportAPI.generateReport(submission._id)

      // Refresh submission data to get updated report path
      const response = await adminAPI.getSubmissionById(id)
      const submissionData =
        response.data.data.submission ||
        response.data.submission ||
        response.data
      setSubmission(submissionData)

      toast.dismiss()
      toast.success('Report regenerated successfully')
    } catch (error) {
      console.error('Error regenerating report:', error)
      toast.dismiss()
      toast.error('Failed to regenerate report')
    }
  }

  const handleDeleteReport = async () => {
    if (!submission?.reportPath || !submission?._id) {
      toast.error('Report not available')
      return
    }

    if (
      !window.confirm(
        'Are you sure you want to delete the report? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      console.log('Deleting report for submission:', submission._id)
      await reportAPI.deleteReport(submission._id)

      // Update submission to remove report path
      const updatedSubmission = { ...submission, reportPath: null }
      setSubmission(updatedSubmission)

      toast.success('Report deleted successfully')
    } catch (error) {
      console.error('Error deleting report:', error)
      toast.error('Failed to delete report')
    }
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className='admin-submission-view'>
        <div className='container'>
          <div className='loading-state'>
            <div className='spinner'></div>
            <p>Loading submission...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className='admin-submission-view'>
        <div className='container'>
          <div className='error-state'>
            <h2>Submission not found</h2>
            <button
              onClick={() => navigate('/admin')}
              className='btn btn-primary'
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='admin-submission-view'>
      <div className='container'>
        {/* Header */}
        <div className='view-header'>
          <button
            onClick={() => navigate('/admin')}
            className='btn btn-secondary btn-sm'
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className='submission-info'>
            <h1>Review Submission</h1>
            <p>ID: {submission._id.slice(-8).toUpperCase()}</p>
          </div>

          <div className='header-actions'>
            <button
              onClick={() => navigate(`/admin/annotate/${submission._id}`)}
              className='btn btn-primary'
            >
              <Edit3 size={16} />
              Annotate Image
            </button>
          </div>
        </div>

        <div className='submission-content'>
          {/* Patient Info */}
          <div className='patient-section'>
            <h3>Patient Information</h3>
            <div className='info-grid'>
              <div className='info-item'>
                <User size={16} />
                <div>
                  <label>Name</label>
                  <span>{submission.user.name}</span>
                </div>
              </div>
              <div className='info-item'>
                <Calendar size={16} />
                <div>
                  <label>Submitted</label>
                  <span>{formatDate(submission.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className='status-section'>
            <h3>Status Management</h3>
            <div className='status-controls'>
              <select
                value={submission.status}
                onChange={e => handleStatusChange(e.target.value)}
                className='status-select'
              >
                <option value='pending'>Pending Review</option>
                <option value='in_progress'>In Progress</option>
                <option value='completed'>Completed</option>
              </select>
            </div>
          </div>

          {/* Image Section */}
          <div className='image-section'>
            <h3>Submitted Image</h3>
            <div className='image-container'>
              <img
                src={`/api/uploads/${submission.imagePath}`}
                alt='Dental submission'
                className='submission-image'
              />
            </div>
          </div>

          {/* Patient Notes */}
          {submission.patientNotes && (
            <div className='notes-section'>
              <h3>Patient Notes</h3>
              <div className='notes-content'>
                <FileText size={20} />
                <p>{submission.patientNotes}</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className='admin-notes-section'>
            <h3>Professional Analysis</h3>
            <div className='notes-editor'>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder='Enter your professional analysis and recommendations...'
                rows={6}
                className='notes-textarea'
              />
              <button
                onClick={handleSaveNotes}
                disabled={saving}
                className='btn btn-primary save-btn'
              >
                {saving ? (
                  <>
                    <div className='spinner-sm'></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Notes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Section */}
          {submission.reportPath ? (
            <div className='report-section'>
              <h3>Generated Report</h3>
              <div className='report-card'>
                <div className='report-info'>
                  <FileText size={24} />
                  <div>
                    <h4>Analysis Report Available</h4>
                    <p>Professional analysis report has been generated.</p>
                  </div>
                </div>
                <div className='report-actions'>
                  <button
                    onClick={handleViewReport}
                    className='btn btn-secondary'
                  >
                    <FileText size={18} />
                    View Report
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className='btn btn-primary'
                  >
                    <Download size={18} />
                    Download Report
                  </button>
                  <button
                    onClick={handleRegenerateReport}
                    className='btn btn-warning'
                  >
                    <RefreshCw size={18} />
                    Regenerate
                  </button>
                  <button
                    onClick={handleDeleteReport}
                    className='btn btn-danger'
                  >
                    <Trash2 size={18} />
                    Delete Report
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className='report-section'>
              <h3>Report Generation</h3>
              <div className='report-card'>
                <div className='report-info'>
                  <FileText size={24} />
                  <div>
                    <h4>No Report Generated</h4>
                    <p>
                      Generate a professional analysis report for this
                      submission.
                    </p>
                  </div>
                </div>
                <div className='report-actions'>
                  <button
                    onClick={handleRegenerateReport}
                    className='btn btn-primary'
                  >
                    <RefreshCw size={18} />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-submission-view {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .submission-info h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .submission-info p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .submission-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .patient-section,
        .status-section,
        .image-section,
        .notes-section,
        .admin-notes-section,
        .report-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .patient-section h3,
        .status-section h3,
        .image-section h3,
        .notes-section h3,
        .admin-notes-section h3,
        .report-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .info-item svg {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .info-item label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 0.25rem;
        }

        .info-item span {
          color: var(--text-primary);
        }

        .status-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .status-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .image-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .submission-image {
          max-width: 100%;
          max-height: 500px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
        }

        .notes-content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1.5rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .notes-content svg {
          color: var(--text-secondary);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .notes-content p {
          color: var(--text-primary);
          line-height: 1.6;
          margin: 0;
        }

        .notes-editor {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notes-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.5;
          resize: vertical;
          min-height: 120px;
        }

        .notes-textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgb(44 90 160 / 0.1);
        }

        .save-btn {
          align-self: flex-start;
        }

        .report-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .report-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .report-info svg {
          color: var(--success-color);
        }

        .report-info h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .report-info p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .report-actions {
          display: flex;
          gap: 0.75rem;
        }

        .report-actions .btn {
          white-space: nowrap;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
          border: 1px solid #f59e0b;
        }

        .btn-warning:hover {
          background: #d97706;
          border-color: #d97706;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border: 1px solid #ef4444;
        }

        .btn-danger:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .view-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .report-card {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .report-info {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminSubmissionView
