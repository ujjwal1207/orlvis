import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  adminAPI,
  reportAPI,
  openPDFInNewTab,
  downloadFile
} from '../utils/api'
import {
  FileImage,
  Clock,
  CheckCircle,
  Eye,
  Edit3,
  Download,
  Search,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReview: 0,
    inProgress: 0,
    completed: 0
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    fetchSubmissions()
  }, [user, navigate])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllSubmissions()
      const submissionsData = response.data.data.submissions || []
      setSubmissions(submissionsData)

      // Calculate stats
      const pending = submissionsData.filter(
        s => s?.status === 'uploaded'
      ).length
      const inProgress = submissionsData.filter(
        s => s?.status === 'reviewing' || s?.status === 'annotated'
      ).length
      const completed = submissionsData.filter(
        s => s?.status === 'completed' || s?.status === 'reported'
      ).length

      setStats({
        totalSubmissions: submissionsData.length,
        pendingReview: pending,
        inProgress: inProgress,
        completed: completed
      })
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
      setSubmissions([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (submissionId, newStatus) => {
    try {
      await adminAPI.updateSubmissionStatus(submissionId, { status: newStatus })
      toast.success('Status updated successfully')
      fetchSubmissions() // Refresh data
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleAnnotateClick = submissionId => {
    navigate(`/admin/annotate/${submissionId}`)
  }

  const handleViewDetails = submissionId => {
    navigate(`/admin/submission/${submissionId}`)
  }

  const handleViewReport = submissionId => {
    console.log('Admin viewing report for submission:', submissionId)
    // Navigate to the new dental report UI
    navigate(`/admin/reports/${submissionId}`)
  }

  const handleDownloadReport = async submissionId => {
    try {
      console.log('Admin downloading report for submission:', submissionId)
      const response = await reportAPI.downloadReport(submissionId)

      // Generate filename
      const fileName = `report-${submissionId}-${Date.now()}.pdf`
      downloadFile(response.data, fileName)
      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  // Filter and sort submissions
  const filteredSubmissions = (submissions || []).filter(submission => {
    if (!submission) return false

    const matchesSearch =
      submission.patientName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.patientEmail
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || submission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.submittedAt) - new Date(a.submittedAt)
      case 'oldest':
        return new Date(a.submittedAt) - new Date(b.submittedAt)
      case 'patient':
        return a.patientName?.localeCompare(b.patientName || '') || 0
      case 'status':
        return a.status?.localeCompare(b.status || '') || 0
      default:
        return 0
    }
  })

  const getStatusBadge = status => {
    const statusConfig = {
      uploaded: { color: '#f59e0b', bg: '#fef3c7', icon: Clock },
      reviewing: { color: '#3b82f6', bg: '#dbeafe', icon: Edit3 },
      annotated: { color: '#8b5cf6', bg: '#ede9fe', icon: Edit3 },
      reported: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
      completed: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
      pending: { color: '#f59e0b', bg: '#fef3c7', icon: Clock },
      in_progress: { color: '#3b82f6', bg: '#dbeafe', icon: Edit3 }
    }

    const config = statusConfig[status] || statusConfig.uploaded
    const Icon = config.icon

    return (
      <span
        className='status-badge'
        style={{
          color: config.color,
          backgroundColor: config.bg
        }}
      >
        <Icon size={14} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  if (loading) {
    return (
      <div className='admin-dashboard'>
        <div className='container'>
          <div className='loading-state'>
            <div className='spinner'></div>
            <p>Loading submissions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='admin-dashboard'>
      <div className='container'>
        {/* Header */}
        <div className='dashboard-header'>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage patient submissions and dental image analyses</p>
          </div>
          <div className='header-actions'>
            <button
              className='btn btn-secondary'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='stats-grid'>
          <div className='stat-card'>
            <div className='stat-icon total'>
              <FileImage size={24} />
            </div>
            <div className='stat-info'>
              <div className='stat-value'>{stats.totalSubmissions}</div>
              <div className='stat-label'>Total Submissions</div>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon pending'>
              <Clock size={24} />
            </div>
            <div className='stat-info'>
              <div className='stat-value'>{stats.pendingReview}</div>
              <div className='stat-label'>Pending Review</div>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon progress'>
              <Edit3 size={24} />
            </div>
            <div className='stat-info'>
              <div className='stat-value'>{stats.inProgress}</div>
              <div className='stat-label'>In Progress</div>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon completed'>
              <CheckCircle size={24} />
            </div>
            <div className='stat-info'>
              <div className='stat-value'>{stats.completed}</div>
              <div className='stat-label'>Completed</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className='filters-panel'>
            <div className='filter-group'>
              <label className='filter-label'>Search</label>
              <div className='search-input'>
                <Search size={18} />
                <input
                  type='text'
                  placeholder='Search by patient name, email, or ID...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className='filter-group'>
              <label className='filter-label'>Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='filter-select'
              >
                <option value='all'>All Statuses</option>
                <option value='pending'>Pending Review</option>
                <option value='in_progress'>In Progress</option>
                <option value='completed'>Completed</option>
              </select>
            </div>

            <div className='filter-group'>
              <label className='filter-label'>Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='filter-select'
              >
                <option value='newest'>Newest First</option>
                <option value='oldest'>Oldest First</option>
                <option value='patient'>Patient Name</option>
                <option value='status'>Status</option>
              </select>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className='submissions-section'>
          <div className='section-header'>
            <h2>Patient Submissions</h2>
            <span className='submissions-count'>
              {sortedSubmissions.length} of {submissions.length} submissions
            </span>
          </div>

          {sortedSubmissions.length === 0 ? (
            <div className='empty-state'>
              <FileImage size={48} />
              <h3>No submissions found</h3>
              <p>
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Patient submissions will appear here once uploaded.'}
              </p>
            </div>
          ) : (
            <div className='submissions-table'>
              <div className='table-header'>
                <div className='header-cell'>Patient</div>
                <div className='header-cell'>Submission ID</div>
                <div className='header-cell'>Date Submitted</div>
                <div className='header-cell'>Status</div>
                <div className='header-cell'>Actions</div>
              </div>

              <div className='table-body'>
                {sortedSubmissions.map(submission => (
                  <div key={submission.id} className='table-row'>
                    <div className='cell patient-cell'>
                      <div className='patient-info'>
                        <div className='patient-name'>
                          {submission.patientName || 'N/A'}
                        </div>
                        <div className='patient-email'>
                          {submission.patientEmail || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className='cell'>
                      <span className='submission-id'>
                        {submission.id
                          ? submission.id.slice(-8).toUpperCase()
                          : 'N/A'}
                      </span>
                    </div>

                    <div className='cell'>
                      <span className='date'>
                        {formatDate(submission.submittedAt)}
                      </span>
                    </div>

                    <div className='cell'>
                      <div className='status-dropdown'>
                        <select
                          value={submission.status}
                          onChange={e =>
                            handleStatusUpdate(submission.id, e.target.value)
                          }
                          className='status-select'
                        >
                          <option value='uploaded'>Uploaded</option>
                          <option value='reviewing'>Under Review</option>
                          <option value='annotated'>Annotated</option>
                          <option value='reported'>Report Generated</option>
                          <option value='completed'>Completed</option>
                        </select>
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>

                    <div className='cell actions-cell'>
                      <div className='action-buttons'>
                        <button
                          onClick={() => handleViewDetails(submission.id)}
                          className='action-btn view'
                          title='View Details'
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleAnnotateClick(submission.id)}
                          className='action-btn annotate'
                          title='Annotate Image'
                        >
                          <Edit3 size={16} />
                        </button>

                        {submission.status === 'completed' &&
                          submission.reportPath && (
                            <>
                              <button
                                onClick={() => handleViewReport(submission.id)}
                                className='action-btn view-report'
                                title='View Report'
                              >
                                <FileImage size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDownloadReport(submission.id)
                                }
                                className='action-btn download'
                                title='Download Report'
                              >
                                <Download size={16} />
                              </button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-dashboard {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .dashboard-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
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
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.total {
          background-color: #6366f1;
        }
        .stat-icon.pending {
          background-color: #f59e0b;
        }
        .stat-icon.progress {
          background-color: #3b82f6;
        }
        .stat-icon.completed {
          background-color: #10b981;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .filters-panel {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .search-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input svg {
          position: absolute;
          left: 0.75rem;
          color: var(--text-secondary);
          z-index: 1;
        }

        .search-input input {
          padding-left: 2.5rem;
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .submissions-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .section-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .submissions-count {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .submissions-table {
          overflow-x: auto;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr;
          background-color: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
        }

        .header-cell {
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-body {
          background-color: var(--bg-primary);
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr;
          border-bottom: 1px solid var(--border-light);
          transition: background-color 0.2s ease;
        }

        .table-row:hover {
          background-color: var(--bg-tertiary);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .cell {
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          font-size: 0.875rem;
        }

        .patient-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .patient-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .patient-email {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .submission-id {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.8rem;
          background-color: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .date {
          color: var(--text-primary);
        }

        .status-dropdown {
          position: relative;
        }

        .status-select {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-badge:hover {
          opacity: 0.8;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background-color: var(--bg-tertiary);
        }

        .action-btn.view:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .action-btn.annotate:hover {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .action-btn.view-report:hover {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }

        .action-btn.download:hover {
          border-color: #10b981;
          color: #10b981;
        }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.875rem;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
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

        @media (max-width: 1024px) {
          .filters-panel {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
          }

          .header-cell,
          .cell {
            padding: 0.75rem 1rem;
          }

          .table-header {
            display: none;
          }

          .table-row {
            display: block;
            padding: 1rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
          }

          .cell {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-light);
          }

          .cell:last-child {
            border-bottom: none;
          }

          .cell::before {
            content: attr(data-label);
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: block;
            margin-bottom: 0.25rem;
          }

          .actions-cell {
            padding-top: 1rem;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard
