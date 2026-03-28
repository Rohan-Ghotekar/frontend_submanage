import api from './axios'

// ── LOGIN ─────────────────────────────────────────────────────
// Sends email + password to Spring Boot.
// Spring Boot returns: { token, name, email, role }
export const loginAPI = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password })
  // console.log('Spring Boot login response:', response.data)
  return response.data
  // Expected response shape from Spring Boot:
  // {
  //   token: "eyJhbGciOiJSUzI1...",
  //   name:  "Jane Smith",
  //   email: "jane@example.com",
  //   role:  "user"   ← or "admin"
  // }
}

// ── REGISTER ──────────────────────────────────────────────────
// Sends name + email + mobile + password to Spring Boot.
// Role is NOT sent — Spring Boot assigns "user" by default.
// Spring Boot returns: { message: "User registered successfully" }
export const registerAPI = async (fullName, email, mobile, password) => {
  const response = await api.post('/api/auth/register', {
    fullName,
    email,
    mobile,
    password,
    // role is intentionally omitted — backend defaults to "user"
  })
  return response.data
}

// ── SEND OTP ──────────────────────────────────────────────────
// Asks backend to email an OTP to this address.
// Spring Boot returns: { message: "OTP sent" }
// ⚠️  Uncomment this when your backend has the OTP endpoint ready.
export const sendOtpAPI = async (email) => {
  const response = await api.post('/api/auth/sendotp', { email })
  return response.data
}

// ── VERIFY OTP ────────────────────────────────────────────────
export const verifyOtpAPI = async (email, otp) => {
  const response = await api.post('/api/auth/verifyotp', { email, otp })
  return response.data
}

// ── RESET PASSWORD ────────────────────────────────────────────
export const resetPasswordAPI = async (email, newPassword) => {
  const response = await api.post('/api/auth/forgotpass', { email, newPassword })
  return response.data
}

// ── CHANGE PASSWORD ───────────────────────────────────────────
// Sends old + new password to backend for authenticated user
export const changePasswordAPI = async (oldPassword, newPassword) => {
  const response = await api.put('/api/user/changepassword', {
    oldPassword,
    newPassword,
  })
  return response.data
}

// ── UPDATE PROFILE ────────────────────────────────────────────
// PUT /api/user/updateprofile
// JWT sent automatically by Axios interceptor
// Backend accepts: { fullName, mobile }
export const updateProfileAPI = async (fullName, mobile) => {
  const response = await api.put('/api/user/updateprofile', {
    fullName,
    mobile,
  })
  return response.data
}

// ── GET PROFILE ───────────────────────────────────────────────
// GET /api/user/profile
// Returns: { userId, email, fullName, avatarUrl, role, createdAt, updatedAt }
export const getProfileAPI = async () => {
  const response = await api.get('/api/user/profile')
  return response.data
}

// ── GET ALL USERS (Admin) ─────────────────────────────────────
// GET /api/admin/getallusers
// Returns: [ { userId, email, fullName, role, createdAt, updatedAt, avatarUrl } ]
export const getAllUsersAPI = async () => {
  const response = await api.get('/api/admin/getallusers')
  return response.data
}
// ── UPDATE PROFILE PHOTO ──────────────────────────────────────
// PUT /api/user/updateprofilephoto
// Sends image as multipart/form-data with field name "avatar"
// Returns: { userId, email, fullName, avatarUrl, role, ... }
export const updateProfilePhotoAPI = async (imageFile) => {
  const formData = new FormData()
  formData.append('avatar', imageFile)

  const response = await api.put('/api/user/updateprofilephoto', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// ── VERIFY EMAIL AVAILABILITY ─────────────────────────────────
// GET /api/auth/verifyemail?email=xxx
// Returns: { succuss: true, message: "New Email.." }  → available
//          { succuss: false, message: "..." }          → already exists
export const verifyEmailAPI = async (email) => {
  const response = await api.get('/api/auth/verifyemail', {
    params: { email }
  })
  return response.data
}
