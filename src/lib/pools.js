import { api } from './api'

export async function listPools() {
  const response = await api.get('/api/v1/pools')
  return response.data.data
}

export async function getPool(poolId) {
  const response = await api.get(`/api/v1/pools/${poolId}`)
  return response.data.data
}

export async function commitToPool(poolId, merchantId, quantity) {
  const response = await api.post(`/api/v1/pools/${poolId}/commit`, {
    merchantId,
    quantity,
  })
  return response.data.data
}
