import api from './axios'

// ── INITIATE PAYMENT ──────────────────────────────────────────
// POST /api/payments/initiate
// Request:  { planId, amount, currency }
// Response: { transactionId, stripeSessionId, amount, currency,
//             status, stripePublishableKey, checkoutUrl, planName }
export const initiatePaymentAPI = async (planId, amount, currency = 'INR') => {
  const response = await api.post('/api/payments/initiate', {
    planId,
    amount,
    currency,
  })
  return response.data
}

// ── VERIFY PAYMENT ────────────────────────────────────────────
// GET /api/payments/verify/{sessionId}
// Call this after Stripe redirects back to confirm payment status
// Returns same shape as initiate response with updated status
export const verifyPaymentAPI = async (sessionId) => {
  const response = await api.get(`/api/payments/verify/${sessionId}`)
  return response.data
}

// ── USER PAYMENT HISTORY ──────────────────────────────────────
// GET /api/payments/history
// Returns: [ { id, userEmail, userFullName, planId, planName,
//              amount, currency, status, stripeSessionId, createdAt } ]
export const getPaymentHistoryAPI = async () => {
  const response = await api.get('/api/payments/history')
  return response.data
}

// ── ADMIN ALL TRANSACTIONS ────────────────────────────────────
// GET /api/payments/admin/all?page=0&size=20
// Returns paginated: { totalElements, totalPages, size,
//                      content: [...], number, sort }
export const getAllTransactionsAPI = async (page = 0, size = 20) => {
  const response = await api.get('/api/payments/admin/all', {
    params: { page, size }
  })
  return response.data
}