import { useNavigate } from 'react-router-dom'
import { DriverLayout } from './DriverLayout'
import { useDriverData } from './useDriverData'
import { MissionBadge } from '@/components/ui'
import { formatNumber } from '@/utils/format'

export function DriverMission() {
  const { mission, vehicle } = useDriverData()
  const navigate = useNavigate()

  return (
    <DriverLayout title="Ma mission">
      {mission && vehicle ? (
        <>
          <div className="card">
            <div className="stat-row">
              <strong>{mission.code}</strong>
              <MissionBadge status={mission.status} />
            </div>
            <div className="stat-row">
              <span className="muted">Chantier</span>
              <strong>{mission.site}</strong>
            </div>
            <div className="stat-row">
              <span className="muted">Engin</span>
              <span>
                {vehicle.code} — {vehicle.type}
              </span>
            </div>
            <div className="stat-row">
              <span className="muted">Période</span>
              <span>
                {mission.startDate} → {mission.endDate}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Timeline</div>
            <ul className="timeline">
              {mission.timeline.map((e, i) => (
                <li className="done" key={i}>
                  <div className="strong">{e.label}</div>
                  <div className="muted small">{e.time}</div>
                </li>
              ))}
            </ul>
          </div>

          {mission.departure && (
            <div className="card">
              <div className="card-title">Compteurs au départ</div>
              <div className="stat-row">
                <span className="muted">Kilométrage</span>
                <strong>{formatNumber(mission.departure.km)} km</strong>
              </div>
              <div className="stat-row">
                <span className="muted">Heures moteur</span>
                <strong>{formatNumber(mission.departure.engineHours)} h</strong>
              </div>
              <div className="stat-row">
                <span className="muted">Carburant</span>
                <strong>{mission.departure.fuelLevel} %</strong>
              </div>
            </div>
          )}

          {mission.status === 'affectee' && (
            <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/conducteur/depart')}>
              CONFIRMER LE DÉPART
            </button>
          )}
          {mission.status === 'en_cours' && (
            <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/conducteur/retour')}>
              ENREGISTRER LE RETOUR
            </button>
          )}
        </>
      ) : (
        <div className="card">
          <p className="muted">Aucune mission en cours.</p>
        </div>
      )}
    </DriverLayout>
  )
}
