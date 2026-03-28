import api from './axios'

// ── GET ALL NOTIFICATIONS ─────────────────────────────────────
// GET /api/notification/getallnotifications
// JWT identifies the user automatically
// Returns: [ { id, title, message, type, read, createdAt } ]
export const getAllNotificationsAPI = async () => {
  const response = await api.get('/api/notification/getallnotifications')
  return response.data
}

// ── MARK NOTIFICATION AS READ ─────────────────────────────────
// PUT /api/notification/read/{notificationId}
export const markNotificationReadAPI = async (notificationId) => {
  const response = await api.put(`/api/notification/read/${notificationId}`)
  return response.data
}


// ── MARK ALL NOTIFICATIONS AS READ ────────────────────────────
// PUT /api/notification/readall
// No parameters — JWT identifies the user
export const markAllNotificationsReadAPI = async () => {
  const response = await api.put('/api/notification/readall')
  return response.data
}