import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import { useMissionWorkflow } from '@/hooks/useMissionWorkflow'
import { StatusBadge } from '@/components/ui'
import { formatFCFA } from '@/utils/format'
import { Check } from 'lucide-react'

const STEPS = ['Mission', 'Engin', 'Opérateur', 'Validation']

export function MissionWizard() {
  const { vehicles, drivers } = useFleetStore()
  const { createMission } = useMissionWorkflow()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  const [site, setSite] = useState('')
  const [client, setClient] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)
  const selectedDriver = drivers.find((d) => d.id === driverId)

  const step1Valid = site && startDate && endDate && budget

  const create = async () => {
    try {
      setError('')
      const mission = await createMission({
        site,
        client: client || undefined,
        vehicleId,
        driverId,
        startDate,
        endDate,
        budget: Number(budget),
      })
      navigate(`/missions/${mission.id}`)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <Link to="/missions" className="link-btn">
        ← Retour aux missions
      </Link>
      <div className="page-header" style={{ marginTop: 12 }}>
        <h1 className="page-title">Créer une mission</h1>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--red)', padding: 12 }}>
          <strong style={{ color: 'var(--red)' }}>Erreur :</strong> {error}
        </div>
      )}

      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'contents' }}>
            <div className={`wizard-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <span className="num">{i < step ? <Check size={12} /> : `0${i + 1}`}</span>
              {s}
            </div>
            {i < STEPS.length - 1 && <div className="wizard-sep" />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <>
            <div className="field">
              <label htmlFor="mw-site">Chantier</label>
              <input
                id="mw-site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="Chantier Alpha"
              />
            </div>
            <div className="field">
              <label htmlFor="mw-client">Client (optionnel)</label>
              <input
                id="mw-client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Génie Sélect"
              />
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="mw-start">Début</label>
                <input id="mw-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="mw-end">Fin</label>
                <input id="mw-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="mw-budget">Budget (FCFA)</label>
              <input
                id="mw-budget"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1 500 000"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" disabled={!step1Valid} onClick={() => setStep(1)}>
                Continuer
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="card-title">Engins disponibles</div>
            {vehicles.map((v) => {
              const available = v.status === 'disponible'
              return (
                <button
                  key={v.id}
                  className={`option-card ${vehicleId === v.id ? 'selected' : ''}`}
                  disabled={!available}
                  onClick={() => setVehicleId(v.id)}
                >
                  <span>
                    <strong>{v.code}</strong> — {v.type}
                  </span>
                  <StatusBadge status={v.status} />
                </button>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setStep(0)}>
                Retour
              </button>
              <button className="btn btn-primary" disabled={!vehicleId} onClick={() => setStep(2)}>
                Continuer
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="card-title">Opérateurs compatibles</div>
            {drivers.map((d) => {
              // L'habilitation conditionne l'affectation. Une liste vide signifie
              // « aucune habilitation déclarée » : l'opérateur n'est pas
              // sélectionnable, et la raison doit être dite plutôt que laissée
              // à deviner devant un bouton grisé.
              const declared = d.vehicleCategories.length > 0
              const compatible = !selectedVehicle
                ? declared
                : d.vehicleCategories.includes(selectedVehicle.type)
              const available = d.status === 'disponible'
              return (
                <button
                  key={d.id}
                  className={`option-card ${driverId === d.id ? 'selected' : ''}`}
                  disabled={!compatible || !available}
                  onClick={() => setDriverId(d.id)}
                >
                  <span>
                    <strong>{d.name}</strong>
                    <span className="muted small">
                      {' — '}
                      {declared ? d.vehicleCategories.join(', ') : 'aucune habilitation'}
                    </span>
                  </span>
                  <span
                    className="small strong"
                    style={{ color: compatible && available ? 'var(--green)' : 'var(--text-3)' }}
                  >
                    {!declared
                      ? 'Habilitations à renseigner'
                      : !compatible
                        ? `Habilité : ${d.vehicleCategories.join(', ')}`
                        : available
                          ? `${selectedVehicle?.type} — compatible`
                          : 'Indisponible'}
                  </span>
                </button>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Retour
              </button>
              <button className="btn btn-primary" disabled={!driverId} onClick={() => setStep(3)}>
                Continuer
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card-title">Récapitulatif</div>
            <div className="stat-row">
              <span className="muted">Chantier</span>
              <strong>{site}</strong>
            </div>
            {client && (
              <div className="stat-row">
                <span className="muted">Client</span>
                <strong>{client}</strong>
              </div>
            )}
            <div className="stat-row">
              <span className="muted">Engin</span>
              <strong>
                {selectedVehicle?.code} — {selectedVehicle?.type}
              </strong>
            </div>
            <div className="stat-row">
              <span className="muted">Opérateur</span>
              <strong>{selectedDriver?.name}</strong>
            </div>
            <div className="stat-row">
              <span className="muted">Période</span>
              <strong>
                {startDate} → {endDate}
              </strong>
            </div>
            <div className="stat-row">
              <span className="muted">Budget</span>
              <strong>{formatFCFA(Number(budget))}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Retour
              </button>
              <button className="btn btn-primary" onClick={create}>
                Créer la mission
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
