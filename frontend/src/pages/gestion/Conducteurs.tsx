import { FormEvent, useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer, DriverBadge } from '@/components/ui'

export function Conducteurs() {
  const { drivers, addDriver, vehicles } = useFleetStore()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', matricule: '', phone: '', license: 'C', skills: '' })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    addDriver({
      name: form.name,
      matricule: form.matricule,
      phone: form.phone,
      license: form.license,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status: 'disponible',
    })
    setAddOpen(false)
    setForm({ name: '', matricule: '', phone: '', license: 'C', skills: '' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conducteurs</h1>
          <p className="page-subtitle">{drivers.length} conducteurs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Ajouter un conducteur
        </button>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Matricule</th>
              <th>Téléphone</th>
              <th>Permis</th>
              <th>Compétences</th>
              <th>Engin actuel</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const v = vehicles.find((x) => x.driverId === d.id)
              return (
                <tr key={d.id}>
                  <td className="strong">{d.name}</td>
                  <td>{d.matricule}</td>
                  <td>{d.phone}</td>
                  <td>{d.license}</td>
                  <td>{d.skills.join(', ')}</td>
                  <td>{v ? `${v.code} — ${v.type}` : '—'}</td>
                  <td>
                    <DriverBadge status={d.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Drawer open={addOpen} title="Ajouter un conducteur" onClose={() => setAddOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label>Nom</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Matricule</label>
            <input
              value={form.matricule}
              onChange={(e) => setForm({ ...form, matricule: e.target.value })}
              placeholder="GS-OP-007"
              required
            />
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="field">
            <label>Permis</label>
            <select value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })}>
              <option>B</option>
              <option>C</option>
              <option>CE</option>
            </select>
          </div>
          <div className="field">
            <label>Compétences (séparées par des virgules)</label>
            <input
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="Pelle, Camion"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Créer
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
