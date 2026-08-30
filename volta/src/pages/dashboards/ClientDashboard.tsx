import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, QuoteStatusBadge } from '../../components/ui'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { quoteRequests, equipment, users } = useStore()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('volta_user')
    if (!userStr) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(userStr))
  }, [navigate])

  if (!user) return <div className="flex items-center justify-center h-screen">Chargement...</div>

  const myRequests = quoteRequests.filter((qr) => qr.clientEmail === user.email)
  const activeRequests = myRequests.filter((qr) => !['TERMINEE', 'CATEGORISEE'].includes(qr.status))
  const completedRequests = myRequests.filter((qr) => ['TERMINEE', 'CATEGORISEE'].includes(qr.status))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">👤 Tableau de bord Client</h1>
          <p className="text-slate-600 mt-1">Bienvenue, {user.company}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="text-3xl font-bold mb-2">{activeRequests.length}</div>
            <div className="text-blue-100">Demandes en cours</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="text-3xl font-bold mb-2">{myRequests.filter((qr) => qr.status === 'NOUVELLE' || qr.status === 'TRANSMISE').length}</div>
            <div className="text-purple-100">À traiter</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="text-3xl font-bold mb-2">{completedRequests.length}</div>
            <div className="text-green-100">Demandes complétées</div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Active Requests */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Mes demandes en cours
              </h2>
              {activeRequests.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune demande en cours</p>
              ) : (
                <div className="space-y-3">
                  {activeRequests.map((qr) => {
                    const eq = equipment.find((e) => e.id === qr.equipmentId)
                    const supplier = users.find((u) => u.id === qr.supplierId)
                    return (
                      <div key={qr.id} className="p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition cursor-pointer">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white">{qr.reference}</div>
                            <div className="text-sm text-slate-600 mt-1">{eq?.name}</div>
                            <div className="text-xs text-slate-500 mt-1">Fournisseur: {supplier?.company}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <QuoteStatusBadge status={qr.status} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Recent Requests */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Historique complet
              </h2>
              {myRequests.length === 0 ? (
                <p className="text-slate-400 text-sm">Vous n'avez pas encore créé de demande de devis</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myRequests.map((qr) => {
                    const eq = equipment.find((e) => e.id === qr.equipmentId)
                    const supplier = users.find((u) => u.id === qr.supplierId)
                    return (
                      <div key={qr.id} className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white text-sm">{qr.reference}</div>
                            <div className="text-xs text-slate-600 mt-1">{eq?.name} • {supplier?.company}</div>
                          </div>
                          <QuoteStatusBadge status={qr.status} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Actions */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Actions rapides
              </h2>
              <div className="space-y-2">
                <Link
                  to="/catalogue"
                  className="w-full block p-3 rounded-lg text-white text-center transition hover:scale-105 transform"
                  style={{ backgroundColor: '#FF8C00' }}
                >
                  🛍️ Parcourir le catalogue
                </Link>
                <Link
                  to="/fournisseurs"
                  className="w-full p-3 rounded-lg transition text-white text-center bg-slate-700 hover:bg-slate-600"
                >
                  🏢 Voir les fournisseurs
                </Link>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4" style={{ color: '#FF8C00' }}>
                Informations de compte
              </h2>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <div className="font-semibold text-white">Entreprise</div>
                  <div className="text-slate-400">{user.company}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Email</div>
                  <div className="text-slate-400">{user.email}</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Rôle</div>
                  <div className="text-slate-400">👤 Client</div>
                </div>
              </div>
            </Card>

            {/* VOLTA Services Info */}
            <Card className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-400/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">ℹ️</span>
                <span style={{ color: '#FF8C00' }}>À propos de VOLTA</span>
              </h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-blue-700/40">
                  <div className="font-semibold text-white mb-1">💡 Mise en relation</div>
                  <p className="text-slate-300">VOLTA vous met directement en contact avec des fournisseurs vérifiés</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-700/40">
                  <div className="font-semibold text-white mb-1">✅ Inspections techniques</div>
                  <p className="text-slate-300">Tous les équipements sont inspectés et catégorisés</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-700/40">
                  <div className="font-semibold text-white mb-1">💰 Zéro commission</div>
                  <p className="text-slate-300">Vous négociez directement les tarifs avec le fournisseur</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
