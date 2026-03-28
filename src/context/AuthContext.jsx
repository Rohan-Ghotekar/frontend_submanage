import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, registerAPI } from "../services/authService";

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("smp_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("smp_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("smp_user");
      sessionStorage.removeItem("smp_token");
      sessionStorage.removeItem("smp_refresh_token");
    }
  }, [user]);

  // ── LOGIN ────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);

   
    // 2. Call Spring Boot for real users
    try {
      const data = await loginAPI(email, password);
      if (data.success === false) {
        setLoading(false);
        return {
          success: false,
          message: data.message || "Invalid email or password.",
        };
      }
      // ── Map your exact Spring Boot field names ──────────────
      const accessToken = data.accessToken; // "eyJhbGc..."
      const refreshToken = data.refreshToken; // "eyJhbGc..."
      const fullName = data.fullName; // "Unnati Wagh"
      const role = (data.role || "user").toLowerCase(); // "USER" → "user"

      if (!accessToken) {
        setLoading(false);
        return {
          success: false,
          message: "Login failed — no token received. Please try again.",
        };
      }
      // Store both tokens in sessionStorage
      sessionStorage.setItem("smp_token", accessToken);
      
      sessionStorage.setItem("smp_refresh_token", refreshToken);

      const loggedInUser = {
        name: fullName,
        email: email,
        role: role,
        avatarUrl: data.avatarUrl || null,
      };

      setUser(loggedInUser);
      setLoading(false);
      return { success: true, role };
    } catch (error) {
      setLoading(false);
      const message =
        error.response?.data?.message || "Invalid email or password.";
      return { success: false, message };
    }
  };

  // ── REGISTER ─────────────────────────────────────────────────
  const register = async (name, email, mobile, password) => {
    setLoading(true);
    try {
      await registerAPI(name, email, mobile, password);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      return { success: false, message };
    }
  };

  // ── LOGOUT ───────────────────────────────────────────────────
  const logout = () => setUser(null);
// ── UPDATE USER (for profile edits) ──────────────────────────
// Refreshes the user object in context + sessionStorage
// so the navbar name updates immediately after profile save
   const updateUser = (updatedUser) => {
  setUser(updatedUser)
    }
    // ── UPDATE AVATAR ─────────────────────────────────────────────
const updateAvatar = (url) => {
  setUser(prev => {
    if (!prev) return prev
    const updated = { ...prev, avatarUrl: url }
    sessionStorage.setItem('smp_user', JSON.stringify(updated))
    return updated
  })
}

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, updateUser, updateAvatar}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
