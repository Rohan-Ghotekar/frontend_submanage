import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
function AdminSidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [plansOpen, setPlansOpen] = useState(
    location.pathname.startsWith('/admin/plans')
  )

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev)
    const handleClose = () => setMobileOpen(false)
    window.addEventListener('smp-toggle-admin-sidebar', handleToggle)
    window.addEventListener('smp-close-admin-sidebar', handleClose)
    return () => {
      window.removeEventListener('smp-toggle-admin-sidebar', handleToggle)
      window.removeEventListener('smp-close-admin-sidebar', handleClose)
    }
  }, [])

  const closeSidebar = () => {
    setMobileOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className={'sidebar-overlay' + (mobileOpen ? ' open' : '')}
        onClick={closeSidebar}
        aria-label="Close sidebar"
      />
      <aside className={'admin-sidebar' + (mobileOpen ? ' open' : '')}>
        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          ✕
        </button>

        <div className="sidebar-section-label">Overview</div>
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            'sidebar-item' + (isActive ? ' active' : '')
          }
          onClick={closeSidebar}
        >
          <span className="sidebar-item-icon">📊</span>
          <span className="sidebar-item-label">Dashboard</span>
        </NavLink>

        <div className="sidebar-section-label">Management</div>
        <button
          type="button"
          className={
            'sidebar-item' +
            (location.pathname.startsWith('/admin/plans') ? ' active' : '')
          }
          onClick={() => setPlansOpen(o => !o)}
          aria-expanded={plansOpen}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            justifyContent: 'space-between',
          }}
        >
          <span className="sidebar-label-row">
            <span className="sidebar-item-icon">📋</span>
            <span className="sidebar-item-label">Manage Plans</span>
          </span>
          <span className="sidebar-accordion-arrow">
            {plansOpen ? '▲' : '▼'}
          </span>
        </button>

        {plansOpen && (
          <>
            <NavLink
              to="/admin/plans"
              end
              className={({ isActive }) =>
                'sidebar-sub-item' + (isActive ? ' active' : '')
              }
              onClick={closeSidebar}
            >
              📄 All Plans
            </NavLink>
            <NavLink
              to="/admin/plans/create"
              className={({ isActive }) =>
                'sidebar-sub-item' + (isActive ? ' active' : '')
              }
              onClick={closeSidebar}
            >
              ➕ Create Plan
            </NavLink>
          </>
        )}

        <div className="sidebar-section-label">Insights</div>
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            'sidebar-item' + (isActive ? ' active' : '')
          }
          onClick={closeSidebar}
        >
          <span className="sidebar-item-icon">📈</span>
          <span className="sidebar-item-label">Analytics</span>
        </NavLink>
        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            'sidebar-item' + (isActive ? ' active' : '')
          }
          onClick={closeSidebar}
        >
          <span className="sidebar-item-icon">💳</span>
          <span className="sidebar-item-label">Payments</span>
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            'sidebar-item' + (isActive ? ' active' : '')
          }
          onClick={closeSidebar}
        >
          <span className="sidebar-item-icon">👥</span>
          <span className="sidebar-item-label">Users</span>
        </NavLink>
      </aside>
    </>
  )
}

export default AdminSidebar