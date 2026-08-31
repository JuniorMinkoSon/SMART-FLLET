import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { StatCard } from '@/components/cards/StatCard'
import { StatusBadge } from '@/components/badges/StatusBadge'
import { Plus, Search, ListFilter } from 'lucide-react'
import { missionsAPI } from '@/services/api'
import './MissionsProfessional.css'
import '@/styles/professional.css'

interface Mission {
  id: string
  code: string
  vehicle: { type: string } | null
  driver: { name: string } | null
  status: 'disponible' | 'affectee' | 'en_cours' | 'controle' | 'cloturee'
  site: string
  client: string
  budget: number
  startDate: string
  endDate: string
}

export function MissionsProfessional() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadMissions()
  }, [])

  const loadMissions = async () => {
    try {
      const response = await missionsAPI.list()
      setMissions(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: missions.length,
    active: missions.filter((m) => m.status === 'en_cours').length,
    pending: missions.filter((m) => m.status === 'affectee').length,
    completed: missions.filter((m) => m.status === 'cloturee').length,
  }

  const filtered = missions.filter((mission) => {
    const matchesSearch =
      mission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.client.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || mission.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="missions-professional">
      {/* STATS */}
      <div className="grid grid-4">
        <StatCard
          title="Total"
          value={stats.total}
          Icon={undefined}
          color="blue"
        />
        <StatCard
          title="Actives"
          value={stats.active}
          Icon={undefined}
          color="orange"
        />
        <StatCard
          title="En attente"
          value={stats.pending}
          Icon={undefined}
          color="blue"
        />
        <StatCard
          title="Complétées"
          value={stats.completed}
          Icon={undefined}
          color="green"
        />
      </div>

      {/* ACTIONS & FILTRES */}
      <div className="mission-toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Chercher par code, site ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <ListFilter size={18} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="affectee">Affectée</option>
              <option value="en_cours">En cours</option>
              <option value="controle">En contrôle</option>
              <option value="cloturee">Clôturée</option>
            </select>
          </div>
        </div>
        <NavLink to="/missions/nouvelle" className="btn btn-primary">
          <Plus size={18} />
          Nouvelle mission
        </NavLink>
      </div>

      {/* TABLE */}
      <div className="card">
        {loading ? (
          <div className="loading-state">Chargement des missions...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Aucune mission trouvée</div>
            <div className="empty-state-text">
              {searchTerm || filterStatus !== 'all'
                ? 'Aucune mission ne correspond à vos filtres'
                : 'Créez votre première mission pour commencer'}
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Site</th>
                  <th>Client</th>
                  <th>Engin</th>
                  <th>Conducteur</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mission) => (
                  <tr key={mission.id}>
                    <td className="code-cell">{mission.code}</td>
                    <td>{mission.site}</td>
                    <td>{mission.client}</td>
                    <td>{mission.vehicle?.type || '-'}</td>
                    <td>{mission.driver?.name || 'Non assigné'}</td>
                    <td className="budget-cell">
                      {new Intl.NumberFormat('fr-CI', {
                        style: 'currency',
                        currency: 'XOF',
                      }).format(mission.budget)}
                    </td>
                    <td>
                      <StatusBadge status={mission.status} />
                    </td>
                    <td className="actions-cell">
                      <NavLink to={`/missions/${mission.id}`} className="action-link">
                        Détail
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
