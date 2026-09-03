import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import { useMissionWorkflow } from '@/hooks/useMissionWorkflow'
import { EmptyState, KPICard, MissionBadge } from '@/components/ui'
import { MissionStatus } from '@/types'
import { Plus } from 'lucide-react'

export function Missions() {
  const { vehicles, drivers } = useFleetStore()
  const { getVisibleMissions } = useMissionWorkflow()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const missions = getVisibleMissions()

  const stats = useMemo(
    () => ({
      total: missions.length,
      enCours: missions.filter((m) => m.status === 'en_cours').length,
      aControler: missions.filter((m) => m.status === 'controle').length,
      cloturees: missions.filter((m) => m.status === 'cloturee').length,
    }),
    [missions]
  )

  const filtered = missions.filter((m) => {
    if (statusFilter && m.status !== statusFilter) return false
    if (search && !`${m.code} ${m.site} ${m.client ?? ''}`.toLowerCase().includes(search.toLowerCase()))
      return false
    return true
  })

  const statusOptions: { value: MissionStatus; label: string }[] = [
    { value: 'affectee', label: 'Affectée' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'controle', label: 'Contrôle' },
    { value: 'cloturee', label: 'Clôturée' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Missions</h1>
          <p className="page-subtitle">{missions.length} mission(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/missions/nouvelle')}>
          <Plus size={18} /> Créer une mission
        </button>
      </div>

      <div className="kpi-grid">
        <KPICard value={stats.total} label="Total" />
        <KPICard value={stats.enCours} label="En cours" />
        <KPICard value={stats.aControler} label="À contrôler" />
        <KPICard value={stats.cloturees} label="Clôturées" />
      </div>

      <div className="filters">
        <input
          placeholder="Rechercher par code, chantier ou client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher une mission"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="Aucune mission"
            message={
              missions.length === 0
                ? 'Créez votre première mission pour commencer.'
                : 'Aucune mission ne correspond à vos filtres.'
            }
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Chantier</th>
                <th>Engin</th>
                <th>Conducteur</th>
                <th>Période</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const v = vehicles.find((x) => x.id === m.vehicleId)
                const d = drivers.find((x) => x.id === m.driverId)
                return (
                  <tr key={m.id} className="clickable" onClick={() => navigate(`/missions/${m.id}`)}>
                    <td className="strong">{m.code}</td>
                    <td>{m.site}</td>
                    <td>
                      {v ? `${v.code} — ${v.type}` : '—'}
                    </td>
                    <td>{d?.name ?? 'Non affecté'}</td>
                    <td>
                      {m.startDate.slice(5)} → {m.endDate.slice(5)}
                    </td>
                    <td>
                      <MissionBadge status={m.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
