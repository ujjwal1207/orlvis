import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, FileText, Mail, Lock, User, Phone } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm({
    defaultValues: {
      role: 'patient'
    }
  })

  const watchRole = watch('role')

  const onSubmit = async data => {
    const result = await registerUser(data)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError('root', { message: result.error })
    }
  }

  if (loading) {
    return <LoadingSpinner text='Creating account...' />
  }

  return (
    <div className='register-page'>
      <div className='register-container'>
        {/* Logo */}
        <div className='register-header'>
          <div className='logo'>
            <FileText size={32} />
            <h1>OralVis Healthcare</h1>
          </div>
          <p className='subtitle'>Create your account</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='register-form'>
          {errors.root && (
            <div className='error-message'>{errors.root.message}</div>
          )}

          {/* Name Field */}
          <div className='form-group'>
            <label htmlFor='name' className='form-label required'>
              Full Name
            </label>
            <div className='input-wrapper'>
              <User className='input-icon' size={18} />
              <input
                id='name'
                type='text'
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder='Enter your full name'
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
              />
            </div>
            {errors.name && (
              <span className='form-error'>{errors.name.message}</span>
            )}
          </div>

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

          {/* Phone Field */}
          <div className='form-group'>
            <label htmlFor='phone' className='form-label'>
              Phone Number
            </label>
            <div className='input-wrapper'>
              <Phone className='input-icon' size={18} />
              <input
                id='phone'
                type='tel'
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder='Enter your phone number'
                {...register('phone', {
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone number'
                  }
                })}
              />
            </div>
            {errors.phone && (
              <span className='form-error'>{errors.phone.message}</span>
            )}
            <span className='form-help'>
              Optional - for appointment notifications
            </span>
          </div>

          {/* Role Selection */}
          <div className='form-group'>
            <label className='form-label required'>Account Type</label>
            <div className='role-selection'>
              <label className='role-option'>
                <input
                  type='radio'
                  value='patient'
                  {...register('role', {
                    required: 'Please select an account type'
                  })}
                />
                <div className='role-card'>
                  <h3>Patient</h3>
                  <p>Upload dental images and receive analysis reports</p>
                </div>
              </label>

              <label className='role-option'>
                <input
                  type='radio'
                  value='admin'
                  {...register('role', {
                    required: 'Please select an account type'
                  })}
                />
                <div className='role-card'>
                  <h3>Healthcare Professional</h3>
                  <p>
                    Review submissions, annotate images, and generate reports
                  </p>
                </div>
              </label>
            </div>
            {errors.role && (
              <span className='form-error'>{errors.role.message}</span>
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
                placeholder='Create a password'
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
            <span className='form-help'>Minimum 6 characters</span>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            className='btn btn-primary btn-lg'
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <div className='form-footer'>
            <p>
              Already have an account?{' '}
              <Link to='/login' className='auth-link'>
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }

        .register-container {
          width: 100%;
          max-width: 520px;
          background-color: var(--bg-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          padding: 3rem;
        }

        .register-header {
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

        .register-form {
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

        .role-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .role-option {
          position: relative;
          cursor: pointer;
        }

        .role-option input[type='radio'] {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          cursor: pointer;
        }

        .role-card {
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          transition: all 0.2s ease;
          height: 100%;
        }

        .role-option input[type='radio']:checked + .role-card {
          border-color: var(--primary-color);
          background-color: rgb(44 90 160 / 0.05);
        }

        .role-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .role-card p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
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
          .register-container {
            padding: 2rem;
          }

          .role-selection {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Register
