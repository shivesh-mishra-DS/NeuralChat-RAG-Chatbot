/**
 * services/api.js
 * Centralised Axios instance + API helpers
 */
import axios from 'axios'

// Base URL – proxied to http://localhost:8000 by Vite dev server
const BASE_URL = '/api'

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT if present ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: redirect to login on 401 ───────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)


// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),

  login: (username, password) =>
    api.post('/auth/login', { username, password }),
}


// ── Chat API ──────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (message) =>
    api.post('/chat/message', { message }),

  getHistory: (limit = 100) =>
    api.get(`/chat/history?limit=${limit}`),

  clearHistory: () =>
    api.delete('/chat/history'),

  uploadDocument: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/chat/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getDocuments: () =>
    api.get('/chat/documents'),
}

export default api
