import AdminNavbar from '../../components/AdminNavbar'
import AdminSidebar from '../../components/AdminSidebar'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const monthlyData = [
  { month: 'Oct', revenue: 58000, subs: 180, churned: 8  },
  { month: 'Nov', revenue: 64000, subs: 205, churned: 6  },
  { month: 'Dec', revenue: 61000, subs: 198, churned: 12 },
  { month: 'Jan', revenue: 72000, subs: 220, churned: 5  },
  { month: 'Feb', revenue: 79000, subs: 238, churned: 7  },
  { month: 'Mar', revenue: 84000, subs: 248, churned: 4  },
]

const planDist = [
  { name: 'Basic',      value: 120, color: '#818cf8' },
  { name: 'Pro',        value: 95,  color: '#4f46e5' },
  { name: 'Enterprise', value: 33,  color: '#06b6d4' },
]

const renewalData = [
  { week: 'Week 1', due: 8,  renewed: 7  },
  { week: 'Week 2', due: 12, renewed: 10 },
  { week: 'Week 3', due: 6,  renewed: 6  },
  { week: 'Week 4', due: 15, renewed: 12 },
]

const topUsers = [
  { name: 'Alice Johnson',  plan: 'Enterprise', spend: '₹2,499', since: 'Jan 2024' },
  { name: 'Rohan Mehta',    plan: 'Pro',        spend: '₹799',  since: 'Feb 2024' },
  { name: 'Sara Lee',       plan: 'Pro',        spend: '₹799',  since: 'Nov 2023' },
  { name: 'Dev Patel',      plan: 'Basic',      spend: '₹299',  since: 'Mar 2024' },
  { name: 'Nina Torres',    plan: 'Enterprise', spend: '₹2,499', since: 'Oct 2023' },
]

const analyticsKpis = [
  { icon: '📈', label: 'MRR',           value: '₹84k',  sub: '+6.3% MoM',      color: '#4f46e5' },
  { icon: '🔁', label: 'Renewal Rate',  value: '91.2%', sub: 'Last 30 days',   color: '#10b981' },
  { icon: '📉', label: 'Churn Rate',    value: '1.6%',  sub: 'Down from 2.1%', color: '#f59e0b' },
  { icon: '⌛', label: 'Avg. Sub. Age', value: '4.2 mo', sub: 'Across all plans', color: '#06b6d4' },
]

function Analytics() {
  return (
    <div>
      <AdminNavbar />
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-content">

          <div className="admin-page-header">
            <h1 className="admin-page-title">Analytics</h1>
            <p className="admin-page-subtitle">
              Monitor subscription trends, revenue, and customer activity.
            </p>
          </div>

          {/* KPI row */}
          <div className="kpi-grid" style={{ marginBottom: '24px' }}>
            {analyticsKpis.map(k => (
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

          {/* Revenue + Subscriptions line chart */}
          <div className="charts-grid" style={{ marginBottom: '20px' }}>
            <div className="chart-card">
              <div className="chart-card-title">Revenue trend (₹)</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-card-title">Plan distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={planDist} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {planDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Renewal + Churn charts */}
          <div className="charts-grid" style={{ marginBottom: '24px' }}>
            <div className="chart-card">
              <div className="chart-card-title">Renewals vs due — weekly</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={renewalData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Bar dataKey="due"     fill="#e0e7ff" radius={[4,4,0,0]} name="Due" />
                  <Bar dataKey="renewed" fill="#4f46e5" radius={[4,4,0,0]} name="Renewed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-card-title">Monthly churn count</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Bar dataKey="churned" fill="#f87171" radius={[4,4,0,0]} name="Churned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top subscribers table */}
          <div className="data-table-card">
            <div className="data-table-header">
              <h3>Top subscribers</h3>
              <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>By plan value</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Monthly spend</th>
                  <th>Subscriber since</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td>
                      <span className={
                        'badge ' +
                        (u.plan === 'Basic' ? 'badge-basic'
                          : u.plan === 'Pro' ? 'badge-pro'
                          : 'badge-enterprise')
                      }>
                        {u.plan}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--brand)' }}>{u.spend}</td>
                    <td style={{ color: 'var(--text-mid)' }}>{u.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  )
}

export default Analytics