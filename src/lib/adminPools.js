import { adminApi } from './adminApi'

export async function listPools() {
  const response = await adminApi.get('/api/v1/pools')
  return response.data.data
}

export async function getPool(poolId) {
  const response = await adminApi.get(`/api/v1/pools/${poolId}`)
  return response.data.data
}

export async function createPool(pool) {
  const response = await adminApi.post('/api/v1/pools', pool)
  return response.data.data
}
