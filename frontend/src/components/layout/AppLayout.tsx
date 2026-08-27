import { ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer } from '@/components/ui'

interface NavItem {
  to: string
  label: string
  icon: string
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const GESTIONNAIRE_NAV: NavGroup[] = [
  { items: [{ to: '/dashboard', label: 'Accueil', icon: '🏠' }] },
  {
    title: 'Exploitation',
    items: [
      { to: '/flotte', label: 'Flotte', icon: '🚜' },
      { to: '/missions', label: 'Missions', icon: '📋' },
      { to: '/controles', label: 'Départs & retours', icon: '🔁' },
    ],
  },
  {
    title: 'Ressources',
    items: [
      { to: '/conducteurs', label: 'Conducteurs', icon: '👷' },
      { to: '/carburant', label: 'Carburant', icon: '⛽' },
      { to: '/depenses', label: 'Dépenses', icon: '💰' },
    ],
  },
  {
    title: 'Pilotage',
    items: [{ to: '/alertes', label: 'Alertes', icon: '🔔' }],
  },
]

const ADMIN_EXTRA: NavGroup = {
  title: 'Administration',
  items: [
    { to: '/utilisateurs', label: 'Utilisateurs', icon: '👥' },
    { to: '/parametres', label: 'Paramètres', icon: '⚙️' },
  ],
}

const MOBILE_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Accueil', icon: '🏠' },
  { to: '/flotte', label: 'Flotte', icon: '🚜' },
  { to: '/missions', label: 'Missions', icon: '📋' },
  { to: '/alertes', label: 'Alertes', icon: '🔔' },
  { to: '/parametres', label: 'Profil', icon: '👤' },
]

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuthStore()
  const alerts = useFleetStore((s) => s.alerts)
  const markAlertsRead = useFleetStore((s) => s.markAlertsRead)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const navigate = useNavigate()

  const unread = alerts.filter((a) => !a.read).length
  const groups =
    user?.role === 'admin' ? [...GESTIONNAIRE_NAV, ADMIN_EXTRA] : GESTIONNAIRE_NAV

  const sevIcon = { urgent: '🔴', attention: '🟠', info: '🟡' }
  const sevLabel = { urgent: 'URGENT', attention: 'ATTENTION', info: 'INFO' }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          SMART <span>FLEET</span>
        </div>
        {groups.map((g, i) => (
          <div className="sidebar-group" key={i}>
            {g.title && <div className="sidebar-group-title">{g.title}</div>}
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-actions">
            <button
              className="bell-btn"
              onClick={() => {
                setAlertsOpen(true)
                markAlertsRead()
              }}
              aria-label="Alertes"
            >
              🔔
              {unread > 0 && <span className="bell-badge">{unread}</span>}
            </button>
            <div className="user-chip">
              <div className="user-avatar">{user?.name.charAt(0).toUpperCase()}</div>
              <span className="name">{user?.name}</span>
            </div>
            <button
              className="logout-btn"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Déconnexion
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>

      <nav className="mobile-nav">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Drawer open={alertsOpen} title={`🔔 Alertes (${alerts.length})`} onClose={() => setAlertsOpen(false)}>
        {alerts.map((a) => (
          <div className="alert-item" key={a.id}>
            <div className="alert-sev">{sevIcon[a.severity]}</div>
            <div style={{ flex: 1 }}>
              <div className="small strong muted">{sevLabel[a.severity]}</div>
              <div className="strong">{a.title}</div>
              <div className="muted small">{a.detail}</div>
              <div className="small" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                {a.time}
              </div>
            </div>
          </div>
        ))}
      </Drawer>
    </div>
  )
}
