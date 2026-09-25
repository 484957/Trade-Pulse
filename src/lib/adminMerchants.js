import { adminApi } from './adminApi'

export async function listMerchants() {
  const response = await adminApi.get('/api/v1/merchants')
  return response.data.data
}

export async function verifyMerchant(merchantId) {
  const response = await adminApi.patch(`/api/v1/merchants/${merchantId}/verify`)
  return response.data.data
}
