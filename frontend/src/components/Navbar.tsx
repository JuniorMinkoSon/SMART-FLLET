import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './Navbar.css'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">⚙️</span>
          Smart Fleet
        </Link>

        <div className="navbar-menu">
          <div className="navbar-user">
            <span className="navbar-username">{user?.name}</span>
            <span className="navbar-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
