import "./App.css";
import PageTransition from "./components/PageTransition";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePlans from "./pages/admin/ManagePlans";
import AdminPayments from "./pages/admin/AdminPayments";
import Analytics from "./pages/admin/Analytics";
import ManageUsers from "./pages/admin/ManageUsers";

// User pages

import UserDashboard from "./pages/user/UserDashboard";
import Plans from "./pages/user/Plans";
import Subscription from "./pages/user/Subscription";
import Profile from "./pages/user/Profile";
import Notifications from "./pages/user/Notifications";
import ChangePassword from "./pages/user/ChangePassword";
import PaymentSuccess from "./pages/user/PaymentSuccess";
import PaymentCancel from "./pages/user/PaymentCancel";
import BillingHistory from "./pages/user/BillingHistory";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin payments */}
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRole="admin">
                <PageTransition>
                  <AdminPayments />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute allowedRole="admin">
                <PageTransition>
                  <ManagePlans />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/plans/create"
            element={
              <ProtectedRoute allowedRole="admin">
                <PageTransition>
                  <ManagePlans />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRole="admin">
                <PageTransition>
                  <Analytics />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRole="admin">
                <PageTransition>
                  <ManageUsers />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          {/* User routes */}
          {/* Payment routes — public so Stripe can redirect back */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="user">
                <PageTransition>
                  <UserDashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          {/* User billing */}
          <Route
            path="/billing"
            element={
              <ProtectedRoute allowedRole="user">
                <PageTransition>
                  <BillingHistory />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute allowedRole="user">
                <PageTransition>
                  <Plans />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute allowedRole="user">
                <PageTransition>
                  <Subscription />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRole="user">
                <PageTransition>
                  <Profile />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRole="user">
                <PageTransition>
                  <Notifications />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRole="user">
                <PageTransition>
                  <ChangePassword />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Default: redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
