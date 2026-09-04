import { ReactNode, useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useFleetStore } from '@/store/fleetStore'
import { SmartFleetLogo } from '@/components/SmartFleetLogo'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Truck,
  Users,
  ClipboardList,
  Fuel,
  ClipboardCheck,
  BarChart3,
  Bell,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
}

interface NavSection {
  title: string
  items: NavItem[]
}

const BASE_NAV: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { to: '/dashboard', label: 'Tableau de bord', Icon: LayoutDashboard },
      { to: '/alertes', label: 'Alertes', Icon: Bell },
      { to: '/rapports', label: 'Rapports', Icon: FileText },
    ],
  },
  {
    title: 'Exploitation',
    items: [
      { to: '/missions', label: 'Missions', Icon: ClipboardList },
      { to: '/flotte', label: 'Flotte', Icon: Truck },
      { to: '/controles', label: 'Départs & retours', Icon: ClipboardCheck },
    ],
  },
  {
    title: 'Ressources',
    items: [
      { to: '/conducteurs', label: 'Conducteurs', Icon: Users },
      { to: '/carburant', label: 'Carburant', Icon: Fuel },
      { to: '/depenses', label: 'Dépenses', Icon: BarChart3 },
    ],
  },
]

const ADMIN_SECTION: NavSection = {
  title: 'Administration',
  items: [
    { to: '/utilisateurs', label: 'Utilisateurs', Icon: Users },
    { to: '/parametres', label: 'Paramètres', Icon: Settings },
  ],
}

const GESTION_SECTION: NavSection = {
  title: 'Administration',
  items: [{ to: '/parametres', label: 'Paramètres', Icon: Settings }],
}

function navForRole(role: string | undefined): NavSection[] {
  return role === 'admin' ? [...BASE_NAV, ADMIN_SECTION] : [...BASE_NAV, GESTION_SECTION]
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire de flotte',
  conducteur: 'Conducteur',
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const sections = navForRole(user?.role)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay is-visible" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area" style={{ color: 'var(--brand)' }}>
            <SmartFleetLogo size={30} />
            <div>
              <div className="logo-title">SMART FLEET</div>
              <div className="logo-subtitle">Gestion de flotte</div>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.title} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              <div className="nav-items">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <item.Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-meta">
              <div className="name">{user?.name}</div>
              <div className="role">{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}

function Header({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const navigate = useNavigate()
  const unread = useFleetStore((s) => s.alerts.filter((a) => !a.read).length)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <Menu size={22} />
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        <button
          className="notification-btn"
          title="Alertes"
          aria-label={`Alertes${unread ? ` (${unread} non lues)` : ''}`}
          onClick={() => navigate('/alertes')}
        >
          <Bell size={20} />
          {unread > 0 && <span className="badge">{unread}</span>}
        </button>
      </div>
    </header>
  )
}

export function ProfessionalLayout({ children, title }: { children: ReactNode; title: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const loadFleet = useFleetStore((s) => s.load)
  const fleetLoaded = useFleetStore((s) => s.loaded)
  const fleetError = useFleetStore((s) => s.error)

  // Ferme le tiroir mobile à chaque changement de page
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  /**
   * Chargement de la flotte à l'entrée dans l'espace connecté.
   *
   * Une seule fois : les écrans partagent le même magasin, et recharger à chaque
   * changement de page rejouerait quatre appels pour des données déjà en main.
   * Les écritures déclenchent leur propre rafraîchissement.
   */
  useEffect(() => {
    if (!fleetLoaded) {
      void loadFleet()
    }
  }, [fleetLoaded, loadFleet])

  return (
    <div className="professional-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header title={title} onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="page-content">
          <div className="page-body">
            {/* Une panne de chargement est annoncée une fois, en tête, plutôt
                que répétée dans chaque écran vide de la page. */}
            {fleetError && (
              <div className="fleet-load-error" role="status">
                <strong>Données indisponibles.</strong> {fleetError}
                <button type="button" onClick={() => void loadFleet()}>Réessayer</button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
