import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const api = axios.create({
  baseURL: BASE_URL,
})

// Attach the JWT to every request once the person is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If the token is rejected or expired, clear it and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tp_token')
      localStorage.removeItem('tp_user')
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Helper to extract clean error message
export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const body = error?.response?.data
  if (!body) return error?.message || fallback
  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    const fieldMessages = Object.values(body.data).filter((v) => typeof v === 'string')
    if (fieldMessages.length > 0) return fieldMessages.join('; ')
  }
  return body.message || fallback
}

export default api
