import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { submissionAPI } from '../utils/api'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import DentalReport from '../components/DentalReport'

const DentalReportView = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmission()
  }, [id])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await submissionAPI.getSubmission(id)
      console.log('Submission response:', response)
      
      const submissionData = response.data.data?.submission || response.data.submission || response.data
      setSubmission(submissionData)
      
      // Extract patient info from submission or user data
      const patientData = {
        fullName: submissionData.patientName || user?.fullName || 'Patient',
        phone: submissionData.patientPhone || user?.phone || 'N/A'
      }
      setPatient(patientData)
      
    } catch (error) {
      console.error('Error fetching submission:', error)
      toast.error('Failed to load submission')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading report...</p>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="error-container">
        <h2>Report Not Found</h2>
        <p>The requested report could not be found.</p>
        <button onClick={handleBack} className="btn btn-primary">
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="dental-report-view">
      {/* Action Bar */}
      <div className="action-bar no-print">
        <button onClick={handleBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back
        </button>
        
        <div className="action-buttons">
          <button onClick={handlePrint} className="btn btn-primary">
            <FileText size={16} />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-container">
        <DentalReport submission={submission} patient={patient} />
      </div>

      <style jsx>{`
        .dental-report-view {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: white;
          border-bottom: 1px solid #e0e0e0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
        }

        .btn-primary:hover {
          background: #4338ca;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .report-container {
          padding: 2rem;
          display: flex;
          justify-content: center;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 2rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #4f46e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media print {
          .no-print {
            display: none !important;
          }
          
          .dental-report-view {
            background: white;
          }
          
          .report-container {
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .action-bar {
            padding: 1rem;
          }
          
          .report-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default DentalReportView