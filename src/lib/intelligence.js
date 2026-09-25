import api from './api'

/**
 * Fetch grounded wholesale mandi price intelligence via Google Search (gemini-3.5-flash)
 */
export async function fetchMandiPriceIntelligence(commodity = 'Edible Sunflower Oil 15L', region = 'Maharashtra, India (APMC Mumbai / Vashi / Vasai)') {
  const response = await api.post('/api/v1/intelligence/search-mandi', {
    commodity,
    region,
  })
  return response.data?.data
}

/**
 * Fetch grounded supplier hubs & mandis via Google Maps (gemini-3.5-flash)
 */
export async function fetchGroundedSuppliers(query = 'Wholesale edible oil and grocery distributors', lat = null, lng = null, region = 'Vasai-Virar, Thane / Mumbai') {
  const response = await api.post('/api/v1/intelligence/maps-suppliers', {
    query,
    lat,
    lng,
    region,
  })
  return response.data?.data
}
