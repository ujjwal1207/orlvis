import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { submissionAPI } from '../utils/api'
import {
  Upload,
  Image as ImageIcon,
  X,
  FileText,
  User,
  Mail,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const SubmissionUpload = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      patientName: user?.name || '',
      patientEmail: user?.email || ''
    }
  })

  const validateFile = file => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, JPG, or PNG)')
      return false
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return false
    }

    return true
  }

  const handleFileSelect = file => {
    if (!validateFile(file)) return

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = e => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = e => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = e => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async data => {
    if (!selectedFile) {
      toast.error('Please select an image to upload')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('patientNotes', data.patientNotes || '')

      await submissionAPI.create(formData)

      toast.success('Submission uploaded successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Upload error:', error)
      const message =
        error.response?.data?.message || 'Failed to upload submission'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='upload-page'>
      <div className='container container-md'>
        {/* Header */}
        <div className='upload-header'>
          <h1>Upload Dental Image</h1>
          <p>
            Submit your dental image for professional analysis and receive a
            detailed report.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='upload-form'>
          <div className='form-grid'>
            {/* Patient Information */}
            <div className='patient-info-section'>
              <h3>Patient Information</h3>

              <div className='form-group'>
                <label className='form-label'>
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type='text'
                  className='form-input'
                  value={user?.name || ''}
                  disabled
                />
              </div>

              <div className='form-group'>
                <label className='form-label'>
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type='email'
                  className='form-input'
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className='form-group'>
                <label className='form-label'>
                  <FileText size={16} />
                  Patient ID
                </label>
                <input
                  type='text'
                  className='form-input'
                  value={user?.patientId || ''}
                  disabled
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className='file-upload-section'>
              <h3>Upload Image</h3>

              <div
                className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${
                  selectedFile ? 'has-file' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/jpg,image/png'
                  onChange={handleFileInputChange}
                  className='file-input'
                />

                {!selectedFile ? (
                  <div className='upload-placeholder'>
                    <ImageIcon size={48} />
                    <h4>Choose or drag an image</h4>
                    <p>JPEG, JPG or PNG files up to 10MB</p>
                    <button type='button' className='btn btn-secondary'>
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <div className='file-preview'>
                    <div className='preview-header'>
                      <span className='file-name'>{selectedFile.name}</span>
                      <button
                        type='button'
                        onClick={e => {
                          e.stopPropagation()
                          removeFile()
                        }}
                        className='remove-file-btn'
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {imagePreview && (
                      <div className='image-preview'>
                        <img src={imagePreview} alt='Preview' />
                      </div>
                    )}

                    <div className='file-info'>
                      <span className='file-size'>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <CheckCircle size={16} className='success-icon' />
                    </div>
                  </div>
                )}
              </div>

              {errors.image && (
                <span className='form-error'>{errors.image.message}</span>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className='notes-section'>
            <h3>Additional Notes</h3>
            <div className='form-group'>
              <label htmlFor='patientNotes' className='form-label'>
                Describe any symptoms, concerns, or specific areas of interest
              </label>
              <textarea
                id='patientNotes'
                rows={4}
                className={`form-input form-textarea ${
                  errors.patientNotes ? 'error' : ''
                }`}
                placeholder="Please describe any symptoms, pain, or areas of concern you'd like the healthcare professional to focus on..."
                {...register('patientNotes', {
                  maxLength: {
                    value: 1000,
                    message: 'Notes cannot exceed 1000 characters'
                  }
                })}
              />
              {errors.patientNotes && (
                <span className='form-error'>
                  {errors.patientNotes.message}
                </span>
              )}
              <span className='form-help'>
                Optional - Maximum 1000 characters
              </span>
            </div>
          </div>

          {/* Important Information */}
          <div className='info-box'>
            <AlertCircle size={20} />
            <div className='info-content'>
              <h4>Important Information</h4>
              <ul>
                <li>Ensure the image is clear and well-lit</li>
                <li>Include the area of concern in the image</li>
                <li>This analysis is for informational purposes only</li>
                <li>
                  Always consult with a qualified dentist for proper diagnosis
                </li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className='form-actions'>
            <button
              type='button'
              onClick={() => navigate('/dashboard')}
              className='btn btn-secondary'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!selectedFile || uploading}
              className='btn btn-primary'
            >
              {uploading ? (
                <>
                  <div className='spinner-sm'></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Submit for Analysis
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .upload-page {
          padding: 2rem 0;
          min-height: calc(100vh - 80px);
        }

        .upload-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .upload-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .upload-header p {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }

        .upload-form {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .patient-info-section h3,
        .file-upload-section h3,
        .notes-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-light);
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .file-upload-area {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: var(--bg-secondary);
        }

        .file-upload-area:hover {
          border-color: var(--primary-color);
          background-color: var(--bg-tertiary);
        }

        .file-upload-area.drag-over {
          border-color: var(--primary-color);
          background-color: rgb(44 90 160 / 0.05);
        }

        .file-upload-area.has-file {
          cursor: default;
          background-color: var(--bg-primary);
        }

        .file-input {
          display: none;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .upload-placeholder h4 {
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .upload-placeholder p {
          font-size: 0.875rem;
          margin: 0;
        }

        .file-preview {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-name {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .remove-file-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: var(--error-color);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .remove-file-btn:hover {
          background-color: #dc2626;
        }

        .image-preview {
          max-width: 200px;
          margin: 0 auto;
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .image-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        .file-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-sm);
        }

        .file-size {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .success-icon {
          color: var(--success-color);
        }

        .notes-section {
          margin-bottom: 2rem;
        }

        .info-box {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background-color: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
        }

        .info-box svg {
          color: #92400e;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .info-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 0.5rem;
        }

        .info-content ul {
          margin: 0;
          padding-left: 1.25rem;
          color: #92400e;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .info-content li {
          margin-bottom: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .spinner-sm {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .upload-form {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default SubmissionUpload
