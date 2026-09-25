import { api } from './api'

export async function loginRequest(username, password) {
  const response = await api.post('/api/v1/auth/login', { username, password })
  return response.data.data
}
