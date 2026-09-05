import { FormEvent, useState } from 'react'
import { VEHICLE_TYPES } from '@/data/vehicleTypes'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer, DriverBadge, EmptyState } from '@/components/ui'

export function Conducteurs() {
  const { drivers, addDriver } = useFleetStore()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', matricule: '', phone: '', license: 'C' })
  // Types d'engins que l'opérateur est habilité à conduire. Sans au moins une
  // habilitation, il ne pourra être affecté à aucune mission — le formulaire
  // doit donc le demander, pas le supposer.
  const [categories, setCategories] = useState<string[]>([])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    addDriver({
      name: form.name,
      matricule: form.matricule,
      phone: form.phone,
      license: form.license,
      skills: categories,
      vehicleCategories: categories,
      status: 'disponible',
    })
    setAddOpen(false)
    setForm({ name: '', matricule: '', phone: '', license: 'C' })
    setCategories([])
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conducteurs</h1>
          <p className="page-subtitle">{drivers.length} conducteur(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Ajouter un conducteur
        </button>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        {drivers.length === 0 ? (
          <EmptyState title="Aucun conducteur" message="Ajoutez un conducteur pour commencer." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Téléphone</th>
                <th>Permis</th>
                <th>Engins habilités</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td className="strong">{d.name}</td>
                  <td>{d.matricule}</td>
                  <td>{d.phone}</td>
                  <td>{d.license}</td>
                  <td>
                    {d.vehicleCategories.length > 0
                      ? d.vehicleCategories.join(', ')
                      : <span className="error-text">Aucune habilitation</span>}
                  </td>
                  <td>
                    <DriverBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Drawer open={addOpen} title="Ajouter un conducteur" onClose={() => setAddOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="drv-name">Nom</label>
            <input
              id="drv-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="drv-matricule">Matricule</label>
            <input
              id="drv-matricule"
              value={form.matricule}
              onChange={(e) => setForm({ ...form, matricule: e.target.value })}
              placeholder="GS-OP-007"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="drv-phone">Téléphone</label>
            <input
              id="drv-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="drv-license">Permis</label>
            <select
              id="drv-license"
              value={form.license}
              onChange={(e) => setForm({ ...form, license: e.target.value })}
            >
              {['B', 'C', 'CE', 'D'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Engins habilités</label>
            {/* Sans habilitation, l'opérateur n'apparaît sur aucune mission :
                le champ est requis, pas optionnel. */}
            <div className="checkbox-grid">
              {VEHICLE_TYPES.map((t) => (
                <label key={t} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={categories.includes(t)}
                    onChange={(e) =>
                      setCategories((prev) =>
                        e.target.checked ? [...prev, t] : prev.filter((c) => c !== t)
                      )
                    }
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="error-text">
                Sélectionnez au moins un type d'engin : sans habilitation,
                l'opérateur ne pourra être affecté à aucune mission.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={categories.length === 0}>
              Créer
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
