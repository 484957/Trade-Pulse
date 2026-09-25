import { adminApi } from './adminApi'

export async function listProducts() {
  const response = await adminApi.get('/api/v1/products')
  return response.data.data
}

export async function getProduct(productId) {
  const response = await adminApi.get(`/api/v1/products/${productId}`)
  return response.data.data
}

export async function createProduct(product) {
  const response = await adminApi.post('/api/v1/products', product)
  return response.data.data
}

export async function addTier(productId, tier) {
  const response = await adminApi.post(`/api/v1/products/${productId}/tiers`, tier)
  return response.data.data
}
