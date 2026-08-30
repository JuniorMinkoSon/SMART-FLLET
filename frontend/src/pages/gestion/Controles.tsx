import { useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { useMissionWorkflow } from '@/hooks/useMissionWorkflow'
import { EmptyState, MissionBadge, Modal } from '@/components/ui'
import { formatNumber } from '@/utils/format'
import { Mission } from '@/types'
import { Check, AlertTriangle } from 'lucide-react'

export function Controles() {
  const { vehicles, drivers } = useFleetStore()
  const { getVisibleMissions, validateReturn } = useMissionWorkflow()
  const [confirm, setConfirm] = useState<{ mission: Mission; action: 'valider' | 'maintenance' } | null>(null)

  const missions = getVisibleMissions()
  const toControl = missions.filter((m) => m.status === 'controle')
  const departures = missions.filter((m) => m.status === 'affectee')

  const checklistLabels: Record<string, string> = {
    pneus: 'Pneus',
    freins: 'Freins',
    eclairage: 'Éclairage',
    carrosserie: 'Carrosserie',
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Départs & retours</h1>
          <p className="page-subtitle">Contrôlez les retours de mission et suivez les départs planifiés</p>
        </div>
      </div>

      <div className="section">
        <h3 style={{ marginBottom: 12 }}>Retours à contrôler ({toControl.length})</h3>
        {toControl.length === 0 && <div className="card"><EmptyState message="Aucun retour à contrôler." /></div>}
        {toControl.map((m) => {
          const v = vehicles.find((x) => x.id === m.vehicleId)
          const d = drivers.find((x) => x.id === m.driverId)
          const dep = m.departure
          const arr = m.arrival
          return (
            <div className="card section" key={m.id}>
              <div className="page-header" style={{ marginBottom: 8 }}>
                <div>
                  <div className="strong" style={{ fontSize: 16 }}>
                    {v?.code} — {v?.type}
                  </div>
                  <div className="muted">
                    Mission {m.code} · {m.site} · Opérateur : {d?.name}
                  </div>
                </div>
                <MissionBadge status={m.status} />
              </div>

              {dep && arr && (
                <div className="table-wrap section">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Départ</th>
                        <th>Retour</th>
                        <th>Écart</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="muted">Kilométrage</td>
                        <td>{formatNumber(dep.km)}</td>
                        <td>{formatNumber(arr.km)}</td>
                        <td className="strong">+{formatNumber(arr.km - dep.km)} km</td>
                      </tr>
                      <tr>
                        <td className="muted">Heures moteur</td>
                        <td>{formatNumber(dep.engineHours)}</td>
                        <td>{formatNumber(arr.engineHours)}</td>
                        <td className="strong">+{formatNumber(arr.engineHours - dep.engineHours)} h</td>
                      </tr>
                      <tr>
                        <td className="muted">Carburant</td>
                        <td>{dep.fuelLevel}%</td>
                        <td>{arr.fuelLevel}%</td>
                        <td className="strong">-{dep.fuelLevel - arr.fuelLevel}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {arr && (
                <div className="section">
                  <div className="card-title">Checklist retour</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {Object.entries(arr.checklist).map(([k, ok]) => (
                      <span key={k} className="strong" style={{ color: ok ? 'var(--green)' : 'var(--orange)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {ok ? <Check size={14} /> : <AlertTriangle size={14} />} {checklistLabels[k]}
                      </span>
                    ))}
                  </div>
                  {arr.anomaly && (
                    <p style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} color="var(--orange)" /> <strong>Anomalie :</strong> {arr.anomaly}
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={() => setConfirm({ mission: m, action: 'valider' })}>
                  Valider le retour
                </button>
                <button className="btn btn-danger" onClick={() => setConfirm({ mission: m, action: 'maintenance' })}>
                  Envoyer en maintenance
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="section">
        <h3 style={{ marginBottom: 12 }}>Départs planifiés ({departures.length})</h3>
        {departures.length === 0 && <div className="card"><EmptyState message="Aucun départ en attente." /></div>}
        {departures.map((m) => {
          const v = vehicles.find((x) => x.id === m.vehicleId)
          const d = drivers.find((x) => x.id === m.driverId)
          return (
            <div className="card section" key={m.id}>
              <div className="stat-row">
                <span>
                  <strong>
                    {v?.code} — {v?.type}
                  </strong>{' '}
                  · Mission {m.code} · {m.site} · {d?.name}
                </span>
                <span className="muted small">
                  Le départ est confirmé par le conducteur depuis son interface mobile.
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        open={confirm !== null}
        title={confirm?.action === 'valider' ? 'Valider le retour ?' : 'Envoyer en maintenance ?'}
        onClose={() => setConfirm(null)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirm(null)}>
              Annuler
            </button>
            <button
              className={`btn ${confirm?.action === 'valider' ? 'btn-success' : 'btn-danger'}`}
              onClick={() => {
                if (!confirm) return
                if (confirm.action === 'valider') validateReturn(confirm.mission.id, true)
                else validateReturn(confirm.mission.id, false)
                setConfirm(null)
              }}
            >
              {confirm?.action === 'valider' ? 'Valider' : 'Confirmer'}
            </button>
          </>
        }
      >
        {confirm && (
          <p className="muted">
            {vehicles.find((v) => v.id === confirm.mission.vehicleId)?.code} — Mission{' '}
            {confirm.mission.code}
            <br />
            {confirm.action === 'valider'
              ? "Cette action clôturera la mission et remettra l'engin en disponibilité."
              : "Cette action clôturera la mission et placera l'engin en maintenance."}
          </p>
        )}
      </Modal>
    </div>
  )
}
