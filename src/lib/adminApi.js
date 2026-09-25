import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const adminApi = axios.create({
  baseURL: BASE_URL,
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('tpa_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tpa_token')
      localStorage.removeItem('tpa_user')
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const body = error?.response?.data
  if (!body) return error?.message || fallback
  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    const fieldMessages = Object.values(body.data).filter((v) => typeof v === 'string')
    if (fieldMessages.length > 0) return fieldMessages.join('; ')
  }
  return body.message || fallback
}

export default adminApi
