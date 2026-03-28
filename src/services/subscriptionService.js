import api from './axios'

// ── SUBSCRIBE TO PLAN ─────────────────────────────────────────
// POST /api/subscriptions/subscribe/{planId}
// JWT sent automatically — backend knows who the user is
// Returns: { subId, planId, planName, planDescription, planPrice,
//            billingInterval, status, startDate, endDate,
//            autoRenew, daysRemaining, createdAt,
//            userId, userEmail, userFullName }
export const subscribeToPlanAPI = async (planId) => {
  const response = await api.post(`/api/subscriptions/subscribe/${planId}`)
  return response.data
}

// ── SWITCH PLAN ───────────────────────────────────────────────
// PUT /api/subscriptions/switchplan/{planId}
// Unsubscribes from current plan + subscribes to new one
// Returns: { subId, planId, planName, planDescription,
//            billing, status, startDate, endDate,
//            autoRenew, daysRemaining, createdAt,
//            userId, userEmail, userFullName, price }
export const switchPlanAPI = async (planId) => {
  const response = await api.put(`/api/subscriptions/switchplan/${planId}`)
  return response.data
}

// ── CANCEL SUBSCRIPTION ───────────────────────────────────────
// PUT /api/subscriptions/cancel/{subId}
// subId comes from the stored subscription object
export const cancelSubscriptionAPI = async (subId) => {
  const response = await api.put(`/api/subscriptions/cancel/${subId}`)
  return response.data
}

// ── GET MY ACTIVE PLAN ────────────────────────────────────────
// GET /api/subscriptions/myactiveplan
// No parameters — JWT tells backend who the user is
// Returns: { subId, planId, planName, planDescription,
//            billing, status, startDate, endDate,
//            autoRenew, daysRemaining, createdAt,
//            userId, userEmail, userFullName, price }
// export const getMyActivePlanAPI = async () => {
//   const response = await api.get('/api/subscriptions/myactiveplan')
//   return response.data
// }
export const getMyActivePlanAPI = async () => {
  try {
    const response = await api.get('/api/subscriptions/myactiveplan')
    return response.data
  } catch (error) {
    if (error.response?.status === 204) return null
    if (error.response?.status === 400) return null
    throw error
  }
}
// ── CALCULATE UPGRADE COST ────────────────────────────────────
// GET /api/subscriptions/calculateupgrade?newPlanId=xxx
// Returns: { newPlanPrice, remainingValue, remainingDays, extraAmountToPay }
export const calculateUpgradeAPI = async (newPlanId) => {
  const response = await api.get('/api/subscriptions/calculateupgrade', {
    params: { newPlanId }
  })
  return response.data
}