import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useFleetStore } from '@/store/fleetStore'
import { KPICard, MissionBadge } from '@/components/ui'
import { formatFCFA } from '@/utils/format'
import { VEHICLE_STATUS_LABELS, VehicleStatus } from '@/types'
import { AlertCircle, Wrench, Clock } from 'lucide-react'

export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { vehicles, missions, expenses, fuelEntries } = useFleetStore()

  const count = (status: VehicleStatus) => vehicles.filter((v) => v.status === status).length
  const disponibles = count('disponible')
  const enMission = count('en_mission')
  const maintenance = count('maintenance') + count('hors_service')
  const retoursAControler = missions.filter((m) => m.status === 'controle').length
  const enginsAction = count('maintenance') + count('hors_service') + count('controle')
  const contratsExpirant = vehicles.filter((v) => v.external).length

  const fuelCost = fuelEntries.reduce((s, f) => s + f.amount, 0)
  const otherExpenses = expenses.filter((e) => e.category !== 'Carburant').reduce((s, e) => s + e.amount, 0)
  const missionBudget = missions.reduce((s, m) => s + m.budget, 0)
  const costPerVehicle = vehicles.length ? Math.round((fuelCost + otherExpenses) / vehicles.length) : 0

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const activeMissions = missions.filter((m) => m.status !== 'cloturee').slice(0, 5)

  const parcStatuses: VehicleStatus[] = ['disponible', 'reserve', 'en_mission', 'controle', 'maintenance', 'hors_service']

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bonjour, {user?.name}</h1>
          <p className="page-subtitle">Voici l'état de votre flotte aujourd'hui — {today}</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard value={vehicles.length} label="Engins" />
        <KPICard value={disponibles} label="Disponibles" />
        <KPICard value={enMission} label="En mission" />
        <KPICard value={maintenance} label="Maintenance / Panne" />
      </div>

      <div className="card section">
        <div className="card-title">Actions à traiter</div>
        <div className="stat-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={20} color="var(--red)" /> <strong>{retoursAControler}</strong> retour(s) à contrôler
          </span>
          <Link to="/controles" className="link-btn">
            Traiter
          </Link>
        </div>
        <div className="stat-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={20} color="var(--orange)" /> <strong>{enginsAction}</strong> engin(s) nécessitent une action
          </span>
          <Link to="/flotte" className="link-btn">
            Voir
          </Link>
        </div>
        <div className="stat-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} color="var(--yellow)" /> <strong>{contratsExpirant}</strong> contrat(s) externe(s) arrivent à échéance
          </span>
          <Link to="/flotte" className="link-btn">
            Voir
          </Link>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card">
          <div className="card-title">État du parc</div>
          {parcStatuses.map((s) => (
            <div className="stat-row" key={s}>
              <span>{VEHICLE_STATUS_LABELS[s]}</span>
              <strong>{count(s)}</strong>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Missions du jour</div>
          {activeMissions.map((m) => (
            <div className="stat-row" key={m.id}>
              <span>
                <strong>{m.site.replace('Chantier ', '')}</strong>{' '}
                <span className="muted small">{m.code}</span>
              </span>
              <MissionBadge status={m.status} />
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <Link to="/missions" className="link-btn">
              Voir missions →
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Coûts</div>
        <div className="kpi-grid" style={{ marginBottom: 0 }}>
          <div>
            <div className="kpi-value" style={{ fontSize: 20 }}>{formatFCFA(fuelCost)}</div>
            <div className="kpi-label">Carburant</div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: 20 }}>{formatFCFA(otherExpenses)}</div>
            <div className="kpi-label">Dépenses</div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: 20 }}>{formatFCFA(missionBudget)}</div>
            <div className="kpi-label">Missions</div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: 20 }}>{formatFCFA(costPerVehicle)}</div>
            <div className="kpi-label">Coût / engin</div>
          </div>
        </div>
      </div>
    </div>
  )
}
