import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { submissionAPI, reportAPI, openPDFInNewTab, downloadFile } from '../utils/api'
import {
  ArrowLeft,
  Download,
  Calendar,
  User,
  FileText,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const SubmissionView = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmission()
  }, [id])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await submissionAPI.getSubmission(id)
      setSubmission(response.data.data.submission)
    } catch (error) {
      console.error('Error fetching submission:', error)
      toast.error('Failed to load submission')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!submission?.id) {
      toast.error('Submission not available')
      return
    }

    try {
      console.log('Downloading report for submission:', submission.id)
      const response = await reportAPI.downloadReport(submission.id)

      // Generate filename
      const fileName = `OralVis-Report-${submission.patientId}-${Date.now()}.pdf`
      downloadFile(response.data, fileName)
      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  const handleViewReport = () => {
    console.log('View Report clicked!')
    console.log('Submission:', submission)
    console.log('Submission ID:', submission?.id)

    if (!submission?.id) {
      toast.error('Submission not available')
      return
    }

    // Navigate to the new dental report UI
    navigate(`/reports/${submission.id}`)
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = status => {
    if (!status) return null

    const statusConfig = {
      pending: { color: '#f59e0b', bg: '#fef3c7', text: 'Pending Review' },
      in_progress: { color: '#3b82f6', bg: '#dbeafe', text: 'In Progress' },
      completed: { color: '#10b981', bg: '#d1fae5', text: 'Completed' }
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span
        className='status-badge'
        style={{
          color: config.color,
          backgroundColor: config.bg
        }}
      >
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className='submission-view'>
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
      <div className='submission-view'>
        <div className='container'>
          <div className='error-state'>
            <h2>Submission not found</h2>
            <button
              onClick={() => navigate('/dashboard')}
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
    <div className='submission-view'>
      <div className='container'>
        {/* Header */}
        <div className='view-header'>
          <button
            onClick={() => navigate('/dashboard')}
            className='btn btn-secondary btn-sm'
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className='submission-info'>
            <h1>Submission Details</h1>
            <p>ID: {submission?._id?.slice(-8).toUpperCase() || 'N/A'}</p>
          </div>
        </div>

        <div className='submission-content'>
          {/* Status and Meta Info */}
          <div className='info-section'>
            <div className='info-card'>
              <h3>Status</h3>
              {submission?.status && getStatusBadge(submission.status)}
            </div>

            <div className='info-card'>
              <h3>Submitted</h3>
              <div className='info-item'>
                <Calendar size={16} />
                <span>
                  {submission?.createdAt
                    ? formatDate(submission.createdAt)
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className='info-card'>
              <h3>Patient</h3>
              <div className='info-item'>
                <User size={16} />
                <span>{user?.name}</span>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className='image-section'>
            <h3>Submitted Image</h3>
            <div className='image-container'>
              {submission?.imagePath ? (
                <img
                  src={`/api/uploads/${submission.imagePath}`}
                  alt='Dental submission'
                  className='submission-image'
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
          </div>

          {/* Notes Section */}
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
          {submission.adminNotes && (
            <div className='notes-section'>
              <h3>Professional Analysis</h3>
              <div className='notes-content admin-notes'>
                <p>{submission.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Report Section */}
          {submission &&
            (submission.status === 'completed' ||
              submission.status === 'reported') &&
            submission.reportGenerated && (
              <div className='report-section'>
                <h3>Analysis Report</h3>
                <div className='report-card'>
                  <div className='report-info'>
                    <Eye size={24} />
                    <div>
                      <h4>Professional Analysis Report</h4>
                      <p>
                        Your dental image analysis is complete and ready for
                        download.
                      </p>
                    </div>
                  </div>
                  <div className='report-actions'>
                    <button
                      onClick={handleViewReport}
                      className='btn btn-secondary'
                    >
                      <Eye size={18} />
                      View Report
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className='btn btn-primary'
                    >
                      <Download size={18} />
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      <style>{`
        .submission-view {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .view-header {
          display: flex;
          align-items: center;
          gap: 1rem;
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

        .info-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .info-card h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .image-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .image-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
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

        .notes-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .notes-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .notes-content {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
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

        .admin-notes {
          background-color: var(--bg-tertiary);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border-left: 4px solid var(--primary-color);
        }

        .report-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .report-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
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
            align-items: flex-start;
            gap: 1rem;
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

export default SubmissionView
