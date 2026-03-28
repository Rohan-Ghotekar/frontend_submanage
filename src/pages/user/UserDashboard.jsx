
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserNavbar from '../../components/UserNavbar'
import UserSidebar from '../../components/UserSidebar'
import { getMyActivePlanAPI } from '../../services/subscriptionService'
function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [subscription, setSubscription] = useState(null)
  const [subLoading, setSubLoading] = useState(true)

useEffect(() => {
  const fetchSub = async () => {
    setSubLoading(true)
    try {
      const data = await getMyActivePlanAPI()
      if (!data) {
  setSubscription(null)
  return
}
      setSubscription({
        subId:       data.subId,
        planId:      data.planId,
        planName:    data.planName,
        price:       data.price || data.planPrice || data.Price ||0,
        billing:     data.billing,
        renewalDate: data.endDate,
        status:      data.status,
      })
    } catch {
      // 404 = no subscription, show "no active subscription" UI
      setSubscription(null)
    } finally {
      setSubLoading(false)
    }
  }
  fetchSub()
}, [user])

  const quickActions = [
    { icon: '📋', label: 'Browse Plans',    path: '/plans',        color: '#4f46e5' },
    { icon: '💳', label: 'My Subscription', path: '/subscription', color: '#0f4c3a' },
    { icon: '👤', label: 'My Profile',      path: '/profile',      color: '#06b6d4' },
    { icon: '🔔', label: 'Notifications',   path: '/notifications',color: '#f59e0b' },
  ]

  return (
    <div>
      <UserNavbar />
      <div className="user-shell">
        <UserSidebar />
        <main className="user-content">

          {/* Welcome banner */}
          <div className="dashboard-hero-card">
            <div>
              <h1 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '24px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '6px',
              }}>
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
                {subLoading
                  ? "Loading your subscription details..."
                  : subscription
                  ? `You're on the ${subscription.planName} plan — renews on ${subscription.renewalDate}`
                  : "You don't have an active subscription yet."}
              </p>
            </div>
            {!subLoading && !subscription && (
              <button
                className="btn-select-plan"
                style={{ width: 'auto', padding: '12px 24px' }}
                onClick={() => navigate('/plans')}
              >
                Browse Plans →
              </button>
            )}
            {!subLoading && subscription && (
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '12px',
                padding: '14px 20px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#6ee7b7',
                  marginBottom: '2px',
                }}>
                  {subscription.planName}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                  Active plan
                </div>
              </div>
            )}
          </div>

          {/* Subscription status card */}
          {subLoading ? (
            <div className="page-loading-card" style={{ marginBottom: '24px' }}>
              Loading subscription summary...
            </div>
          ) : subscription ? (
            <div className="sub-detail-card" style={{ marginBottom: '24px' }}>
              <div className="sub-detail-header">
                <div>
                  <div className="sub-detail-title">Current Subscription</div>
                  <div className="sub-detail-meta">
                    Manage your active plan below
                  </div>
                </div>
                <span className="badge badge-active">Active</span>
              </div>
              <div className="sub-info-grid">
                <div className="sub-info-item">
                  <div className="sub-info-label">Plan</div>
                  <div className="sub-info-value">{subscription.planName}</div>
                </div>
                <div className="sub-info-item">
                  <div className="sub-info-label">Price</div>
                  <div className="sub-info-value" style={{ color: 'var(--brand)' }}>
                    ₹{subscription.price}
                    <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 400 }}>
                      /mo
                    </span>
                  </div>
                </div>
                <div className="sub-info-item">
                  <div className="sub-info-label">Renewal date</div>
                  <div className="sub-info-value" style={{ fontSize: '15px' }}>
                    {subscription.renewalDate}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <span style={{ fontSize: '28px' }}>💡</span>
              <div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: '600',
                  color: '#92400e',
                  marginBottom: '4px',
                }}>
                  No active subscription
                </div>
                <div style={{ fontSize: '13px', color: '#78350f' }}>
                  Choose a plan to unlock all features.{' '}
                  <span
                    onClick={() => navigate('/plans')}
                    style={{
                      color: 'var(--brand)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Browse plans →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ marginBottom: '8px' }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-dark)',
              marginBottom: '14px',
            }}>
              Quick actions
            </h2>
            <div className="quick-actions-grid">
              {quickActions.map(a => (
                <div
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="quick-action-card"
                  style={{ borderColor: a.color + '22' }}
                >
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>{a.icon}</div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text-dark)',
                  }}>
                    {a.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

export default UserDashboard