import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import { MissionBadge, StatusBadge } from '@/components/ui'
import { formatFCFA, formatNumber } from '@/utils/format'

type Tab = 'general' | 'missions' | 'carburant' | 'depenses' | 'historique'

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'Vue générale' },
  { id: 'missions', label: 'Missions' },
  { id: 'carburant', label: 'Carburant' },
  { id: 'depenses', label: 'Dépenses' },
  { id: 'historique', label: 'Historique' },
]

export function FicheEngin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { vehicles, missions, drivers, fuelEntries, expenses } = useFleetStore()
  const [tab, setTab] = useState<Tab>('general')

  const vehicle = vehicles.find((v) => v.id === id)
  if (!vehicle) {
    return (
      <div className="page">
        <p>Engin introuvable.</p>
        <Link to="/flotte" className="link-btn">
          ← Retour à la flotte
        </Link>
      </div>
    )
  }

  const vMissions = missions.filter((m) => m.vehicleId === vehicle.id)
  const currentMission = vMissions.find((m) => m.status !== 'cloturee')
  const driver = drivers.find((d) => d.id === vehicle.driverId)
  const vFuel = fuelEntries.filter((f) => f.vehicleId === vehicle.id)
  const vExpenses = expenses.filter((e) => e.vehicleId === vehicle.id)
  const activities = currentMission
    ? [...currentMission.timeline].reverse()
    : vMissions[0]
      ? [...vMissions[0].timeline].reverse()
      : []

  return (
    <div className="page">
      <Link to="/flotte" className="link-btn">
        ← Retour à la flotte
      </Link>

      <div className="page-header" style={{ marginTop: 12 }}>
        <div>
          <h1 className="page-title">{vehicle.code}</h1>
          <p className="page-subtitle" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
            {vehicle.name}
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={vehicle.status} />
            {vehicle.site && <span className="muted">{vehicle.site}</span>}
            {driver && <span className="muted">Opérateur : {driver.name}</span>}
          </div>
        </div>
        {currentMission && (
          <button className="btn btn-secondary" onClick={() => navigate(`/missions/${currentMission.id}`)}>
            Voir mission
          </button>
        )}
      </div>

      <div className="filters" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0, gap: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className="link-btn"
            style={{
              padding: '10px 16px',
              color: tab === t.id ? 'var(--brand)' : 'var(--text-2)',
              borderBottom: tab === t.id ? '2px solid var(--brand)' : '2px solid transparent',
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <>
          <div className="kpi-grid" style={{ marginTop: 20 }}>
            <div className="card">
              <div className="kpi-value" style={{ fontSize: 22 }}>{formatNumber(vehicle.km)} km</div>
              <div className="kpi-label">Kilométrage</div>
            </div>
            <div className="card">
              <div className="kpi-value" style={{ fontSize: 22 }}>{formatNumber(vehicle.engineHours)} h</div>
              <div className="kpi-label">Heures moteur</div>
            </div>
            <div className="card">
              <div className="kpi-value" style={{ fontSize: 22 }}>{vehicle.fuelLevel} %</div>
              <div className="kpi-label">Carburant</div>
            </div>
            <div className="card">
              <div className="kpi-value" style={{ fontSize: 22 }}>{vehicle.condition}</div>
              <div className="kpi-label">État</div>
            </div>
          </div>

          <div className="grid-2 section">
            <div className="card">
              <div className="card-title">Mission actuelle</div>
              {currentMission ? (
                <>
                  <div className="stat-row">
                    <strong>{currentMission.site}</strong>
                    <MissionBadge status={currentMission.status} />
                  </div>
                  <div className="stat-row">
                    <span className="muted">Période</span>
                    <span>
                      {currentMission.startDate} → {currentMission.endDate}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="muted">Budget</span>
                    <span>{formatFCFA(currentMission.budget)}</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link to={`/missions/${currentMission.id}`} className="link-btn">
                      Voir la mission →
                    </Link>
                  </div>
                </>
              ) : (
                <p className="muted">Aucune mission en cours.</p>
              )}
            </div>

            <div className="card">
              <div className="card-title">Dernières activités</div>
              {activities.length ? (
                activities.slice(0, 5).map((e, i) => (
                  <div className="stat-row" key={i}>
                    <span>{e.label}</span>
                    <span className="muted small">{e.time}</span>
                  </div>
                ))
              ) : (
                <p className="muted">Aucune activité enregistrée.</p>
              )}
            </div>
          </div>

          <div className="grid-2 section">
            <div className="card">
              <div className="card-title">Informations</div>
              <div className="stat-row">
                <span className="muted">Type</span>
                <span>{vehicle.type}</span>
              </div>
              <div className="stat-row">
                <span className="muted">Immatriculation</span>
                <span>{vehicle.plate}</span>
              </div>
              <div className="stat-row">
                <span className="muted">Propriétaire</span>
                <span>{vehicle.external ? 'Externe' : 'Interne'}</span>
              </div>
            </div>

            {vehicle.external && (
              <div className="card">
                <div className="card-title">Contrat externe</div>
                <div className="stat-row">
                  <span className="muted">Prestataire</span>
                  <span>{vehicle.external.provider}</span>
                </div>
                <div className="stat-row">
                  <span className="muted">Contrat</span>
                  <span>
                    {vehicle.external.start} → {vehicle.external.end}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="muted">Tarif</span>
                  <span>{formatNumber(vehicle.external.dailyRate)} FCFA / jour</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'missions' && (
        <div className="card table-wrap section" style={{ padding: 0, marginTop: 20 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Chantier</th>
                <th>Période</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {vMissions.map((m) => (
                <tr key={m.id} className="clickable" onClick={() => navigate(`/missions/${m.id}`)}>
                  <td className="strong">{m.code}</td>
                  <td>{m.site}</td>
                  <td>
                    {m.startDate} → {m.endDate}
                  </td>
                  <td>
                    <MissionBadge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'carburant' && (
        <div className="card section" style={{ marginTop: 20 }}>
          <div className="card-title">Ravitaillements</div>
          {vFuel.length ? (
            vFuel.map((f) => (
              <div className="stat-row" key={f.id}>
                <span>
                  {f.date} — <strong>{f.liters} L</strong>
                </span>
                <span>{formatFCFA(f.amount)}</span>
              </div>
            ))
          ) : (
            <p className="muted">Aucun ravitaillement.</p>
          )}
        </div>
      )}

      {tab === 'depenses' && (
        <div className="card section" style={{ marginTop: 20 }}>
          <div className="card-title">Dépenses</div>
          {vExpenses.length ? (
            vExpenses.map((e) => (
              <div className="stat-row" key={e.id}>
                <span>
                  {e.date} — {e.label} <span className="muted small">({e.category})</span>
                </span>
                <span>{formatFCFA(e.amount)}</span>
              </div>
            ))
          ) : (
            <p className="muted">Aucune dépense.</p>
          )}
        </div>
      )}

      {tab === 'historique' && (
        <div className="card section" style={{ marginTop: 20 }}>
          <div className="card-title">Historique complet</div>
          <ul className="timeline">
            {vMissions.flatMap((m) =>
              m.timeline.map((e, i) => (
                <li className="done" key={`${m.id}-${i}`}>
                  <div className="strong">{e.label}</div>
                  <div className="muted small">
                    {m.code} — {e.time}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
