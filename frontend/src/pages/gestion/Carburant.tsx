import { FormEvent, useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer } from '@/components/ui'
import { formatFCFA, formatNumber } from '@/utils/format'

export function Carburant() {
  const { fuelEntries, vehicles, missions, addFuelEntry } = useFleetStore()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', liters: '', amount: '' })

  const totalLiters = fuelEntries.reduce((s, f) => s + f.liters, 0)
  const totalAmount = fuelEntries.reduce((s, f) => s + f.amount, 0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const activeMission = missions.find(
      (m) => m.vehicleId === form.vehicleId && m.status !== 'cloturee'
    )
    addFuelEntry({
      vehicleId: form.vehicleId,
      missionId: activeMission?.id,
      liters: Number(form.liters),
      amount: Number(form.amount),
      date: new Date().toISOString().slice(0, 10),
    })
    setAddOpen(false)
    setForm({ vehicleId: '', liters: '', amount: '' })
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
          <div className="kpi-value">18 L/h</div>
          <div className="kpi-label">Conso moyenne pelles</div>
        </div>
        <div className="card">
          <div className="kpi-value">27 L/100 km</div>
          <div className="kpi-label">Conso moyenne camions</div>
        </div>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Engin</th>
              <th>Mission</th>
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
                  <td>{f.liters} L</td>
                  <td>{formatFCFA(f.amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Drawer open={addOpen} title="Nouveau ravitaillement" onClose={() => setAddOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label>Engin</label>
            <select
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              required
            >
              <option value="">Sélectionner...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} — {v.type}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Volume (litres)</label>
            <input
              type="number"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Montant (FCFA)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
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
