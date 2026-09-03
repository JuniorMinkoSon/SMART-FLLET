import { FormEvent, useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { useMissionWorkflow } from '@/hooks/useMissionWorkflow'
import { Drawer, EmptyState } from '@/components/ui'
import { formatFCFA, formatNumber } from '@/utils/format'

export function Carburant() {
  const { fuelEntries, vehicles, missions } = useFleetStore()
  const { recordFuel } = useMissionWorkflow()
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', liters: '', amount: '', station: '', km: '' })

  const totalLiters = fuelEntries.reduce((s, f) => s + f.liters, 0)
  const totalAmount = fuelEntries.reduce((s, f) => s + f.amount, 0)

  const consumptionPerHour = (types: string[]) => {
    let liters = 0
    let hours = 0
    missions.forEach((m) => {
      const v = vehicles.find((x) => x.id === m.vehicleId)
      if (!v || !types.includes(v.type) || !m.departure || !m.arrival) return
      liters += fuelEntries.filter((f) => f.missionId === m.id).reduce((s, f) => s + f.liters, 0)
      hours += m.arrival.engineHours - m.departure.engineHours
    })
    return hours > 0 && liters > 0 ? `${(liters / hours).toFixed(1)} L/h` : '—'
  }

  const consumptionPer100km = (types: string[]) => {
    let liters = 0
    let km = 0
    missions.forEach((m) => {
      const v = vehicles.find((x) => x.id === m.vehicleId)
      if (!v || !types.includes(v.type) || !m.departure || !m.arrival) return
      liters += fuelEntries.filter((f) => f.missionId === m.id).reduce((s, f) => s + f.liters, 0)
      km += m.arrival.km - m.departure.km
    })
    return km > 0 && liters > 0 ? `${((liters / km) * 100).toFixed(0)} L/100 km` : '—'
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      const activeMission = missions.find(
        (m) => m.vehicleId === form.vehicleId && m.status !== 'cloturee'
      )
      recordFuel({
        vehicleId: form.vehicleId,
        missionId: activeMission?.id,
        liters: Number(form.liters),
        amount: Number(form.amount),
        station: form.station || undefined,
        km: form.km ? Number(form.km) : undefined,
        date: new Date().toISOString().slice(0, 10),
      })
      setAddOpen(false)
      setForm({ vehicleId: '', liters: '', amount: '', station: '', km: '' })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Carburant</h1>
          <p className="page-subtitle">Suivi des ravitaillements du mois</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Ravitaillement
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--red)', padding: 12, marginBottom: 16 }}>
          <strong style={{ color: 'var(--red)' }}>Erreur :</strong> {error}
        </div>
      )}

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-value">{formatNumber(totalLiters)} L</div>
          <div className="kpi-label">Volume ce mois</div>
        </div>
        <div className="card">
          <div className="kpi-value">{formatFCFA(totalAmount)}</div>
          <div className="kpi-label">Coût ce mois</div>
        </div>
        <div className="card">
          <div className="kpi-value">{consumptionPerHour(['Pelle', 'Bulldozer', 'Grue', 'Compacteur', 'Niveleuse'])}</div>
          <div className="kpi-label">Conso réelle engins (L/h)</div>
        </div>
        <div className="card">
          <div className="kpi-value">{consumptionPer100km(['Camion'])}</div>
          <div className="kpi-label">Conso réelle camions</div>
        </div>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        {fuelEntries.length === 0 ? (
          <EmptyState title="Aucun ravitaillement" message="Enregistrez un ravitaillement pour suivre la consommation." />
        ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Engin</th>
              <th>Mission</th>
              <th>Station</th>
              <th>Compteur</th>
              <th>Volume</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {fuelEntries.map((f) => {
              const v = vehicles.find((x) => x.id === f.vehicleId)
              const m = missions.find((x) => x.id === f.missionId)
              return (
                <tr key={f.id}>
                  <td>{f.date}</td>
                  <td className="strong">{v?.code}</td>
                  <td>{m ? m.code : '—'}</td>
                  <td>{f.station ?? '—'}</td>
                  <td>{f.km ? `${formatNumber(f.km)} km` : '—'}</td>
                  <td>{f.liters} L</td>
                  <td>{formatFCFA(f.amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>

      <Drawer open={addOpen} title="Nouveau ravitaillement" onClose={() => setAddOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="fuel-vehicle">Engin</label>
            <select
              id="fuel-vehicle"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              required
            >
              <option value="">Sélectionner…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} — {v.type}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="fuel-liters">Volume (litres)</label>
            <input
              id="fuel-liters"
              type="number"
              min="0"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="fuel-amount">Montant (FCFA)</label>
            <input
              id="fuel-amount"
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="fuel-station">Station</label>
            <input
              id="fuel-station"
              value={form.station}
              onChange={(e) => setForm({ ...form, station: e.target.value })}
              placeholder="Total Marcory"
            />
          </div>
          <div className="field">
            <label htmlFor="fuel-km">Kilométrage au ravitaillement</label>
            <input
              id="fuel-km"
              type="number"
              min="0"
              value={form.km}
              onChange={(e) => setForm({ ...form, km: e.target.value })}
            />
          </div>
          <p className="muted small">
            Le ravitaillement sera rattaché automatiquement à la mission active de l'engin.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
