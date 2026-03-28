import { useState, useEffect } from 'react'
import AdminNavbar from '../../components/AdminNavbar'
import AdminSidebar from '../../components/AdminSidebar'
import { getPaymentHistoryAPI } from '../../services/paymentService'

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const statusStyle = (status) => {
  switch (status) {
    case 'SUCCESS':  return { bg: 'var(--success-bg)',  color: '#065f46', border: 'var(--success-border)' }
    case 'PENDING':  return { bg: 'var(--warning-bg)',  color: '#92400e', border: 'var(--warning-border)' }
    case 'FAILED':   return { bg: 'var(--error-bg)',    color: '#991b1b', border: 'var(--error-border)'   }
    case 'REFUNDED': return { bg: 'var(--info-bg)',     color: '#1e40af', border: 'var(--info-border)'    }
    default:         return { bg: 'var(--bg-subtle)',   color: 'var(--text-muted)', border: 'var(--border)' }
  }
}

function AdminPayments() {
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await getPaymentHistoryAPI()
        setHistory(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load billing history.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const totalPaid = history
    .filter(h => h.status === 'SUCCESS')
    .reduce((sum, h) => sum + Number(h.amount), 0)

  return (
    <div>
      <AdminNavbar />
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-content">

          <div className="admin-page-header">
            <h1 className="admin-page-title">Billing history</h1>
            <p className="admin-page-subtitle">
              Review payment transactions and statuses.
            </p>
          </div>

          {/* Summary cards */}
          {!loading && !error && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px', marginBottom: '24px',
            }}>
              {[
                {
                  icon: '💳', label: 'Total transactions',
                  value: history.length, color: 'var(--brand)',
                },
                {
                  icon: '✅', label: 'Successful payments',
                  value: history.filter(h => h.status === 'SUCCESS').length,
                  color: 'var(--success)',
                },
                {
                  icon: '💰', label: 'Total amount paid',
                  value: `₹${totalPaid.toFixed(2)}`,
                  color: 'var(--brand)',
                },
              ].map(k => (
                <div className="kpi-card" key={k.label}>
                  <div className="kpi-card-icon">{k.icon}</div>
                  <div className="kpi-card-label">{k.label}</div>
                  <div className="kpi-card-value" style={{ color: k.color }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="smp-error-msg" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Table */}
          <div className="data-table-card">
            <div className="data-table-header">
              <h3>Transactions</h3>
              <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                {loading ? 'Loading...' : `${history.length} total`}
              </span>
            </div>

            {loading ? (
              <div style={{
                padding: '60px', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: '14px',
              }}>
                Loading billing history...
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💳</div>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontSize: '16px',
                  fontWeight: '600', color: 'var(--text-dark)', marginBottom: '6px',
                }}>
                  No transactions yet
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Your payment history will appear here after your first subscription.
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Session ID</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx, i) => {
                    const s = statusStyle(tx.status)
                    return (
                      <tr key={tx.id}>
                        <td style={{ color: 'var(--text-light)', fontWeight: '600' }}>
                          {i + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>
                            {tx.planName || '—'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            ID: {tx.planId}
                          </div>
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--brand)' }}>
                          ₹{Number(tx.amount).toFixed(2)}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {tx.currency}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            background: s.bg, color: s.color,
                            border: `1px solid ${s.border}`,
                            fontSize: '11px', fontWeight: '700',
                            padding: '3px 10px', borderRadius: '20px',
                          }}>
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatDate(tx.createdAt)}
                        </td>
                        <td style={{
                          fontSize: '11px', color: 'var(--text-light)',
                          maxWidth: '120px', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                          title={tx.stripeSessionId}
                        >
                          {tx.stripeSessionId || '—'}
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
    </div>
  )
}

export default AdminPayments
