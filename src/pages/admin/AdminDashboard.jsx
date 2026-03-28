import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  getAdminSummaryAPI,
  getPlanDistributionAPI,
  getSubscriptionGrowthAPI,
} from "../../services/adminService";
import { getAllUsersAPI } from "../../services/authService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ── Recharts colours ──────────────────────────────────────────
const PIE_COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

function AdminDashboard() {
  const navigate = useNavigate();

  // ── API data ──────────────────────────────────────────────
  const [summary, setSummary] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [growthData, setGrowthData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const fetchDashboard = async (from = "", to = "") => {
    setLoading(true);
    setError("");
    try {
      const [summaryData, usersData, growthRes, distRes] = await Promise.all([
        getAdminSummaryAPI(from, to),
        getAllUsersAPI(),
        getSubscriptionGrowthAPI(),
        getPlanDistributionAPI(),
      ]);
      setSummary(summaryData);
      setUserCount(usersData.length);

      // Growth: [ { month, count } ] → used directly by LineChart
      setGrowthData(growthRes);

      // Distribution: [ { planName, count, percentage } ]
      // Map planName → name for Recharts Legend
      setDistributionData(
        distRes.map((d) => ({
          name: d.planName,
          value: d.count,
          percentage: d.percentage,
        })),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Load overall summary on mount (no date params)
  useEffect(() => {
    fetchDashboard();
  }, []);

  // ── Apply date filter ───────────────────────────────────────
  const handleFilter = () => {
    setDateError("");
    if (fromDate && toDate && fromDate > toDate) {
      setDateError('"From" date cannot be after "To" date.');
      return;
    }
    fetchDashboard(fromDate, toDate);
  };

  // ── Clear filter → reload overall summary ──────────────────
  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setDateError("");
    fetchDashboard();
  };

  // ── KPI cards built from real API data ────────────────────
  const kpiCards = summary
    ? [
        {
          icon: "💳",
          label: "Active Subscriptions",
          value: summary.totalActiveSubscriptions ?? "—",
          sub: `+${summary.newSubscriptionsThisMonth ?? 0} this month`,
          color: "#4f46e5",
        },
        {
          icon: "💰",
          label: "Monthly Revenue (MRR)",
          value:
            summary.monthlyRecurringRevenue != null
              ? `₹${Number(summary.monthlyRecurringRevenue).toLocaleString("en-IN")}`
              : "—",
          sub: "Recurring revenue",
          color: "#10b981",
        },
        {
          icon: "🔔",
          label: "Renewals (Next 30 Days)",
          value: summary.upcomingRenewalsNext30Days ?? "—",
          sub: "Action needed",
          color: "#f59e0b",
        },
        {
          icon: "👥",
          label: "Total Users",
          value: userCount ?? "—",
          sub: "Registered accounts",
          color: "#06b6d4",
        },
        {
          icon: "📉",
          label: "Churn Rate",
          value: summary.churnRate != null ? `${summary.churnRate}%` : "—",
          sub: "Current period",
          color: "#ef4444",
        },
        {
          icon: "🆕",
          label: "New This Month",
          value: summary.newSubscriptionsThisMonth ?? "—",
          sub: "New subscriptions",
          color: "#8b5cf6",
        },
      ]
    : [];

  

  return (
    <div>
      <AdminNavbar />
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-content">
          {/* Page header */}
          <div className="admin-page-header">
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-subtitle">
              Welcome back — here's what's happening today.
            </p>
          </div>
          {/* ── Date range filter ── */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              padding: "16px 24px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-end",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "0 0 auto" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-light)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                From date
              </div>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDateError("");
                }}
                style={{
                  padding: "9px 14px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "var(--text-dark)",
                  background: "var(--bg)",
                  outline: "none",
                  cursor: "pointer",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div style={{ flex: "0 0 auto" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-light)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "6px",
                }}
              >
                To date
              </div>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDateError("");
                }}
                style={{
                  padding: "9px 14px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "8px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "var(--text-dark)",
                  background: "var(--bg)",
                  outline: "none",
                  cursor: "pointer",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                className="btn-admin-primary"
                onClick={handleFilter}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Loading..." : "Apply filter"}
              </button>

              {(fromDate || toDate) && (
                <button
                  className="btn-modal-cancel"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Active filter badge */}
            {(fromDate || toDate) && !loading && (
              <div
                style={{
                  background: "#e0e7ff",
                  color: "#3730a3",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}
              >
                📅 Showing: {fromDate ? fromDate : "start"} →{" "}
                {toDate ? toDate : "today"}
              </div>
            )}

            {/* Date validation error */}
            {dateError && (
              <div
                style={{
                  width: "100%",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  color: "var(--error)",
                }}
              >
                {dateError}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="smp-error-msg" style={{ marginBottom: "20px" }}>
              {error}
            </div>
          )}

          {/* KPI cards */}
          {loading ? (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                padding: "40px",
                textAlign: "center",
                color: "var(--text-light)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              Loading dashboard...
            </div>
          ) : (
            <div className="kpi-grid" style={{ marginBottom: "28px" }}>
              {kpiCards.map((k) => (
                <div className="kpi-card" key={k.label}>
                  <div className="kpi-card-icon">{k.icon}</div>
                  <div className="kpi-card-label">{k.label}</div>
                  <div className="kpi-card-value" style={{ color: k.color }}>
                    {k.value}
                  </div>
                  <div className="kpi-card-sub">{k.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Charts row */}
          <div className="charts-grid" style={{ marginBottom: "28px" }}>
            {/* Subscription growth line chart */}
            <div className="chart-card">
              <h3
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "15px",
                  fontWeight: "600",
                  marginBottom: "20px",
                  color: "var(--text-dark)",
                }}
              >
                Subscription growth
              </h3>
              {growthData.length === 0 ? (
                <div
                  style={{
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-light)",
                    fontSize: "14px",
                  }}
                >
                  No growth data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [value, "Subscriptions"]} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={{ fill: "#4f46e5", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Plan distribution pie chart */}
            <div className="chart-card">
              <h3
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "15px",
                  fontWeight: "600",
                  marginBottom: "20px",
                  color: "var(--text-dark)",
                }}
              >
                Plan distribution
              </h3>
              {distributionData.length === 0 ? (
                <div
                  style={{
                    height: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-light)",
                    fontSize: "14px",
                  }}
                >
                  No subscriptions yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percentage }) =>
                        `${name} ${percentage != null ? percentage + "%" : ""}`
                      }
                      labelLine={false}
                    >
                      {distributionData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                        const item = distributionData.find(
                          (d) => d.name === name,
                        );
                        return [
                          `${value} subscribers (${item?.percentage ?? 0}%)`,
                          name,
                        ];
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
