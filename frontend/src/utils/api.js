import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  register: userData => api.post('/auth/register', userData),
  login: credentials => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: profileData => api.put('/auth/profile', profileData)
}

// Submission API functions
export const submissionAPI = {
  create: formData =>
    api.post('/api/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  getMySubmissions: () => api.get('/api/submissions/my'),
  getSubmission: id => api.get(`/api/submissions/${id}`),
  updateNotes: (id, notes) =>
    api.put(`/api/submissions/${id}/notes`, { patientNotes: notes }),
  deleteSubmission: id => api.delete(`/api/submissions/${id}`)
}

// Admin API functions
export const adminAPI = {
  getAllSubmissions: (params = {}) =>
    api.get('/api/admin/submissions', { params }),
  getSubmissionStats: () => api.get('/api/admin/stats'),
  getSubmission: id => api.get(`/api/admin/submissions/${id}`),
  getSubmissionForReview: id => api.get(`/api/admin/submissions/${id}`),
  updateSubmissionStatus: (id, statusData) =>
    api.put(`/api/admin/submissions/${id}/status`, statusData),
  assignSubmission: id => api.put(`/api/admin/submissions/${id}/assign`),
  saveAnnotations: (id, formData) =>
    api.post(`/api/admin/submissions/${id}/annotations`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  generateReport: id => api.post(`/api/admin/submissions/${id}/report`)
}

// Report API functions
export const reportAPI = {
  generateReport: id => api.post(`/api/reports/${id}/generate`),
  downloadReport: id =>
    api.get(`/api/reports/${id}/download`, {
      responseType: 'blob'
    }),
  previewReport: id =>
    api.get(`/api/reports/${id}/preview`, {
      responseType: 'blob'
    }),
  getReportInfo: id => api.get(`/api/reports/${id}/info`),
  deleteReport: id => api.delete(`/api/reports/${id}`)
}

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const openPDFInNewTab = blob => {
  const url = window.URL.createObjectURL(blob)
  window.open(url, '_blank')
}

export default api
