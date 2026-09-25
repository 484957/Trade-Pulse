import { adminApi } from './adminApi'

export async function getMerchantBalance(merchantId) {
  const response = await adminApi.get(`/api/v1/ledger/merchants/${merchantId}/balance`)
  return response.data.data
}

export async function depositFunds(merchantId, amount, paymentReference) {
  const response = await adminApi.post('/api/v1/ledger/deposit', {
    merchantId,
    amount,
    paymentReference,
  })
  return response.data.data
}
