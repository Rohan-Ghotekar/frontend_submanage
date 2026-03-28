import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  cancelSubscriptionAPI,
  getMyActivePlanAPI,
} from "../../services/subscriptionService";
import UserNavbar from "../../components/UserNavbar";
import UserSidebar from "../../components/UserSidebar";

function Subscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      setFetching(true);
      try {
        // GET /api/subscriptions/myactiveplan
        // JWT identifies the user — no params needed
        const data = await getMyActivePlanAPI();
       if (!data) {
  setSub(null);
  sessionStorage.removeItem(`smp_subscription_${user?.email}`);
  return;
}
        // Map response fields to our standard shape
        const subscription = {
          subId: data.subId,
          planId: String(data.planId),
          planName: data.planName,
          price: data.price || data.planPrice || data.Price || 0,
          billing: data.billing || data.billingInterval,
          startDate: data.startDate,
          renewalDate: data.endDate,
          daysRemaining: data.daysRemaining,
          autoRenew: data.autoRenew,
          tier: data.tier,
          status: data.status,
        };

        setSub(subscription);

        // Keep sessionStorage in sync for other pages
        sessionStorage.setItem(
          `smp_subscription_${user?.email}`,
          JSON.stringify(subscription),
        );
      } catch (err) {
        if (err.response?.status === 404) {
          // No active subscription — clear storage
          setSub(null);
          sessionStorage.removeItem(`smp_subscription_${user?.email}`);
        } else {
          // API error — fall back to sessionStorage cache
          const cached = sessionStorage.getItem(
            `smp_subscription_${user?.email}`,
          );
          if (cached) setSub(JSON.parse(cached));
          else setSub(null);
        }
      } finally {
        setFetching(false);
      }
    };
    fetchSubscription();
  }, [user]);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const handleCancel = async () => {
    setCancelling(true);
    try {
      // PUT /api/subscriptions/cancel/{subId}
      // subId stored in subscription object from subscribe API
      const subId = sub.subId;
      if (!subId) {
        throw new Error("Subscription ID not found.");
      }
      await cancelSubscriptionAPI(subId);

      // Clear subscription from sessionStorage
      sessionStorage.removeItem(`smp_subscription_${user?.email}`);

      // Update UI immediately (for plans-page counters, if visible) and other tabs
      window.dispatchEvent(
        new CustomEvent("smp-subscription-updated", {
          detail: { action: "cancel", planId: sub?.planId },
        }),
      );

      setSub(null);
      setShowCancel(false);
      setCancelled(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel subscription. Please try again.";
      // Show error inside modal instead of closing it
      setCancelError(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (cancelled || !sub) {
    return (
      <div>
        <UserNavbar />
        <div className="user-shell">
          <UserSidebar />
          <main className="user-content">
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "white",
                borderRadius: "16px",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                {cancelled ? "✅" : "📭"}
              </div>
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "var(--text-dark)",
                  marginBottom: "8px",
                }}
              >
                {cancelled
                  ? "Subscription cancelled"
                  : "No active subscription"}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-mid)",
                  marginBottom: "24px",
                }}
              >
                {cancelled
                  ? "Your subscription has been cancelled successfully."
                  : "You don't have an active subscription yet."}
              </p>
              <button
                className="btn-select-plan"
                style={{
                  width: "auto",
                  padding: "12px 28px",
                  margin: "0 auto",
                }}
                onClick={() => navigate("/plans")}
              >
                Browse plans →
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UserNavbar />
      <div className="user-shell">
        <UserSidebar />
        <main className="user-content">
          {fetching ? (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "80px",
                textAlign: "center",
                color: "var(--text-light)",
                fontSize: "14px",
              }}
            >
              Loading your subscription...
            </div>
          ) : (
            <>
              <div className="admin-page-header">
                <h1 className="admin-page-title">My Subscription</h1>
                <p className="admin-page-subtitle">
                  View and manage your active subscription.
                </p>
              </div>
              {/* Main subscription card */}
              <div className="sub-detail-card">
                <div className="sub-detail-header">
                  <div>
                    <div className="sub-detail-title">{sub.planName} Plan</div>
                    <div className="sub-detail-meta">
                      Subscribed since {sub.startDate}
                    </div>
                  </div>
                  <span className="badge badge-active">Active</span>
                </div>

                <div className="sub-info-grid" style={{ marginBottom: "24px" }}>
                  <div className="sub-info-item">
                    <div className="sub-info-label">Plan tier</div>
                    <div className="sub-info-value">{sub.tier}</div>
                  </div>
                  <div className="sub-info-item">
                    <div className="sub-info-label">Plan price</div>
                    <div
                      className="sub-info-value"
                      style={{ color: "var(--brand)" }}
                    >
                      ₹{sub.price || sub.planPrice || "—"}
                    </div>
                  </div>
                  <div className="sub-info-item">
                    <div className="sub-info-label">Billing cycle</div>
                    <div
                      className="sub-info-value"
                      style={{ fontSize: "15px" }}
                    >
                      {sub.billing}
                    </div>
                  </div>
                  <div className="sub-info-item">
                    <div className="sub-info-label">Start date</div>
                    <div
                      className="sub-info-value"
                      style={{ fontSize: "15px" }}
                    >
                      {sub.startDate}
                    </div>
                  </div>
                  <div className="sub-info-item">
                    <div className="sub-info-label">Next renewal</div>
                    <div
                      className="sub-info-value"
                      style={{ fontSize: "15px" }}
                    >
                      {sub.renewalDate}
                    </div>
                  </div>
                  <div className="sub-info-item">
                    <div className="sub-info-label">Status</div>
                    <div
                      className="sub-info-value"
                      style={{
                        fontSize: "15px",
                        color: "#10b981",
                      }}
                    >
                      ● Active
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn-admin-primary"
                    onClick={() => navigate("/plans")}
                  >
                    🔄 Change plan
                  </button>
                  <button
                    className="btn-admin-danger"
                    onClick={() => setShowCancel(true)}
                    style={{ padding: "9px 18px" }}
                  >
                    ✕ Cancel subscription
                  </button>
                </div>
              </div>

              {/* Billing history */}
              <div className="data-table-card">
                <div className="data-table-header">
                  <h3>Billing history</h3>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{sub.startDate}</td>
                      <td>
                        {sub.planName} plan — {sub.billing}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--brand)" }}>
                        ₹{sub.price}
                      </td>
                      <td>
                        <span className="badge badge-active">Paid</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: "var(--text-light)" }}>
                        {sub.renewalDate}
                      </td>
                      <td style={{ color: "var(--text-light)" }}>
                        {sub.planName} plan — upcoming renewal
                      </td>
                      <td style={{ color: "var(--text-light)" }}>
                        ₹{sub.price}
                      </td>
                      <td>
                        <span className="badge badge-pending">Upcoming</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="modal-overlay" onClick={() => setShowCancel(false)}>
          <div
            className="confirm-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon">⚠️</div>
            <div className="confirm-modal-title">Cancel subscription?</div>
            <div className="confirm-modal-body">
              Are you sure you want to cancel your{" "}
              <strong>{sub.planName}</strong> plan?
              <br />
              <span style={{ color: "var(--error)", fontSize: "13px" }}>
                This action cannot be undone. You will lose access to all plan
                features immediately.
              </span>
            </div>
            {/* Cancel error inside modal */}
            {cancelError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "var(--error)",
                  marginBottom: "16px",
                }}
              >
                {cancelError}
              </div>
            )}

            <div className="confirm-modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => {
                  setShowCancel(false);
                  setCancelError("");
                }}
                disabled={cancelling}
              >
                Keep my plan
              </button>
              <button
                className="btn-admin-danger"
                style={{
                  padding: "9px 20px",
                  fontSize: "13px",
                  opacity: cancelling ? 0.7 : 1,
                }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscription;
