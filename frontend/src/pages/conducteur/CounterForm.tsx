import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DriverLayout } from './DriverLayout'
import { useDriverData } from './useDriverData'
import { useMissionWorkflow } from '@/hooks/useMissionWorkflow'
import { formatNumber } from '@/utils/format'
import { ChecklistState } from '@/types'

const CHECK_ITEMS: { key: keyof ChecklistState; label: string }[] = [
  { key: 'pneus', label: 'Pneus' },
  { key: 'freins', label: 'Freins' },
  { key: 'eclairage', label: 'Éclairage' },
  { key: 'carrosserie', label: 'Carrosserie' },
]

export function CounterForm({ mode }: { mode: 'depart' | 'retour' }) {
  const { mission, vehicle } = useDriverData()
  const { startMission, returnMission } = useMissionWorkflow()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const [km, setKm] = useState(vehicle ? String(vehicle.km) : '')
  const [hours, setHours] = useState(vehicle ? String(vehicle.engineHours) : '')
  const [fuel, setFuel] = useState(vehicle ? vehicle.fuelLevel : 50)
  const [checklist, setChecklist] = useState<ChecklistState>({
    pneus: true,
    freins: true,
    eclairage: true,
    carrosserie: true,
  })
  const [anomaly, setAnomaly] = useState('')
  const [showAnomaly, setShowAnomaly] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!mission || !vehicle) {
    return (
      <DriverLayout title={mode === 'depart' ? 'Départ de mission' : 'Retour de mission'}>
        <div className="card">
          <p className="muted">Aucune mission en cours.</p>
        </div>
      </DriverLayout>
    )
  }

  const dep = mission.departure
  const kmNum = Number(km)
  const hoursNum = Number(hours)

  const submit = async () => {
    try {
      setError('')
      const reading = {
        km: kmNum,
        engineHours: hoursNum,
        fuelLevel: fuel,
        checklist,
        anomaly: anomaly || undefined,
      }
      if (mode === 'depart') {
        await startMission(mission.id, reading)
        navigate('/conducteur')
      } else {
        await returnMission(mission.id, reading)
        setSaved(true)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (saved && dep) {
    return (
      <DriverLayout title="Retour enregistré">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>✓</div>
          <h2 style={{ margin: '10px 0' }}>Données enregistrées</h2>
          <div className="divider" />
          <div className="stat-row">
            <span className="muted">Écart kilométrage</span>
            <strong>{formatNumber(kmNum - dep.km)} km</strong>
          </div>
          <div className="stat-row">
            <span className="muted">Écart heures</span>
            <strong>{formatNumber(hoursNum - dep.engineHours)} h</strong>
          </div>
          <div className="stat-row">
            <span className="muted">Carburant consommé</span>
            <strong>{dep.fuelLevel - fuel} %</strong>
          </div>
          <div className="stat-row">
            <span className="muted">Statut</span>
            <span className="badge badge-controle">
              <span className="dot" />
              EN CONTRÔLE
            </span>
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={() => navigate('/conducteur')}>
            Terminer
          </button>
        </div>
      </DriverLayout>
    )
  }

  return (
    <DriverLayout title={mode === 'depart' ? 'Départ de mission' : 'Retour de mission'}>
      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--red)', padding: 12, marginBottom: 16 }}>
          <strong style={{ color: 'var(--red)' }}>Erreur :</strong> {error}
        </div>
      )}
      <div className="card">
        <p className="strong" style={{ marginBottom: 14 }}>
          {vehicle.code} — {vehicle.type}
        </p>
        <div className="field">
          <label>Compteur (km)</label>
          <input type="number" value={km} onChange={(e) => setKm(e.target.value)} />
        </div>
        <div className="field">
          <label>Heures moteur</label>
          <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
        <div className="field">
          <label>Carburant — {fuel} %</label>
          <div className="range-row">
            <input
              type="range"
              min={0}
              max={100}
              value={fuel}
              onChange={(e) => setFuel(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">État de l'engin</div>
        {CHECK_ITEMS.map((item) => (
          <label className="checklist-item" key={item.key} style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14, color: 'var(--text)' }}>
            <input
              type="checkbox"
              checked={checklist[item.key]}
              onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
            />
            {item.label}
          </label>
        ))}
        {showAnomaly ? (
          <div className="field" style={{ marginTop: 10 }}>
            <label>Anomalie</label>
            <textarea rows={3} value={anomaly} onChange={(e) => setAnomaly(e.target.value)} placeholder="Décrire l'anomalie..." />
          </div>
        ) : (
          <button className="link-btn" onClick={() => setShowAnomaly(true)}>
            + Ajouter une anomalie
          </button>
        )}
      </div>

      {mode === 'retour' && dep && (
        <div className="card">
          <div className="card-title">Calcul automatique</div>
          <div className="stat-row">
            <span className="muted">Kilométrage</span>
            <strong>{Number.isFinite(kmNum) ? formatNumber(Math.max(0, kmNum - dep.km)) : '—'} km</strong>
          </div>
          <div className="stat-row">
            <span className="muted">Heures</span>
            <strong>{Number.isFinite(hoursNum) ? formatNumber(Math.max(0, hoursNum - dep.engineHours)) : '—'} h</strong>
          </div>
          <div className="stat-row">
            <span className="muted">Carburant consommé</span>
            <strong>{Math.max(0, dep.fuelLevel - fuel)} %</strong>
          </div>
        </div>
      )}

      <button className="btn btn-primary btn-block btn-lg" onClick={submit} disabled={!km || !hours}>
        {mode === 'depart' ? 'CONFIRMER LE DÉPART' : 'ENREGISTRER LE RETOUR'}
      </button>
    </DriverLayout>
  )
}
