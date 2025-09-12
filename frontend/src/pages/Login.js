import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, FileText, Mail, Lock } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async data => {
    const result = await login(data)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError('root', { message: result.error })
    }
  }

  if (loading) {
    return <LoadingSpinner text='Signing in...' />
  }

  return (
    <div className='login-page'>
      <div className='login-container'>
        {/* Logo */}
        <div className='login-header'>
          <div className='logo'>
            <FileText size={32} />
            <h1>OralVis Healthcare</h1>
          </div>
          <p className='subtitle'>Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='login-form'>
          {errors.root && (
            <div className='error-message'>{errors.root.message}</div>
          )}

          {/* Email Field */}
          <div className='form-group'>
            <label htmlFor='email' className='form-label required'>
              Email Address
            </label>
            <div className='input-wrapper'>
              <Mail className='input-icon' size={18} />
              <input
                id='email'
                type='email'
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder='Enter your email'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className='form-error'>{errors.email.message}</span>
            )}
          </div>

          {/* Password Field */}
          <div className='form-group'>
            <label htmlFor='password' className='form-label required'>
              Password
            </label>
            <div className='input-wrapper'>
              <Lock className='input-icon' size={18} />
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder='Enter your password'
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button
                type='button'
                className='password-toggle'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className='form-error'>{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            className='btn btn-primary btn-lg'
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Test Credentials */}
          <div className='test-credentials'>
            <h3>Test Credentials</h3>
            <div className='credentials-grid'>
              <div className='credential-card'>
                <h4>Patient Account</h4>
                <p>Email: patient@oralvis.com</p>
                <p>Password: patient123</p>
              </div>
              <div className='credential-card'>
                <h4>Admin Account</h4>
                <p>Email: admin@oralvis.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className='form-footer'>
            <p>
              Don't have an account?{' '}
              <Link to='/register' className='auth-link'>
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }

        .login-container {
          width: 100%;
          max-width: 480px;
          background-color: var(--bg-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          padding: 3rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: var(--primary-color);
        }

        .logo h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          z-index: 1;
        }

        .form-input {
          padding-left: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .password-toggle:hover {
          color: var(--text-primary);
        }

        .test-credentials {
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .test-credentials h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
          text-align: center;
        }

        .credentials-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .credential-card {
          background-color: var(--bg-primary);
          border-radius: var(--radius-sm);
          padding: 1rem;
          font-size: 0.75rem;
        }

        .credential-card h4 {
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          color: var(--primary-color);
        }

        .credential-card p {
          margin: 0.25rem 0;
          color: var(--text-secondary);
        }

        .form-footer {
          text-align: center;
          margin-top: 1rem;
        }

        .form-footer p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .auth-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 2rem;
          }

          .credentials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
