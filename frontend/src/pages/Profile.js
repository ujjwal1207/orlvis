import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../utils/api'
import { User, Mail, Save, Edit3, Shield, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await authAPI.updateProfile(formData)
      updateUser(response.data.user)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    })
    setEditing(false)
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className='profile-page'>
      <div className='container container-md'>
        <div className='profile-header'>
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        <div className='profile-content'>
          {/* Profile Card */}
          <div className='profile-card'>
            <div className='card-header'>
              <h3>Personal Information</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className='btn btn-secondary btn-sm'
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              )}
            </div>

            <div className='profile-form'>
              <div className='form-group'>
                <label className='form-label'>
                  <User size={16} />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='form-input'
                    placeholder='Enter your full name'
                  />
                ) : (
                  <div className='form-value'>{user?.name}</div>
                )}
              </div>

              <div className='form-group'>
                <label className='form-label'>
                  <Mail size={16} />
                  Email Address
                </label>
                {editing ? (
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='form-input'
                    placeholder='Enter your email address'
                  />
                ) : (
                  <div className='form-value'>{user?.email}</div>
                )}
              </div>

              <div className='form-group'>
                <label className='form-label'>
                  <Shield size={16} />
                  Role
                </label>
                <div className='form-value'>
                  <span className={`role-badge ${user?.role}`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </span>
                </div>
              </div>

              {user?.patientId && (
                <div className='form-group'>
                  <label className='form-label'>Patient ID</label>
                  <div className='form-value patient-id'>{user.patientId}</div>
                </div>
              )}

              <div className='form-group'>
                <label className='form-label'>
                  <Calendar size={16} />
                  Member Since
                </label>
                <div className='form-value'>
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </div>
              </div>

              {editing && (
                <div className='form-actions'>
                  <button onClick={handleCancel} className='btn btn-secondary'>
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className='btn btn-primary'
                  >
                    {saving ? (
                      <>
                        <div className='spinner-sm'></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Stats */}
          {user?.role === 'patient' && (
            <div className='stats-card'>
              <h3>Account Statistics</h3>
              <div className='stats-grid'>
                <div className='stat-item'>
                  <div className='stat-value'>-</div>
                  <div className='stat-label'>Total Submissions</div>
                </div>
                <div className='stat-item'>
                  <div className='stat-value'>-</div>
                  <div className='stat-label'>Completed Reports</div>
                </div>
                <div className='stat-item'>
                  <div className='stat-value'>-</div>
                  <div className='stat-label'>Pending Reviews</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .profile-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .profile-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .profile-header p {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }

        .profile-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-card,
        .stats-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-value {
          padding: 0.75rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .patient-id {
          font-family: 'Monaco', 'Menlo', monospace;
          font-weight: 600;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .role-badge.admin {
          background-color: #fef3c7;
          color: #92400e;
        }

        .role-badge.patient {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }

        .stats-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1.5rem 1rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
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
          .card-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile
