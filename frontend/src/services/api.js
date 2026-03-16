import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mc_token')
      localStorage.removeItem('mc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  changePassword: (data) => api.patch('/users/me/change-password', data),
  changeEmail:    (data) => api.patch('/users/me/change-email',    data),
  getAll:   (params) => api.get('/users', { params }),
  getMe:    ()       => api.get('/users/me'),
  getById:  (id)     => api.get(`/users/${id}`),
  updateMe: (data)   => api.patch('/users/me', data),
}

// ── Gigs ──────────────────────────────────────────────────────────────────────
export const gigsAPI = {
  getAll:          (params) => api.get('/gigs', { params }),
  getById:         (id)     => api.get(`/gigs/${id}`),
  create:          (data)   => api.post('/gigs', data),
  update:          (id, data) => api.patch(`/gigs/${id}`, data),
  delete:          (id)     => api.delete(`/gigs/${id}`),
  apply:           (id, data) => api.post(`/gigs/${id}/apply`, data),
  cancelApply:     (id)     => api.delete(`/gigs/${id}/apply`),
  getApplicants:   (id)     => api.get(`/gigs/${id}/applicants`),
  myApplications:  ()       => api.get('/gigs/my/applications'),
}

export default api
