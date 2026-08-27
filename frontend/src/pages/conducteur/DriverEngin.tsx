import { DriverLayout } from './DriverLayout'
import { useDriverData } from './useDriverData'
import { StatusBadge } from '@/components/ui'
import { formatNumber } from '@/utils/format'

export function DriverEngin() {
  const { vehicle } = useDriverData()

  return (
    <DriverLayout title="Mon engin">
      {vehicle ? (
        <>
          <div className="card">
            <div className="stat-row">
              <h2 style={{ fontSize: 22 }}>{vehicle.code}</h2>
              <StatusBadge status={vehicle.status} />
            </div>
            <p className="muted">{vehicle.name}</p>
            <p className="muted small">{vehicle.plate}</p>
          </div>
          <div className="card">
            <div className="card-title">Compteurs</div>
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
            <div className="stat-row">
              <span className="muted">État général</span>
              <strong>{vehicle.condition}</strong>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <p className="muted">Aucun engin affecté actuellement.</p>
        </div>
      )}
    </DriverLayout>
  )
}
