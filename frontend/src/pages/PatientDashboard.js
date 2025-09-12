import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { submissionAPI, reportAPI, downloadFile } from '../utils/api'
import {
  Upload,
  FileText,
  Eye,
  Download,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const PatientDashboard = () => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await submissionAPI.getMySubmissions()
      setSubmissions(response.data.data.submissions)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async (submissionId, patientId) => {
    try {
      setDownloadingId(submissionId)
      const response = await reportAPI.downloadReport(submissionId)
      const filename = `OralVis-Report-${patientId}-${new Date().getTime()}.pdf`
      downloadFile(response.data, filename)
      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    } finally {
      setDownloadingId(null)
    }
  }

  const getStatusBadge = status => {
    const statusConfig = {
      uploaded: {
        class: 'badge-uploaded',
        icon: Clock,
        text: 'Uploaded'
      },
      reviewing: {
        class: 'badge-reviewing',
        icon: Activity,
        text: 'Under Review'
      },
      annotated: {
        class: 'badge-annotated',
        icon: Eye,
        text: 'Annotated'
      },
      reported: {
        class: 'badge-reported',
        icon: FileText,
        text: 'Report Ready'
      },
      completed: {
        class: 'badge-completed',
        icon: CheckCircle,
        text: 'Completed'
      }
    }

    const config = statusConfig[status] || statusConfig.uploaded
    const Icon = config.icon

    return (
      <span className={`badge ${config.class}`}>
        <Icon size={12} />
        {config.text}
      </span>
    )
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <LoadingSpinner text='Loading your submissions...' />
  }

  return (
    <div className='patient-dashboard'>
      <div className='container'>
        {/* Header */}
        <div className='dashboard-header'>
          <div className='header-content'>
            <h1>Welcome back, {user?.name}</h1>
            <p className='header-subtitle'>
              Patient ID: {user?.patientId} | Manage your dental submissions and
              reports
            </p>
          </div>

          <Link to='/upload' className='btn btn-primary'>
            <Upload size={18} />
            New Submission
          </Link>
        </div>

        {/* Stats Overview */}
        <div className='stats-grid'>
          <div className='stat-card'>
            <div className='stat-icon uploaded'>
              <FileText size={24} />
            </div>
            <div className='stat-content'>
              <h3>{submissions.length}</h3>
              <p>Total Submissions</p>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon reviewing'>
              <Activity size={24} />
            </div>
            <div className='stat-content'>
              <h3>
                {
                  submissions.filter(s =>
                    ['reviewing', 'annotated'].includes(s.status)
                  ).length
                }
              </h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon completed'>
              <CheckCircle size={24} />
            </div>
            <div className='stat-content'>
              <h3>
                {
                  submissions.filter(s =>
                    ['reported', 'completed'].includes(s.status)
                  ).length
                }
              </h3>
              <p>Reports Ready</p>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className='submissions-section'>
          <div className='section-header'>
            <h2>Your Submissions</h2>
            <p>Track the progress of your dental image submissions</p>
          </div>

          {submissions.length === 0 ? (
            <div className='empty-state'>
              <AlertCircle size={48} />
              <h3>No submissions yet</h3>
              <p>
                Upload your first dental image to get started with your
                analysis.
              </p>
              <Link to='/upload' className='btn btn-primary'>
                <Upload size={18} />
                Upload Now
              </Link>
            </div>
          ) : (
            <div className='submissions-grid'>
              {submissions.map(submission => (
                <div key={submission.id} className='submission-card'>
                  <div className='card-header'>
                    <div className='submission-date'>
                      <Calendar size={16} />
                      {formatDate(submission.submittedAt)}
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>

                  <div className='card-content'>
                    <h3>Submission #{submission.id.slice(-6)}</h3>

                    {submission.patientNotes && (
                      <div className='submission-notes'>
                        <p>
                          <strong>Notes:</strong> {submission.patientNotes}
                        </p>
                      </div>
                    )}

                    <div className='submission-meta'>
                      <div className='meta-item'>
                        <strong>Status:</strong>{' '}
                        {submission.status.charAt(0).toUpperCase() +
                          submission.status.slice(1)}
                      </div>

                      {submission.ageInDays !== undefined && (
                        <div className='meta-item'>
                          <strong>Age:</strong> {submission.ageInDays} day(s)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='card-actions'>
                    <Link
                      to={`/submissions/${submission.id}`}
                      className='btn btn-secondary btn-sm'
                    >
                      <Eye size={16} />
                      View Details
                    </Link>

                    {submission.reportGenerated && (
                      <button
                        onClick={() =>
                          handleDownloadReport(
                            submission.id,
                            submission.patientId
                          )
                        }
                        disabled={downloadingId === submission.id}
                        className='btn btn-primary btn-sm'
                      >
                        {downloadingId === submission.id ? (
                          <>
                            <div className='spinner-sm'></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Download Report
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .patient-dashboard {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .header-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow-sm);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.uploaded {
          background-color: var(--info-color);
        }

        .stat-icon.reviewing {
          background-color: var(--warning-color);
        }

        .stat-icon.completed {
          background-color: var(--success-color);
        }

        .stat-content h3 {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-content p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .submissions-section {
          margin-bottom: 3rem;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .section-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          color: var(--text-muted);
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem;
          color: var(--text-primary);
        }

        .empty-state p {
          margin-bottom: 2rem;
          max-width: 400px;
        }

        .submissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .submission-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s ease;
        }

        .submission-card:hover {
          box-shadow: var(--shadow-md);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .submission-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .card-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .submission-notes {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-sm);
        }

        .submission-notes p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .submission-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .meta-item {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: var(--radius-sm);
        }

        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .submissions-grid {
            grid-template-columns: 1fr;
          }

          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default PatientDashboard
