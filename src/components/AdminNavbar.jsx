import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
function AdminNavbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const handleMenuToggle = () => {
    if (onMenuClick) {
      onMenuClick()
      return
    }
    window.dispatchEvent(new CustomEvent('smp-toggle-admin-sidebar'))
  }

  return (
    <nav className="admin-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={handleMenuToggle}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="admin-navbar-brand">
          Sub<span>Manage</span>
        </div>
      </div>
      <div className="admin-navbar-right">
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="topbar-user-chip">
          👤 <strong>{user?.name || 'Admin'}</strong>
        </span>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default AdminNavbar