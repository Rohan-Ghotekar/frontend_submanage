import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getAllNotificationsAPI } from '../services/notificationService'
function UserSidebar({ unreadCount: propCount }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [fetchedUnreadCount, setFetchedUnreadCount] = useState(0)
  const unreadCount = propCount ?? fetchedUnreadCount

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev)
    const handleClose = () => setMobileOpen(false)
    window.addEventListener('smp-toggle-user-sidebar', handleToggle)
    window.addEventListener('smp-close-user-sidebar', handleClose)
    return () => {
      window.removeEventListener('smp-toggle-user-sidebar', handleToggle)
      window.removeEventListener('smp-close-user-sidebar', handleClose)
    }
  }, [])

  useEffect(() => {
    if (propCount !== undefined) return
    const fetchCount = async () => {
      try {
        const data = await getAllNotificationsAPI()
        const count = data.filter(n => !n.read).length
        setFetchedUnreadCount(count)
      } catch {
        // noop
      }
    }
    fetchCount()
  }, [propCount])

  const closeSidebar = () => {
    setMobileOpen(false)
  }

  const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/plans', icon: '📋', label: 'Browse Plans' },
    { to: '/subscription', icon: '💳', label: 'My Subscription' },
    { to: '/billing', icon: '🧾', label: 'Billing History' },
    { to: '/profile', icon: '👤', label: 'My Profile' },
    {
      to: '/notifications',
      icon: '🔔',
      label: 'Notifications',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { to: '/change-password', icon: '🔑', label: 'Change Password' },
  ]

  return (
    <>
      <button
        type="button"
        className={'sidebar-overlay' + (mobileOpen ? ' open' : '')}
        onClick={closeSidebar}
        aria-label="Close sidebar"
      />
      <aside className={'user-sidebar' + (mobileOpen ? ' open' : '')}>
        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          ✕
        </button>
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              'sidebar-item' + (isActive ? ' active' : '')
            }
            onClick={closeSidebar}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
            {item.badge && (
              <span className="sidebar-pill">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </aside>
    </>
  )
}

export default UserSidebar
