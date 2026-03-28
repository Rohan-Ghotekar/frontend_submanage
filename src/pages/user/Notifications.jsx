import { useState, useEffect } from "react";
import UserNavbar from "../../components/UserNavbar";
import UserSidebar from "../../components/UserSidebar";
import {
  getAllNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from "../../services/notificationService";

const formatTime = (isoString) => {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const typeIcon = (type = "") => {
  switch (type.toUpperCase()) {
    case "SUBSCRIPTION_CONFIRMED":
      return "✅";
    case "SUBSCRIPTION_CANCELLED":
      return "❌";
    case "PLAN_SWITCHED":
      return "🔄";
    case "RENEWAL_REMINDER":
      return "🔔";
    case "PAYMENT_SUCCESS":
      return "💳";
    case "WELCOME":
      return "🎉";
    default:
      return "📣";
  }
};

const typeColor = (type = "") => {
  switch (type.toUpperCase()) {
    case "SUBSCRIPTION_CONFIRMED":
      return { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" };
    case "SUBSCRIPTION_CANCELLED":
      return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };
    case "PLAN_SWITCHED":
      return { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" };
    case "RENEWAL_REMINDER":
      return { bg: "#fffbeb", border: "#fde68a", text: "#92400e" };
    case "PAYMENT_SUCCESS":
      return { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" };
    default:
      return { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };
  }
};

// ── Notification detail modal ─────────────────────────────────
function NotificationModal({ notif, onClose }) {
  if (!notif) return null;
  const colors = typeColor(notif.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: "480px", textAlign: "left" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header band */}
        <div
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "28px" }}>{typeIcon(notif.type)}</span>
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: colors.text,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "2px",
              }}
            >
              {notif.type?.replace(/_/g, " ") || "Notification"}
            </div>
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text-dark)",
              }}
            >
              {notif.title}
            </div>
          </div>
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: "14px",
            color: "var(--text-mid)",
            lineHeight: "1.7",
            marginBottom: "20px",
            padding: "0 4px",
          }}
        >
          {notif.message}
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-light)",
            marginBottom: "24px",
            padding: "0 4px",
          }}
        >
          🕐 {formatTime(notif.createdAt)}
          {notif.createdAt && (
            <span style={{ marginLeft: "8px" }}>
              ·{" "}
              {new Date(notif.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getAllNotificationsAPI();
        const sorted = [...data].sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setNotifs(sorted);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // ── Click unread → open modal + mark as read in DB ──────────
  const handleNotifClick = async (notif) => {
    // Always open the modal
    setSelectedNotif(notif);

    // Only call API if still unread
    if (!notif.read) {
      try {
        await markNotificationReadAPI(notif.id);
        // Update local state so dot disappears + badge decrements
        setNotifs((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
        );
        // Also update the selected notif so modal shows as read
        setSelectedNotif((prev) => (prev ? { ...prev, read: true } : prev));
      } catch {
        // Silently fail — UI already shows as read optimistically
      }
    }
  };

  // ── Mark all as read locally ─────────────────────────────────
  // TODO: connect to /api/notification/readall when ready
  const [markingAll, setMarkingAll] = useState(false);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsReadAPI();
      // Update all notifications as read locally
      setNotifs((n) => n.map((item) => ({ ...item, read: true })));
    } catch (err) {
      // Silently fail — optimistic update already done
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <UserNavbar />
      <div className="user-shell">
        <UserSidebar unreadCount={unreadCount} />
        <main className="user-content">
          {/* Page header */}
          <div
            className="admin-page-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1 className="admin-page-title">
                Notifications{" "}
                {unreadCount > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--brand)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "700",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      marginLeft: "8px",
                      verticalAlign: "middle",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="admin-page-subtitle">
                Stay up to date with your subscription activity.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                className="btn-admin-secondary"
                onClick={markAllRead}
                disabled={markingAll}
                style={{ opacity: markingAll ? 0.7 : 1 }}
              >
                {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="page-loading-card">
              Loading notifications...
            </div>
          )}

          {/* Error */}
          {!loading && error && <div className="smp-error-msg">{error}</div>}

          {/* Notifications list */}
          {!loading && !error && (
            <div className="data-table-card">
              {notifs.length === 0 ? (
                <div className="empty-state-card">
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>
                    🔔
                  </div>
                  <div
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "var(--text-dark)",
                      marginBottom: "6px",
                    }}
                  >
                    All caught up!
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-mid)" }}>
                    No notifications yet.
                  </div>
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    className={"notif-item" + (!n.read ? " unread" : "")}
                    onClick={() => handleNotifClick(n)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Unread dot */}
                    <div className={"notif-dot" + (n.read ? " read" : "")} />

                    {/* Type icon */}
                    <div
                      style={{
                        fontSize: "20px",
                        flexShrink: 0,
                        width: "32px",
                        textAlign: "center",
                      }}
                    >
                      {typeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-body">{n.message}</div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "4px",
                        }}
                      >
                        <div className="notif-time">
                          {formatTime(n.createdAt)}
                        </div>
                        {n.type && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: "var(--text-light)",
                              background: "#f1f5f9",
                              padding: "2px 8px",
                              borderRadius: "20px",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {n.type.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* New badge or arrow */}
                    {!n.read ? (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--brand)",
                          fontWeight: "700",
                          flexShrink: 0,
                        }}
                      >
                        New
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--text-light)",
                          flexShrink: 0,
                        }}
                      >
                        ›
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Notification detail modal */}
      {selectedNotif && (
        <NotificationModal
          notif={selectedNotif}
          onClose={() => setSelectedNotif(null)}
        />
      )}
    </div>
  );
}

export default Notifications;
