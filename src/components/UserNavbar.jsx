import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
function UserNavbar({ onMenuClick }) {
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
    window.dispatchEvent(new CustomEvent('smp-toggle-user-sidebar'))
  }

  // Initials fallback
  const initials = (user?.name || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="user-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={handleMenuToggle}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="user-navbar-brand">
          Sub<span>Manage</span>
        </div>
      </div>

      <div className="user-navbar-right">
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="topbar-user-chip">
          {user?.avatarUrl ? (
            <span className="topbar-avatar">
              <img src={user.avatarUrl} alt={user.name || 'User avatar'} />
            </span>
          ) : (
            <span className="topbar-avatar">
              {initials}
            </span>
          )}
          <strong>{user?.name || 'User'}</strong>
        </div>

        <button className="user-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default UserNavbar