import { ReactNode, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Truck, Users, ClipboardList, Fuel, ClipboardCheck, BarChart3, Settings, Bell, Search, LogOut, ChevronDown, Menu, X } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
}

interface NavSection {
  title: string
  items: NavItem[]
}

const ADMIN_NAV: NavSection[] = [
  {
    title: 'NAVIGATION',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    title: 'EXPLOITATION',
    items: [
      { to: '/missions', label: 'Missions', Icon: ClipboardList },
      { to: '/flotte', label: 'Flotte', Icon: Truck },
      { to: '/controles', label: 'Contrôles', Icon: ClipboardCheck },
    ],
  },
  {
    title: 'RESSOURCES',
    items: [
      { to: '/conducteurs', label: 'Conducteurs', Icon: Users },
      { to: '/carburant', label: 'Carburant', Icon: Fuel },
      { to: '/depenses', label: 'Dépenses', Icon: BarChart3 },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { to: '/utilisateurs', label: 'Utilisateurs', Icon: Users },
      { to: '/parametres', label: 'Paramètres', Icon: Settings },
    ],
  },
]

const GESTIONNAIRE_NAV: NavSection[] = [
  {
    title: 'NAVIGATION',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    title: 'EXPLOITATION',
    items: [
      { to: '/missions', label: 'Missions', Icon: ClipboardList },
      { to: '/flotte', label: 'Flotte', Icon: Truck },
      { to: '/controles', label: 'Contrôles', Icon: ClipboardCheck },
    ],
  },
  {
    title: 'RESSOURCES',
    items: [
      { to: '/conducteurs', label: 'Conducteurs', Icon: Users },
      { to: '/carburant', label: 'Carburant', Icon: Fuel },
    ],
  },
]

const CONDUCTEUR_NAV: NavSection[] = [
  {
    title: 'NAVIGATION',
    items: [
      { to: '/conducteur', label: 'Accueil', Icon: LayoutDashboard },
      { to: '/conducteur/mission', label: 'Mes Missions', Icon: ClipboardList },
      { to: '/conducteur/engin', label: 'Engin', Icon: Truck },
    ],
  },
  {
    title: 'OPÉRATIONS',
    items: [
      { to: '/conducteur/depart', label: 'Départ', Icon: ClipboardCheck },
      { to: '/conducteur/retour', label: 'Retour', Icon: ClipboardCheck },
    ],
  },
]

function Sidebar({ role, isOpen, onClose }: { role: string; isOpen: boolean; onClose: () => void }) {
  const navSections = role === 'admin' ? ADMIN_NAV : role === 'gestionnaire' ? GESTIONNAIRE_NAV : CONDUCTEUR_NAV

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <div className="logo-badge">SF</div>
            <div>
              <div className="logo-title">SmartFleet</div>
              <div className="logo-subtitle">Fleet Management</div>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
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
      </aside>
    </>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount] = useState(3)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Rechercher..." />
        </div>
      </div>

      <div className="topbar-right">
        <button className="notification-btn" title="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>

        <div className="profile-menu">
          <button
            className="profile-trigger"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role?.toUpperCase()}</div>
            </div>
            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item">
                <span>Email: {user?.email}</span>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export function ProfessionalLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="professional-layout">
      <Sidebar role={user?.role || 'conducteur'} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          <div className="page-header">
            <h1 className="page-title">{title}</h1>
          </div>
          <div className="page-body">{children}</div>
        </main>
      </div>
    </div>
  )
}
