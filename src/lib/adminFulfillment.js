import { adminApi } from './adminApi'

export async function getMasterPoForPool(poolId) {
  const response = await adminApi.get(`/api/v1/fulfillment/pools/${poolId}/master-po`)
  return response.data.data
}

export async function generateMasterPo(poolId) {
  const response = await adminApi.post(`/api/v1/fulfillment/pools/${poolId}/generate-po`)
  return response.data.data
}

export async function verifyDelivery(subInvoiceId, otp) {
  const response = await adminApi.post('/api/v1/fulfillment/delivery/verify', { subInvoiceId, otp })
  return response.data.data
}

export async function getMerchantInvoices(merchantId) {
  const response = await adminApi.get(`/api/v1/fulfillment/sub-invoices/merchant/${merchantId}`)
  return response.data.data
}
