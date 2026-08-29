import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, ListChecks, Wrench, User } from 'lucide-react'
import { SmartFleetLogo } from '@/components/SmartFleetLogo'

const NAV = [
  { to: '/conducteur', label: 'Accueil', Icon: Home, end: true },
  { to: '/conducteur/mission', label: 'Mission', Icon: ListChecks, end: false },
  { to: '/conducteur/engin', label: 'Mon engin', Icon: Wrench, end: false },
  { to: '/conducteur/profil', label: 'Profil', Icon: User, end: false },
]

export function DriverLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="driver-shell">
      <div className="driver-header">
        <div className="brand" style={{ display: 'flex', alignItems: 'center' }}>
          <SmartFleetLogo />
          <span>SMART FLEET</span>
        </div>
        {title && <h1>{title}</h1>}
      </div>
      <div className="driver-content">{children}</div>
      <nav className="driver-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <n.Icon size={20} className="icon" />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
