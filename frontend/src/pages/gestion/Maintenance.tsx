import { useMemo, useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { EmptyState, Modal } from '@/components/ui'
import { formatNumber } from '@/utils/format'
import type { Maintenance as MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '@/types'
import { Plus, AlertTriangle } from 'lucide-react'

/**
 * Atelier : interventions planifiées, en cours et terminées.
 *
 * Les interventions ouvertes viennent d'abord — ce sont elles qui immobilisent
 * des engins, donc la seule partie sur laquelle il y a quelque chose à faire.
 * L'historique sert à la consultation et au suivi des coûts.
 */

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En atelier',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
}

const TYPE_LABELS: Record<MaintenanceType, string> = {
  PREVENTIVE: 'Entretien',
  CORRECTIVE: 'Réparation',
  REGLEMENTAIRE: 'Contrôle réglementaire',
}

const STATUS_CLASS: Record<MaintenanceStatus, string> = {
  PLANIFIEE: 'badge-affecte',
  EN_COURS: 'badge-encours',
  TERMINEE: 'badge-cloture',
  ANNULEE: 'badge-neutre',
}

export function Maintenance() {
  const vehicles = useFleetStore((s) => s.vehicles)
  const maintenances = useFleetStore((s) => s.maintenances)
  const scheduleMaintenance = useFleetStore((s) => s.scheduleMaintenance)
  const startMaintenance = useFleetStore((s) => s.startMaintenance)
  const completeMaintenance = useFleetStore((s) => s.completeMaintenance)
  const cancelMaintenance = useFleetStore((s) => s.cancelMaintenance)

  const [showForm, setShowForm] = useState(false)
  const [closing, setClosing] = useState<MaintenanceRecord | null>(null)
  const [busy, setBusy] = useState(false)

  const { ongoing, history } = useMemo(() => ({
    ongoing: maintenances.filter((m) => m.status === 'PLANIFIEE' || m.status === 'EN_COURS'),
    history: maintenances.filter((m) => m.status === 'TERMINEE' || m.status === 'ANNULEE'),
  }), [maintenances])

  const totalCost = history.reduce((sum, m) => sum + (m.cost ?? 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Atelier</h1>
          <p className="page-subtitle">
            Interventions d'entretien et de réparation sur les engins de la flotte
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Planifier une intervention
        </button>
      </div>

      <div className="section">
        <h3 style={{ marginBottom: 12 }}>
          Interventions en cours ({ongoing.length})
        </h3>

        {ongoing.length === 0 && (
          <div className="card">
            <EmptyState
              title="Aucune intervention ouverte"
              message="Aucun engin n'est immobilisé à l'atelier."
            />
          </div>
        )}

        {ongoing.map((m) => (
          <div className="card section" key={m.id}>
            <div className="page-header" style={{ marginBottom: 8 }}>
              <div>
                <div className="strong" style={{ fontSize: 16 }}>
                  {m.vehicleCode} — {TYPE_LABELS[m.type]}
                </div>
                <div className="muted">
                  {m.scheduledDate ? `Prévue le ${m.scheduledDate}` : 'Sans date planifiée'}
                  {m.provider ? ` · ${m.provider}` : ''}
                  {m.kmReading ? ` · ${formatNumber(m.kmReading)} km` : ''}
                </div>
              </div>
              <span className={`badge ${STATUS_CLASS[m.status]}`}>{STATUS_LABELS[m.status]}</span>
            </div>

            <p style={{ margin: '8px 0 12px' }}>{m.description}</p>

            {/* Une intervention née d'un contrôle porte la trace du défaut :
                sans elle, on saurait qu'un engin est réparé mais plus pourquoi. */}
            {m.inspectionId && (
              <p className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> Ouverte à la suite d'un contrôle critique
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {m.status === 'PLANIFIEE' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true)
                    await startMaintenance(m.id)
                    setBusy(false)
                  }}
                >
                  Entrée à l'atelier
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => setClosing(m)}
              >
                Clôturer
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  await cancelMaintenance(m.id)
                  setBusy(false)
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Historique ({history.length})</h3>
          {totalCost > 0 && (
            <span className="muted">Coût cumulé : {formatNumber(totalCost)} FCFA</span>
          )}
        </div>

        {history.length === 0 && (
          <div className="card">
            <EmptyState message="Aucune intervention clôturée pour l'instant." />
          </div>
        )}

        {history.length > 0 && (
          <div className="card table-wrap" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Engin</th>
                  <th>Nature</th>
                  <th>Description</th>
                  <th>Clôturée</th>
                  <th>Coût</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {history.map((m) => (
                  <tr key={m.id}>
                    <td className="strong">{m.vehicleCode}</td>
                    <td>{TYPE_LABELS[m.type]}</td>
                    <td>{m.description}</td>
                    <td>{m.completedDate ?? '—'}</td>
                    <td>{m.cost != null ? `${formatNumber(m.cost)} FCFA` : '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[m.status]}`}>
                        {STATUS_LABELS[m.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ScheduleForm
          vehicles={vehicles}
          busy={busy}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            setBusy(true)
            const ok = await scheduleMaintenance(input)
            setBusy(false)
            if (ok) setShowForm(false)
          }}
        />
      )}

      {closing && (
        <CompleteForm
          maintenance={closing}
          busy={busy}
          onClose={() => setClosing(null)}
          onSubmit={async (input) => {
            setBusy(true)
            const ok = await completeMaintenance(closing.id, input)
            setBusy(false)
            if (ok) setClosing(null)
          }}
        />
      )}
    </div>
  )
}

function ScheduleForm({
  vehicles, busy, onClose, onSubmit,
}: {
  vehicles: { id: string; code: string; name: string }[]
  busy: boolean
  onClose: () => void
  onSubmit: (input: {
    vehicleId: string
    type: MaintenanceType
    description: string
    scheduledDate?: string
    provider?: string
  }) => void
}) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '')
  const [type, setType] = useState<MaintenanceType>('PREVENTIVE')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [provider, setProvider] = useState('')

  const canSubmit = vehicleId && description.trim().length > 0

  return (
    <Modal open title="Planifier une intervention" onClose={onClose}>
      <div className="field">
        <label htmlFor="mnt-vehicle">Engin</label>
        <select id="mnt-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.code} — {v.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="mnt-type">Nature</label>
        <select
          id="mnt-type"
          value={type}
          onChange={(e) => setType(e.target.value as MaintenanceType)}
        >
          <option value="PREVENTIVE">Entretien</option>
          <option value="CORRECTIVE">Réparation</option>
          <option value="REGLEMENTAIRE">Contrôle réglementaire</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="mnt-desc">Travaux à réaliser</label>
        <textarea
          id="mnt-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Révision des 500 heures, remplacement des filtres…"
        />
      </div>

      <div className="field">
        <label htmlFor="mnt-date">Date prévue</label>
        <input
          id="mnt-date"
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="mnt-provider">Atelier ou prestataire</label>
        <input
          id="mnt-provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="Atelier central"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canSubmit || busy}
          onClick={() => onSubmit({
            vehicleId,
            type,
            description: description.trim(),
            scheduledDate: scheduledDate || undefined,
            provider: provider.trim() || undefined,
          })}
        >
          {busy ? 'Enregistrement…' : 'Planifier'}
        </button>
      </div>
    </Modal>
  )
}

function CompleteForm({
  maintenance, busy, onClose, onSubmit,
}: {
  maintenance: MaintenanceRecord
  busy: boolean
  onClose: () => void
  onSubmit: (input: {
    cost: number
    provider?: string
    notes?: string
    resultingCondition?: 'BON' | 'MOYEN' | 'MAUVAIS'
  }) => void
}) {
  const [cost, setCost] = useState('')
  const [provider, setProvider] = useState(maintenance.provider ?? '')
  const [notes, setNotes] = useState('')
  const [condition, setCondition] = useState<'BON' | 'MOYEN' | 'MAUVAIS'>('BON')

  const parsedCost = Number(cost)
  const costValid = cost.trim() !== '' && Number.isFinite(parsedCost) && parsedCost >= 0

  return (
    <Modal open title={`Clôturer — ${maintenance.vehicleCode}`} onClose={onClose}>
      <p className="muted" style={{ marginBottom: 16 }}>{maintenance.description}</p>

      <div className="field">
        <label htmlFor="cmp-cost">Coût réel (FCFA)</label>
        <input
          id="cmp-cost"
          type="number"
          min={0}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="420000"
        />
        {/* Le coût conditionne la clôture : sans lui, l'intervention
            disparaîtrait des indicateurs de flotte. */}
        <p className="muted small">Nécessaire au suivi du coût de la flotte.</p>
      </div>

      <div className="field">
        <label htmlFor="cmp-provider">Atelier ou prestataire</label>
        <input id="cmp-provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="cmp-condition">État de l'engin après travaux</label>
        <select
          id="cmp-condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value as 'BON' | 'MOYEN' | 'MAUVAIS')}
        >
          <option value="BON">Bon</option>
          <option value="MOYEN">Moyen</option>
          <option value="MAUVAIS">Mauvais</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="cmp-notes">Observations</label>
        <textarea
          id="cmp-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pièces remplacées, points à surveiller…"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!costValid || busy}
          onClick={() => onSubmit({
            cost: parsedCost,
            provider: provider.trim() || undefined,
            notes: notes.trim() || undefined,
            resultingCondition: condition,
          })}
        >
          {busy ? 'Clôture…' : 'Clôturer'}
        </button>
      </div>
    </Modal>
  )
}
