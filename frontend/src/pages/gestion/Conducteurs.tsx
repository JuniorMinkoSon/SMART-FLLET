import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useApiStore } from '@/store/apiStore'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer, DriverBadge, EmptyState } from '@/components/ui'
import type { Driver } from '@/types'

export function Conducteurs() {
  const { fetch } = useApiStore()
  const storeDrivers = useFleetStore((s) => s.drivers)
  const [drivers, setDrivers] = useState<Driver[]>(storeDrivers)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', matricule: '', phone: '' })

  const loadDrivers = useCallback(async () => {
    try {
      const data = await fetch('/drivers')
      setDrivers(data)
    } catch {
      setDrivers(useFleetStore.getState().drivers)
    }
  }, [fetch])

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/drivers', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          matricule: form.matricule,
          phone: form.phone,
        }),
      })
      setAddOpen(false)
      setForm({ name: '', matricule: '', phone: '' })
      loadDrivers()
    } catch (err) {
      console.error('Erreur création:', err)
    }
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
        {drivers.length === 0 ? (
          <EmptyState title="Aucun conducteur" message="Ajoutez un conducteur pour commencer." />
        ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Matricule</th>
              <th>Téléphone</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td className="strong">{d.name}</td>
                <td>{d.matricule}</td>
                <td>{d.phone}</td>
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
