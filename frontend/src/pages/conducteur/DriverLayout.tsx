import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Boxes, User } from 'lucide-react'

const NAV = [
  { to: '/conducteur', label: 'Accueil', icon: <Home size={20} />, end: true },
  { to: '/conducteur/mission', label: 'Mission', icon: <CheckSquare size={20} />, end: false },
  { to: '/conducteur/engin', label: 'Mon engin', icon: <Boxes size={20} />, end: false },
  { to: '/conducteur/profil', label: 'Profil', icon: <User size={20} />, end: false },
]

export function DriverLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="driver-shell">
      <div className="driver-header">
        <div className="brand">SMART FLEET</div>
        {title && <h1>{title}</h1>}
      </div>
      <div className="driver-content">{children}</div>
      <nav className="driver-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="icon">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
