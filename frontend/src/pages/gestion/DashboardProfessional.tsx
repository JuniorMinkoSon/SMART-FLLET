import { useEffect, useState } from 'react'
import { StatCard } from '@/components/cards/StatCard'
import { StatusBadge } from '@/components/badges/StatusBadge'
import { ActivityFeed } from '@/components/feeds/ActivityFeed'
import { LayoutDashboard, Truck, Users, ClipboardList, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  vehiclesInMission: number
  vehiclesInMaintenance: number

  totalMissions: number
  activeMissions: number
  completedMissions: number
  pendingValidations: number

  totalDrivers: number
  availableDrivers: number
  driversInMission: number

  totalAlerts: number
  criticalAlerts: number
}

interface RecentMission {
  id: string
  code: string
  vehicle: string
  driver: string
  status: string
  progress: number
}

interface Activity {
  id: string
  action: string
  user: string
  entity: string
  timestamp: Date
  type: 'create' | 'update' | 'delete' | 'action'
}

export function DashboardProfessional() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 124,
    availableVehicles: 82,
    vehiclesInMission: 35,
    vehiclesInMaintenance: 7,

    totalMissions: 48,
    activeMissions: 18,
    completedMissions: 23,
    pendingValidations: 7,

    totalDrivers: 62,
    availableDrivers: 41,
    driversInMission: 18,

    totalAlerts: 3,
    criticalAlerts: 1,
  })

  const [recentMissions, setRecentMissions] = useState<RecentMission[]>([
    { id: '1', code: 'SF-2026-014', vehicle: 'Pelle CAT 320', driver: 'Jean Kouassi', status: 'EN_COURS', progress: 72 },
    { id: '2', code: 'SF-2026-013', vehicle: 'Camion Benne', driver: 'Moussa Koné', status: 'EN_COURS', progress: 45 },
    { id: '3', code: 'SF-2026-012', vehicle: 'Bulldozer', driver: 'Pierre Dupont', status: 'CONTROLE', progress: 95 },
  ])

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      action: 'a démarré',
      user: 'Admin',
      entity: 'Mission SF-2026-014',
      timestamp: new Date(Date.now() - 10 * 60000),
      type: 'action',
    },
    {
      id: '2',
      action: 'a assigné',
      user: 'Gestionnaire',
      entity: 'Jean Kouassi à SF-2026-014',
      timestamp: new Date(Date.now() - 45 * 60000),
      type: 'update',
    },
    {
      id: '3',
      action: 'a créé',
      user: 'Admin',
      entity: 'Mission SF-2026-014',
      timestamp: new Date(Date.now() - 120 * 60000),
      type: 'create',
    },
  ])

  return (
    <div className="dashboard-professional">
      {/* HEADER AVEC BIENVENUE */}
      <div className="dashboard-welcome">
        <div>
          <h2 className="welcome-title">Bienvenue, {user?.name}!</h2>
          <p className="welcome-subtitle">Voici un aperçu de votre flotte et de vos opérations</p>
        </div>
        <div className="welcome-badges">
          {stats.totalAlerts > 0 && (
            <div className="alert-badge alert-critical">
              <AlertTriangle size={16} />
              <span>{stats.criticalAlerts} alerte critique</span>
            </div>
          )}
        </div>
      </div>

      {/* KPIs FLOTTE */}
      <div className="dashboard-section">
        <h3 className="section-title">Flotte</h3>
        <div className="grid grid-4">
          <StatCard
            title="Engins"
            value={stats.totalVehicles}
            subtitle={`${stats.availableVehicles} disponibles`}
            Icon={Truck}
            color="blue"
            trend={{ value: 2, isPositive: true }}
          />
          <StatCard
            title="En mission"
            value={stats.vehiclesInMission}
            subtitle={`${Math.round((stats.vehiclesInMission / stats.totalVehicles) * 100)}% de la flotte`}
            Icon={Truck}
            color="orange"
          />
          <StatCard
            title="Maintenance"
            value={stats.vehiclesInMaintenance}
            subtitle="À service"
            Icon={Truck}
            color="red"
          />
          <StatCard
            title="Disponibles"
            value={stats.availableVehicles}
            subtitle="Prêts à partir"
            Icon={Truck}
            color="green"
          />
        </div>
      </div>

      {/* KPIs MISSIONS */}
      <div className="dashboard-section">
        <h3 className="section-title">Missions</h3>
        <div className="grid grid-4">
          <StatCard
            title="Total"
            value={stats.totalMissions}
            subtitle={`${stats.completedMissions} clôturées`}
            Icon={ClipboardList}
            color="blue"
          />
          <StatCard
            title="Actives"
            value={stats.activeMissions}
            subtitle="En cours d'exécution"
            Icon={ClipboardList}
            color="orange"
          />
          <StatCard
            title="À valider"
            value={stats.pendingValidations}
            subtitle="Retours à valider"
            Icon={ClipboardList}
            color="red"
          />
          <StatCard
            title="Complétées"
            value={stats.completedMissions}
            subtitle={`${Math.round((stats.completedMissions / stats.totalMissions) * 100)}% du total`}
            Icon={ClipboardList}
            color="green"
          />
        </div>
      </div>

      {/* KPIs CONDUCTEURS */}
      <div className="dashboard-section">
        <h3 className="section-title">Conducteurs</h3>
        <div className="grid grid-3">
          <StatCard
            title="Total"
            value={stats.totalDrivers}
            subtitle="Effectif actif"
            Icon={Users}
            color="blue"
          />
          <StatCard
            title="Disponibles"
            value={stats.availableDrivers}
            subtitle={`${Math.round((stats.availableDrivers / stats.totalDrivers) * 100)}% actifs`}
            Icon={Users}
            color="green"
          />
          <StatCard
            title="En mission"
            value={stats.driversInMission}
            subtitle="Actuellement occupés"
            Icon={Users}
            color="orange"
          />
        </div>
      </div>

      {/* MISSIONS RÉCENTES */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Missions en cours</h3>
          <a href="/missions" className="section-link">Voir tout</a>
        </div>
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>Engin</th>
                  <th>Conducteur</th>
                  <th>Status</th>
                  <th>Progression</th>
                </tr>
              </thead>
              <tbody>
                {recentMissions.map((mission) => (
                  <tr key={mission.id}>
                    <td className="font-semibold">{mission.code}</td>
                    <td>{mission.vehicle}</td>
                    <td>{mission.driver}</td>
                    <td>
                      <StatusBadge status={mission.status.toLowerCase() as any} />
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${mission.progress}%` }} />
                      </div>
                      <span className="progress-text">{mission.progress}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ACTIVITÉ RÉCENTE */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Activité récente</h3>
          <a href="#" className="section-link">Voir tout</a>
        </div>
        <div className="card">
          <ActivityFeed activities={activities} limit={5} />
        </div>
      </div>
    </div>
  )
}

const dashboardStyles = `
.dashboard-professional {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.welcome-badges {
  display: flex;
  gap: 8px;
}

.alert-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
}

.alert-badge.alert-critical {
  background: var(--red-light);
  color: var(--red);
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-link {
  font-size: 13px;
  color: var(--blue);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.section-link:hover {
  color: var(--blue-dark);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue), var(--blue-dark));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .dashboard-welcome {
    flex-direction: column;
    align-items: flex-start;
  }

  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid-4, .grid-3, .grid-2 {
    grid-template-columns: 1fr;
  }

  .table-container {
    font-size: 12px;
  }

  table th, table td {
    padding: 8px;
  }
}
`
