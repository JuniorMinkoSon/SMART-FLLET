import { Link, useParams } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import { MissionBadge } from '@/components/ui'
import { formatFCFA, formatNumber } from '@/utils/format'

const FLOW_STEPS = [
  'Mission créée',
  'Engin affecté',
  'Départ enregistré',
  'Exploitation',
  'Retour',
  'Contrôle',
  'Clôture',
]

export function MissionDetail() {
  const { id } = useParams()
  const { missions, vehicles, drivers } = useFleetStore()
  const mission = missions.find((m) => m.id === id)

  if (!mission) {
    return (
      <div className="page">
        <p>Mission introuvable.</p>
        <Link to="/missions" className="link-btn">
          ← Retour aux missions
        </Link>
      </div>
    )
  }

  const vehicle = vehicles.find((v) => v.id === mission.vehicleId)
  const driver = drivers.find((d) => d.id === mission.driverId)

  const progress: Record<string, number> = {
    planifiee: 1,
    affectee: 2,
    en_cours: 4,
    retour: 5,
    controle: 6,
    cloturee: 7,
  }
  const done = progress[mission.status]

  const dep = mission.departure
  const arr = mission.arrival
  const current = arr ?? (vehicle ? { km: vehicle.km, engineHours: vehicle.engineHours, fuelLevel: vehicle.fuelLevel } : undefined)

  return (
    <div className="page">
      <Link to="/missions" className="link-btn">
        ← Retour aux missions
      </Link>
      <div className="page-header" style={{ marginTop: 12 }}>
        <div>
          <h1 className="page-title">Mission #{mission.code}</h1>
          <p className="page-subtitle" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
            {mission.site}
          </p>
          <div style={{ marginTop: 8 }}>
            <MissionBadge status={mission.status} />
          </div>
        </div>
      </div>

      <div className="grid-70-30">
        <div>
          <div className="grid-2 section">
            <div className="card">
              <div className="card-title">Engin</div>
              <div className="strong">
                {vehicle?.code} — {vehicle?.type}
              </div>
              {vehicle && (
                <Link to={`/flotte/${vehicle.id}`} className="link-btn small">
                  Voir la fiche →
                </Link>
              )}
            </div>
            <div className="card">
              <div className="card-title">Opérateur</div>
              <div className="strong">{driver?.name}</div>
              <div className="muted small">{driver?.phone}</div>
            </div>
          </div>

          <div className="card section">
            <div className="card-title">Compteurs</div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Départ</th>
                    <th>Actuel</th>
                    <th>Écart</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="muted">Kilométrage</td>
                    <td>{dep ? `${formatNumber(dep.km)} km` : '—'}</td>
                    <td>{current ? `${formatNumber(current.km)} km` : '—'}</td>
                    <td className="strong">{dep && current ? `${formatNumber(current.km - dep.km)} km` : '—'}</td>
                  </tr>
                  <tr>
                    <td className="muted">Heures moteur</td>
                    <td>{dep ? `${formatNumber(dep.engineHours)} h` : '—'}</td>
                    <td>{current ? `${formatNumber(current.engineHours)} h` : '—'}</td>
                    <td className="strong">
                      {dep && current ? `${formatNumber(current.engineHours - dep.engineHours)} h` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="muted">Carburant</td>
                    <td>{dep ? `${dep.fuelLevel} %` : '—'}</td>
                    <td>{current ? `${current.fuelLevel} %` : '—'}</td>
                    <td className="strong">{dep && current ? `${dep.fuelLevel - current.fuelLevel} %` : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {arr?.anomaly && (
            <div className="card section">
              <div className="card-title">Anomalie signalée au retour</div>
              <p>⚠ {arr.anomaly}</p>
            </div>
          )}
        </div>

        <div>
          <div className="card section">
            <div className="card-title">Timeline</div>
            <ul className="timeline">
              {FLOW_STEPS.map((s, i) => (
                <li key={s} className={i < done ? 'done' : i === done ? 'current' : ''}>
                  <div className={i < done ? 'strong' : 'muted'}>
                    {i < done ? '✓ ' : i === done ? '● ' : '○ '}
                    {s}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="card-title">Informations</div>
            <div className="stat-row">
              <span className="muted">Période</span>
              <span className="small">
                {mission.startDate} → {mission.endDate}
              </span>
            </div>
            <div className="stat-row">
              <span className="muted">Budget</span>
              <span>{formatFCFA(mission.budget)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
