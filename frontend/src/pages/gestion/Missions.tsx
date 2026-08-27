import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import { MissionBadge } from '@/components/ui'

export function Missions() {
  const { missions, vehicles, drivers } = useFleetStore()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = missions.filter((m) => {
    if (statusFilter && m.status !== statusFilter) return false
    if (search && !`${m.code} ${m.site}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Missions</h1>
          <p className="page-subtitle">{missions.length} missions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/missions/nouvelle')}>
          + Créer une mission
        </button>
      </div>

      <div className="filters">
        <input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Statut</option>
          <option value="planifiee">Planifiée</option>
          <option value="affectee">Affectée</option>
          <option value="en_cours">En cours</option>
          <option value="retour">Retour</option>
          <option value="controle">Contrôle</option>
          <option value="cloturee">Clôturée</option>
        </select>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Chantier</th>
              <th>Engin</th>
              <th>Opérateur</th>
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
                    {v?.code} — {v?.type}
                  </td>
                  <td>{d?.name}</td>
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
      </div>
    </div>
  )
}
