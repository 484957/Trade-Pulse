import { adminApi } from './adminApi'

export async function loginRequest(username, password) {
  const response = await adminApi.post('/api/v1/auth/login', { username, password })
  return response.data.data
}
