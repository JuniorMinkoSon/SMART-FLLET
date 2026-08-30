import { ReactNode, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer } from '@/components/ui'
import { Home, Wrench, ListChecks, RotateCw, Users, Fuel, DollarSign, Bell, Settings, User, AlertCircle, AlertTriangle, Info, FileText } from 'lucide-react'
import { SmartFleetLogo } from '@/components/SmartFleetLogo'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const GESTIONNAIRE_NAV: NavGroup[] = [
  { items: [{ to: '/dashboard', label: 'Accueil', Icon: Home }] },
  {
    title: 'Exploitation',
    items: [
      { to: '/flotte', label: 'Flotte', Icon: Wrench },
      { to: '/missions', label: 'Missions', Icon: ListChecks },
      { to: '/controles', label: 'Départs & retours', Icon: RotateCw },
    ],
  },
  {
    title: 'Ressources',
    items: [
      { to: '/conducteurs', label: 'Conducteurs', Icon: Users },
      { to: '/carburant', label: 'Carburant', Icon: Fuel },
      { to: '/depenses', label: 'Dépenses', Icon: DollarSign },
    ],
  },
  {
    title: 'Pilotage',
    items: [
      { to: '/alertes', label: 'Alertes', Icon: Bell },
      { to: '/rapports', label: 'Rapports', Icon: FileText },
    ],
  },
]

const ADMIN_EXTRA: NavGroup = {
  title: 'Administration',
  items: [
    { to: '/utilisateurs', label: 'Utilisateurs', Icon: Users },
    { to: '/parametres', label: 'Paramètres', Icon: Settings },
  ],
}

const MOBILE_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Accueil', Icon: Home },
  { to: '/flotte', label: 'Flotte', Icon: Wrench },
  { to: '/missions', label: 'Missions', Icon: ListChecks },
  { to: '/alertes', label: 'Alertes', Icon: Bell },
  { to: '/parametres', label: 'Profil', Icon: User },
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

  const sevIcon = { urgent: AlertCircle, attention: AlertTriangle, info: Info }
  const sevLabel = { urgent: 'URGENT', attention: 'ATTENTION', info: 'INFO' }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <SmartFleetLogo />
          <span>SMART <span>FLEET</span></span>
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
                <item.Icon size={18} className="icon" />
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
              <Bell size={20} />
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
            <item.Icon size={20} className="icon" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Drawer
        open={alertsOpen}
        title={`Alertes (${alerts.length})`}
        onClose={() => setAlertsOpen(false)}
      >
        {alerts.map((a) => {
          const SevIcon = sevIcon[a.severity]
          return (
            <div className="alert-item" key={a.id}>
              <div className="alert-sev"><SevIcon size={18} color={a.severity === 'urgent' ? 'var(--red)' : a.severity === 'attention' ? 'var(--orange)' : 'var(--yellow)'} /></div>
              <div style={{ flex: 1 }}>
                <div className="small strong muted">{sevLabel[a.severity]}</div>
                <div className="strong">{a.title}</div>
                <div className="muted small">{a.detail}</div>
                <div className="small" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                  {a.time}
                </div>
              </div>
            </div>
          )
        })}
      </Drawer>
    </div>
  )
}
