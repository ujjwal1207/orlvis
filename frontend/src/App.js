import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Import pages
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SubmissionUpload from './pages/SubmissionUpload'
import ImageAnnotation from './pages/ImageAnnotation'
import SubmissionView from './pages/SubmissionView'
import AdminSubmissionView from './pages/AdminSubmissionView'
import DentalReportView from './pages/DentalReportView'
import Profile from './pages/Profile'

// Import components
import Header from './components/Header'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

// Import styles
import './styles/global.css'

// Main App component with routing
function AppContent () {
  const { loading, isAuthenticated, user } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className='app'>
        {isAuthenticated() && <Header />}

        <main
          className={isAuthenticated() ? 'main-content' : 'main-content-full'}
        >
          <Routes>
            {/* Public routes */}
            <Route
              path='/login'
              element={
                !isAuthenticated() ? <Login /> : <Navigate to='/dashboard' />
              }
            />
            <Route
              path='/register'
              element={
                !isAuthenticated() ? <Register /> : <Navigate to='/dashboard' />
              }
            />

            {/* Protected routes */}
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  {user?.role === 'admin' ? (
                    <AdminDashboard />
                  ) : (
                    <PatientDashboard />
                  )}
                </ProtectedRoute>
              }
            />

            {/* Patient routes */}
            <Route
              path='/upload'
              element={
                <ProtectedRoute requiredRole='patient'>
                  <SubmissionUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path='/submissions/:id'
              element={
                <ProtectedRoute>
                  <SubmissionView />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reports/:id'
              element={
                <ProtectedRoute>
                  <DentalReportView />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path='/admin/submissions/:id'
              element={
                <ProtectedRoute requiredRole='admin'>
                  <AdminSubmissionView />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin/reports/:id'
              element={
                <ProtectedRoute requiredRole='admin'>
                  <DentalReportView />
                </ProtectedRoute>
              }
            />
            <Route
              path='/admin/annotate/:submissionId'
              element={
                <ProtectedRoute requiredRole='admin'>
                  <ImageAnnotation />
                </ProtectedRoute>
              }
            />

            {/* Profile route */}
            <Route
              path='/profile'
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Default redirects */}
            <Route
              path='/'
              element={
                <Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />
              }
            />

            {/* 404 - Not found */}
            <Route
              path='*'
              element={
                <div className='error-page'>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you are looking for does not exist.</p>
                  <button onClick={() => window.history.back()}>Go Back</button>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Toast notifications */}
        <Toaster
          position='top-right'
          reverseOrder={false}
          gutter={8}
          containerClassName=''
          containerStyle={{}}
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff'
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88'
              }
            },
            error: {
              duration: 4000,
              theme: {
                primary: '#ff6b6b'
              }
            }
          }}
        />
      </div>
    </Router>
  )
}

// Main App wrapper
function App () {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
