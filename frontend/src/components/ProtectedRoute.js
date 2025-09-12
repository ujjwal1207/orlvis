import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner text='Checking authentication...' />
  }

  if (!isAuthenticated()) {
    return <Navigate to='/login' replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className='access-denied'>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          className='btn btn-primary'
        >
          Go Back
        </button>

        <style>{`
          .access-denied {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
            padding: 2rem;
          }

          .access-denied h2 {
            color: var(--error-color);
            margin-bottom: 1rem;
          }

          .access-denied p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
          }
        `}</style>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
