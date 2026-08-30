import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiStore } from '@/store/apiStore'
import { MissionBadge } from '@/components/ui'

interface Mission {
  id: number
  code: string
  site: string
  client: string
  vehicle_id: number
  driver_id: number
  start_date: string
  end_date: string
  status: string
}

interface Vehicle {
  id: number
  code: string
  type: string
  plate: string
}

interface Driver {
  id: number
  name: string
  matricule: string
}

export function Missions() {
  const { fetch } = useApiStore()
  const navigate = useNavigate()
  const [missions, setMissions] = useState<Mission[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [m, v, d] = await Promise.all([
        fetch('/missions'),
        fetch('/vehicles'),
        fetch('/drivers'),
      ])
      setMissions(m)
      setVehicles(v)
      setDrivers(d)
    } catch (err) {
      console.error('Erreur chargement:', err)
    }
  }

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
              const v = vehicles.find((x) => x.id === m.vehicle_id)
              const d = drivers.find((x) => x.id === m.driver_id)
              return (
                <tr key={m.id} className="clickable" onClick={() => navigate(`/missions/${m.id}`)}>
                  <td className="strong">{m.code}</td>
                  <td>{m.site}</td>
                  <td>
                    {v?.code} — {v?.type}
                  </td>
                  <td>{d?.name}</td>
                  <td>
                    {m.start_date?.slice(0, 10)} → {m.end_date?.slice(0, 10)}
                  </td>
                  <td>
                    <MissionBadge status={m.status as any} />
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
