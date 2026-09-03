import { FormEvent, useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer, EmptyState } from '@/components/ui'
import { formatFCFA } from '@/utils/format'
import { ExpenseCategory } from '@/types'

const CATEGORIES: ExpenseCategory[] = ['Carburant', 'Maintenance', 'Péages', 'Pièces', 'Location', 'Autres']

export function Depenses() {
  const { expenses, vehicles, missions, addExpense } = useFleetStore()
  const [addOpen, setAddOpen] = useState(false)
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [form, setForm] = useState({
    vehicleId: '',
    category: 'Autres' as ExpenseCategory,
    label: '',
    amount: '',
  })

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    amount: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  }))

  const filtered = expenses.filter((e) => {
    if (vehicleFilter && e.vehicleId !== vehicleFilter) return false
    if (categoryFilter && e.category !== categoryFilter) return false
    return true
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    addExpense({
      vehicleId: form.vehicleId || undefined,
      category: form.category,
      label: form.label,
      amount: Number(form.amount),
      date: new Date().toISOString().slice(0, 10),
    })
    setAddOpen(false)
    setForm({ vehicleId: '', category: 'Autres', label: '', amount: '' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dépenses</h1>
          <p className="page-subtitle">Ce mois : {formatFCFA(total)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Ajouter dépense
        </button>
      </div>

      <div className="card section">
        <div className="card-title">Répartition par catégorie</div>
        {byCategory.map((c) => (
          <div className="stat-row" key={c.category}>
            <span>{c.category}</span>
            <strong>{formatFCFA(c.amount)}</strong>
          </div>
        ))}
      </div>

      <div className="filters">
        <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
          <option value="">Engin</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.code}
            </option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Type</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="Aucune dépense"
            message={
              expenses.length === 0
                ? 'Ajoutez une dépense pour suivre le budget.'
                : 'Aucune dépense ne correspond à vos filtres.'
            }
          />
        ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Engin</th>
              <th>Mission</th>
              <th>Type</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const v = vehicles.find((x) => x.id === e.vehicleId)
              const m = missions.find((x) => x.id === e.missionId)
              return (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td className="strong">{e.label}</td>
                  <td>{v?.code ?? '—'}</td>
                  <td>{m?.code ?? '—'}</td>
                  <td>{e.category}</td>
                  <td>{formatFCFA(e.amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>

      <Drawer open={addOpen} title="Ajouter une dépense" onClose={() => setAddOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="exp-label">Libellé</label>
            <input
              id="exp-label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="exp-category">Type</label>
            <select
              id="exp-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="exp-vehicle">Engin (optionnel)</label>
            <select
              id="exp-vehicle"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              <option value="">Aucun</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} — {v.type}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="exp-amount">Montant (FCFA)</label>
            <input
              id="exp-amount"
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
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
