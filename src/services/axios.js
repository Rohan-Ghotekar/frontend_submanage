import axios from 'axios'

// ── Base URL ─────────────────────────────────────────────────
// All API calls will be prefixed with this automatically.
// Change this one line when you deploy to AWS.
const api = axios.create({
  // baseURL: 'https://13.201.8.73.nip.io',
  baseURL: 'https://13.201.8.73.nip.io',
  headers: {
    'Content-Type': 'application/json' ,
    'ngrok-skip-browser-warning': 'true',
  },
})

// ── Request interceptor ──────────────────────────────────────
// Before EVERY request goes out, this runs automatically.
// It reads the JWT token from sessionStorage and attaches it.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('smp_token')
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
       console.log(config.headers.Authorization) 
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ─────────────────────────────────────
// If the server returns 401 (token expired / invalid),
// automatically clear the session and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('smp_token')
      sessionStorage.removeItem('smp_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api