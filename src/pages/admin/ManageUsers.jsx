import { useState, useEffect } from 'react'
import AdminNavbar from '../../components/AdminNavbar'
import AdminSidebar from '../../components/AdminSidebar'
import { getAllUsersAPI } from '../../services/authService'
import {getUserActivePlanAPI} from '../../services/adminService'

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

const roleBadge = (role = '') => {
  const r = role.toUpperCase()
  if (r === 'ADMIN') return { bg: '#fce7f3', color: '#9d174d' }
  return { bg: '#e0e7ff', color: '#3730a3' }
}

// ── Subscription modal ────────────────────────────────────────
function SubscriptionModal({ user, onClose }) {
  const [sub, setSub]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const fetchSub = async () => {
      setLoading(true)
      setError('')
      try {
        // GET /api/admin/getuseractiveplan/{userId}
        // Returns full subscription object
        const data = await getUserActivePlanAPI(user.userId)
        setSub(data)
      } catch (err) {
        if (err.response?.status === 404) {
          setSub(null)
        } else {
          setError(
            err.response?.data?.message ||
            'Failed to load subscription details.'
          )
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSub()
  }, [user])

  const displayBilling = (val = '') =>
    val.charAt(0) + val.slice(1).toLowerCase()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '24px',
        }}>
          <div>
            <h3 className="modal-title" style={{ marginBottom: '4px' }}>
              Subscription details
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {user.fullName} · {user.email}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: '20px', cursor: 'pointer',
            color: 'var(--text-light)', lineHeight: 1,
          }}>
            ✕
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: 'center', padding: '40px',
            color: 'var(--text-muted)', fontSize: '14px',
          }}>
            Loading subscription...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="smp-error-msg">{error}</div>
        )}

        {/* No subscription */}
        {!loading && !error && !sub && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'var(--bg-subtle)', borderRadius: '12px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px', fontWeight: '600',
              color: 'var(--text-dark)', marginBottom: '6px',
            }}>
              No active subscription
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              This user has not subscribed to any plan yet.
            </div>
          </div>
        )}

        {/* Subscription details */}
        {!loading && !error && sub && (
          <>
            {/* Plan name banner */}
            <div style={{
              background:
                sub.tier === 'ENTERPRISE'
                  ? 'linear-gradient(135deg, #0f172a, #1e293b)'
                  : sub.tier === 'PRO'
                  ? 'linear-gradient(135deg, #4a1d96, #6d28d9)'
                  : 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
              borderRadius: '12px', padding: '20px 24px',
              marginBottom: '20px',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  fontSize: '11px', fontWeight: '700',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: '6px',
                }}>
                  Active plan
                </div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px', fontWeight: '700', color: 'white',
                }}>
                  {sub.planName}
                </div>
                {sub.planDescription && (
                  <div style={{
                    fontSize: '12px', color: 'rgba(255,255,255,0.55)',
                    marginTop: '4px',
                  }}>
                    {sub.planDescription}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '26px', fontWeight: '700', color: '#67e8f9',
                }}>
                  ₹{sub.Price}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  /{displayBilling(sub.billing)}
                </div>
              </div>
            </div>

            {/* Info grid — 6 cells */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '12px', marginBottom: '20px',
            }}>
              {[
                {
                  label: 'Status',
                  value: sub.status,
                  valueStyle: {
                    color: sub.status === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
                  },
                },
                {
                  label: 'Tier',
                  value: sub.tier,
                },
                {
                  label: 'Billing cycle',
                  value: displayBilling(sub.billing),
                },
                {
                  label: 'Auto renew',
                  value: sub.autoRenew ? '✓ Enabled' : '✗ Disabled',
                  valueStyle: {
                    color: sub.autoRenew ? 'var(--success)' : 'var(--text-muted)',
                  },
                },
                {
                  label: 'Start date',
                  value: sub.startDate || '—',
                },
                {
                  label: 'Renewal date',
                  value: sub.endDate || '—',
                },
                {
                  label: 'Days remaining',
                  value: sub.daysRemaining != null
                    ? `${sub.daysRemaining} days`
                    : '—',
                  valueStyle: {
                    color: sub.daysRemaining <= 7
                      ? 'var(--error)'
                      : sub.daysRemaining <= 30
                      ? 'var(--warning)'
                      : 'var(--text-dark)',
                  },
                },
                
              ].map(item => (
                <div key={item.label} style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: '10px', padding: '14px 16px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700',
                    color: 'var(--text-light)', textTransform: 'uppercase',
                    letterSpacing: '0.06em', marginBottom: '6px',
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '15px', fontWeight: '600',
                    color: 'var(--text-dark)',
                    ...item.valueStyle,
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-modal-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
// ══════════════════════════════════════════════════════════════
function ManageUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  // Selected user for subscription modal
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const data = await getAllUsersAPI()
        setUsers(data)
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load users. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filtered = users.filter(u => {
    const matchSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole =
      roleFilter === 'ALL' ||
      u.role?.toUpperCase() === roleFilter
    return matchSearch && matchRole
  })

  const totalUsers = users.length
  const adminCount = users.filter(u => u.role?.toUpperCase() === 'ADMIN').length
  const userCount  = users.filter(u => u.role?.toUpperCase() === 'USER').length

  return (
    <div>
      <AdminNavbar />
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-content">

          <div className="admin-page-header">
            <h1 className="admin-page-title">Users</h1>
            <p className="admin-page-subtitle">
              All registered users on the SubManage platform.
            </p>
          </div>

          {/* 3 KPI cards — newest member removed */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px', marginBottom: '24px',
          }}>
            {[
              {
                icon: '👥', label: 'Total registered',
                value: loading ? '...' : totalUsers,
                sub: 'All accounts', color: '#4f46e5',
              },
              {
                icon: '👤', label: 'Regular users',
                value: loading ? '...' : userCount,
                sub: 'Role: USER', color: '#0f6e56',
              },
              {
                icon: '🛡️', label: 'Admins',
                value: loading ? '...' : adminCount,
                sub: 'Role: ADMIN', color: '#9d174d',
              },
            ].map(k => (
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

          {/* Search + filter */}
          <div style={{
            display: 'flex', gap: '12px',
            marginBottom: '16px', alignItems: 'center',
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px', color: 'var(--text-light)',
              }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px', color: 'var(--text-dark)',
                  background: 'white', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{
              display: 'flex', background: 'white',
              border: '1.5px solid var(--border)',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              {['ALL', 'USER', 'ADMIN'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  style={{
                    padding: '10px 18px',
                    background: roleFilter === r ? 'var(--brand)' : 'transparent',
                    color:      roleFilter === r ? 'white' : 'var(--text-mid)',
                    border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px', fontWeight: '600',
                    transition: 'all 0.15s',
                  }}
                >
                  {r === 'ALL'   ? `All (${totalUsers})` :
                   r === 'USER'  ? `Users (${userCount})` :
                                   `Admins (${adminCount})`}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="smp-error-msg" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Table */}
          <div className="data-table-card">
            <div className="data-table-header">
              <h3>
                {filtered.length} user{filtered.length !== 1 ? 's' : ''}
                {search || roleFilter !== 'ALL' ? ' (filtered)' : ''}
              </h3>
              <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                {loading ? 'Loading...' : `${totalUsers} total`}
              </span>
            </div>

            {loading ? (
              <div style={{
                padding: '60px', textAlign: 'center',
                color: 'var(--text-light)', fontSize: '14px',
              }}>
                Loading users...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
                <div style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '16px', fontWeight: '600',
                  color: 'var(--text-dark)', marginBottom: '6px',
                }}>
                  {search ? 'No users match your search' : 'No users found'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-mid)' }}>
                  {search ? 'Try a different name or email.'
                           : 'No users have registered yet.'}
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const badge = roleBadge(u.role)
                    return (
                      <tr key={u.userId}>

                        <td style={{
                          color: 'var(--text-light)',
                          fontWeight: '600', fontSize: '13px',
                        }}>
                          {i + 1}
                        </td>

                        {/* Avatar + name */}
                        <td>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                          }}>
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.fullName}
                                style={{
                                  width: '34px', height: '34px',
                                  borderRadius: '50%', objectFit: 'cover',
                                  border: '2px solid var(--border)',
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '34px', height: '34px',
                                borderRadius: '50%',
                                background: 'var(--brand-light)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: "'Sora', sans-serif",
                                fontSize: '12px', fontWeight: '700',
                                color: 'var(--brand)', flexShrink: 0,
                              }}>
                                {getInitials(u.fullName)}
                              </div>
                            )}
                            <span style={{ fontWeight: '500' }}>
                              {u.fullName || '—'}
                            </span>
                          </div>
                        </td>

                        <td style={{
                          color: 'var(--text-mid)', fontSize: '13px',
                        }}>
                          {u.email}
                        </td>

                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: '700',
                            background: badge.bg, color: badge.color,
                          }}>
                            {u.role?.toUpperCase() || '—'}
                          </span>
                        </td>

                        <td style={{
                          color: 'var(--text-mid)', fontSize: '13px',
                        }}>
                          {formatDate(u.createdAt)}
                        </td>

                        {/* View subscription button */}
                        <td>
                          <button
                            className="btn-admin-secondary"
                            onClick={() => setSelectedUser(u)}
                          >
                            📋 View subscription
                          </button>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>

      {/* Subscription modal */}
      {selectedUser && (
        <SubscriptionModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}

export default ManageUsers