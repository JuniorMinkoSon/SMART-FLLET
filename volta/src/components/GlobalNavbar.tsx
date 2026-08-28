import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface User {
  email: string
  role: string
  company: string
}

export default function GlobalNavbar() {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isDashboard = location.pathname.includes('dashboard') || location.pathname === '/login'
  const dashboardColor = isDashboard ? 'from-slate-900 to-slate-800' : 'from-white to-blue-50'

  const getRoleIcon = () => {
    if (!user) return '🏠'
    switch (user.role) {
      case 'CLIENT': return '👤'
      case 'SUPPLIER': return '🏭'
      case 'TECHNICAL': return '🔧'
      case 'ADMIN': return '👨‍💼'
      default: return '🏠'
    }
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    const routes: Record<string, string> = {
      CLIENT: '/client-dashboard',
      SUPPLIER: '/supplier-dashboard',
      TECHNICAL: '/technical-dashboard',
      ADMIN: '/admin-dashboard',
    }
    return routes[user.role] || '/login'
  }

  const handleLogout = () => {
    localStorage.removeItem('volta_user')
    setUser(null)
    setShowUserMenu(false)
    window.location.href = '/'
  }

  return (
    <nav className={`sticky top-0 z-40 transition duration-300 ${isScrolled ? 'shadow-lg' : ''} bg-gradient-to-r ${dashboardColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg font-bold text-white">
            <img src="/volta-logo.svg" alt="VOLTA" className="w-8 h-8" />
          </div>
          <div>
            <div className={`font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${!isDashboard && 'md:block'}`}>VOLTA</div>
            <div className={`text-xs ${isDashboard ? 'text-slate-600' : 'text-slate-700'}`}>Équipements</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {!isDashboard && (
            <>
              <Link
                to="/"
                className={`font-medium transition hover:opacity-70 ${
                  location.pathname === '/' ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                🏠 Accueil
              </Link>
              <Link
                to="/catalogue"
                className={`font-medium transition hover:opacity-70 ${
                  location.pathname === '/catalogue' ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                🚜 Catalogue
              </Link>
              <Link
                to="/fournisseurs"
                className={`font-medium transition hover:opacity-70 ${
                  location.pathname === '/fournisseurs' ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                🏢 Fournisseurs
              </Link>
            </>
          )}
        </div>

        {/* Right Side - User Menu or Login */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {!isDashboard && (
                <Link
                  to={getDashboardLink()}
                  className="hidden sm:inline-block px-4 py-2 rounded-lg text-white transition hover:scale-105 transform bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {getRoleIcon()} Mon Espace
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-70"
                  style={{
                    backgroundColor: isDashboard ? 'linear-gradient(to right, #4f46e5, #9333ea)' : '#E5E7EB',
                    color: isDashboard ? 'white' : '#1F2937',
                  }}
                >
                  <span className="text-lg">{getRoleIcon()}</span>
                  <span className="font-medium">{user.company}</span>
                  <span className="text-lg">▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-slate-200 animate-in fade-in scale-in-95 duration-200 z-50">
                    <div className="p-4 border-b border-slate-200">
                      <div className="font-semibold text-slate-900">{user.company}</div>
                      <div className="text-xs text-slate-700 mt-1">{user.email}</div>
                      <div className="text-xs text-slate-700 mt-1" style={{ color: '#FF8C00' }}>
                        {user.role === 'CLIENT' && '👤 Client'}
                        {user.role === 'SUPPLIER' && '🏭 Fournisseur'}
                        {user.role === 'TECHNICAL' && '🔧 Technique'}
                        {user.role === 'ADMIN' && '👨‍💼 Administrateur'}
                      </div>
                    </div>

                    <div className="p-2">
                      {!isDashboard && (
                        <Link
                          to={getDashboardLink()}
                          className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-900"
                        >
                          📊 Accéder au tableau de bord
                        </Link>
                      )}
                      {isDashboard && (
                        <Link
                          to="/"
                          className="block w-full text-left px-4 py-2 rounded-lg hover:bg-slate-100 transition text-sm font-medium text-slate-900"
                        >
                          🏠 Retour au site
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleLogout()
                        }}
                        className="block w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm font-medium text-red-600 mt-2 border-t border-slate-200 pt-3"
                      >
                        🚪 Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-white transition hover:scale-105 transform bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                🔓 Connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
