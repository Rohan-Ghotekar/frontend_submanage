import api from './axios'

// ── CREATE PLAN ───────────────────────────────────────────────
// POST /api/plan/createplan
// Request:  { name, description, price, billingInterval, features[] }
// Response: { id, name, description, price, billingInterval,
//             features[], imageUrl, active, subscriberCount, createdAt }
export const createPlanAPI = async (planData) => {
  const response = await api.post('/api/plan/createplan', planData)
  return response.data
}

// ── GET ALL PLANS ─────────────────────────────────────────────
// Uncomment when your GET /api/plan endpoint is ready
export const getAllPlansAPI = async () => {
  const response = await api.get('/api/plan/getallplans')
  return response.data
}
// ── GET PLAN BY NAME ──────────────────────────────────────────
// GET /api/plan/getplanbyname/{name}
// Returns: single plan object { id, name, description, price,
//          billingInterval, tier, features[], imageUrl,
//          active, subscriberCount, createdAt }
export const getPlanByNameAPI = async (name) => {
  const response = await api.get(`/api/plan/getplanbyname/${encodeURIComponent(name)}`)
  return response.data
}


// ── UPDATE PLAN ───────────────────────────────────────────────
// Uncomment when your PUT /api/plan/:id endpoint is ready
export const updatePlanAPI = async (planData) => {
  const response = await api.put('/api/plan/updateplan', planData)
  return response.data
}


// ── DEACTIVATE PLAN ───────────────────────────────────────────
// PUT /api/plan/deactivateplan/{id}
export const deactivatePlanAPI = async (id) => {
  const response = await api.put(`/api/plan/deactivateplan/${id}`)
  return response.data
}

// ── ACTIVATE PLAN ─────────────────────────────────────────────
// PUT /api/plan/activateplan/{id}
export const activatePlanAPI = async (id) => {
  const response = await api.put(`/api/plan/activateplan/${id}`)
  return response.data
}

// ── TOGGLE PLAN STATUS ────────────────────────────────────────
// Uncomment when your endpoint is ready
// export const togglePlanStatusAPI = async (id) => {
//   const response = await api.patch(`/api/plan/${id}/status`)
//   return response.data
// }

// ── GET PLANS BY STATUS ───────────────────────────────────────
// GET /api/plan/getallplansbystatus/{status}
// status: true = active plans, false = inactive plans
export const getPlansByStatusAPI = async (status) => {
  const response = await api.get(`/api/plan/getallplansbystatus/${status}`)
  return response.data
}