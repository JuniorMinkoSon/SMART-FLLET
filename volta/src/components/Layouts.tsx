import { Link, NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import type { Role } from '../store/types'

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-800 hover:text-white'
  }`
}

function Sidebar({
  title,
  color,
  links,
  role,
}: {
  title: string
  color: string
  links: { to: string; label: string; end?: boolean }[]
  role: Role
}) {
  const { notifications } = useStore()
  const unread = notifications.filter((n) => n.role === role && !n.read).length
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-slate-900 p-4">
      <Link to="/" className="mb-6 flex items-center gap-2 px-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${color} font-bold text-white`}>V</span>
        <div>
          <div className="font-bold text-white">VOLTA</div>
          <div className="text-xs text-slate-600">{title}</div>
        </div>
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-lg bg-slate-800 p-3 text-xs text-slate-600">
        🔔 {unread} notification{unread > 1 ? 's' : ''} non lue{unread > 1 ? 's' : ''}
      </div>
    </aside>
  )
}

export function SupplierLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Espace Fournisseur"
        color="bg-blue-600"
        role="SUPPLIER"
        links={[
          { to: '/supplier', label: '📊 Tableau de bord', end: true },
          { to: '/supplier/equipment', label: '🚜 Mes engins', end: true },
          { to: '/supplier/equipment/new', label: '➕ Ajouter un engin' },
          { to: '/supplier/requests', label: '📩 Demandes reçues' },
        ]}
      />
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Administration"
        color="bg-indigo-600"
        role="ADMIN"
        links={[
          { to: '/admin', label: '📊 Tableau de bord', end: true },
          { to: '/admin/equipment', label: '🚜 Engins' },
          { to: '/admin/inspections', label: '🔍 Inspections' },
          { to: '/admin/reports', label: '📄 Rapports' },
          { to: '/admin/requests', label: '📩 Demandes' },
          { to: '/admin/users', label: '👥 Utilisateurs' },
        ]}
      />
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export function TechnicalLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Équipe Technique"
        color="bg-emerald-600"
        role="TECHNICAL"
        links={[
          { to: '/technical', label: '📊 Tableau de bord', end: true },
          { to: '/technical/missions', label: '🧰 Missions' },
        ]}
      />
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

function publicNavClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">V</span>
          <span className="text-lg font-bold text-slate-900">VOLTA</span>
        </Link>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={publicNavClass}>🏠 Accueil</NavLink>
          <NavLink to="/catalogue" className={publicNavClass}>🚜 Équipements</NavLink>
          <NavLink to="/fournisseurs" className={publicNavClass}>🏢 Fournisseurs</NavLink>
        </nav>
        <div className="mt-6 border-t border-slate-200 pt-4 flex-1">
          <div className="space-y-3">
            {/* Supplier Portal */}
            <NavLink to="/supplier" className={({ isActive }) => `group relative flex flex-col gap-1.5 rounded-lg p-3 transition ${isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-xl">📦</span>
                Espace Fournisseur
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                Proposez vos équipements à des milliers de clients vérifiés
              </p>
            </NavLink>

            {/* Technical Portal */}
            <NavLink to="/technical" className={({ isActive }) => `group relative flex flex-col gap-1.5 rounded-lg p-3 transition ${isActive ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'}`}>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-xl">🔬</span>
                Équipe Technique
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                Inspectez et certifiez les équipements VOLTA
              </p>
            </NavLink>

            {/* Admin Portal */}
            <NavLink to="/admin" className={({ isActive }) => `group relative flex flex-col gap-1.5 rounded-lg p-3 transition ${isActive ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'}`}>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                Administration
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                Gérez la plateforme et les certifications
              </p>
            </NavLink>
          </div>
        </div>

        {/* Services Promo */}
        <div className="mt-auto space-y-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-200">
            <div className="font-bold text-slate-900 mb-2">✨ VOLTA Premium</div>
            <p className="text-xs text-slate-700 leading-snug mb-3">
              Accédez à des services exclusifs: support VIP 24/7, inspection technique complète, assurance équipements
            </p>
            <a href="/pricing" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition">
              En savoir plus →
            </a>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
            <span className="font-semibold text-slate-900">Des milliers d'équipements</span> vérifiés et certifiés pour vos projets.
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">V</span>
              <span className="text-lg font-bold text-slate-900">VOLTA</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <NavLink to="/catalogue" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">Équipements</NavLink>
              <NavLink to="/admin" className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Admin</NavLink>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-700">
          © 2026 VOLTA — Équipements de chantier vérifiés en Côte d'Ivoire
        </footer>
      </div>
    </div>
  )
}
