import { useNavigate } from 'react-router-dom'
import { DriverLayout } from './DriverLayout'
import { useDriverData } from './useDriverData'
import { MissionBadge } from '@/components/ui'
import { formatNumber } from '@/utils/format'

export function DriverHome() {
  const { driver, mission, vehicle } = useDriverData()
  const navigate = useNavigate()

  return (
    <DriverLayout title={`Bonjour ${driver?.name ?? ''}`}>
      <div className="card">
        <div className="card-title">Ma mission</div>
        {mission && vehicle ? (
          <>
            <h2 style={{ fontSize: 24 }}>{mission.site.replace('Chantier ', '').toUpperCase()}</h2>
            <p className="muted" style={{ marginTop: 4 }}>
              {vehicle.type} {vehicle.code}
            </p>
            <p className="muted small" style={{ marginTop: 6 }}>
              {mission.startDate} → {mission.endDate} · 08:00 → 17:00
            </p>
            <div style={{ margin: '14px 0' }}>
              <MissionBadge status={mission.status} />
            </div>
            {mission.status === 'affectee' && (
              <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/conducteur/depart')}>
                DÉMARRER
              </button>
            )}
            {mission.status === 'en_cours' && (
              <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/conducteur/retour')}>
                ENREGISTRER LE RETOUR
              </button>
            )}
            {mission.status === 'controle' && (
              <p className="muted">Retour enregistré — en attente de contrôle par le gestionnaire.</p>
            )}
          </>
        ) : (
          <p className="muted">Aucune mission en cours. Votre prochaine mission apparaîtra ici.</p>
        )}
      </div>

      {vehicle && (
        <div className="card">
          <div className="card-title">Mon engin</div>
          <div className="stat-row">
            <span className="muted">Kilométrage</span>
            <strong>{formatNumber(vehicle.km)} km</strong>
          </div>
          <div className="stat-row">
            <span className="muted">Heures moteur</span>
            <strong>{formatNumber(vehicle.engineHours)} h</strong>
          </div>
          <div className="stat-row">
            <span className="muted">Carburant</span>
            <strong>{vehicle.fuelLevel} %</strong>
          </div>
        </div>
      )}
    </DriverLayout>
  )
}
