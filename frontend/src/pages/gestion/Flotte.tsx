import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiStore } from '@/store/apiStore'
import { Drawer, StatusBadge } from '@/components/ui'

interface Vehicle {
  id: number
  code: string
  type: string
  name: string
  plate: string
  status: string
  km: number
  engine_hours: number
  fuel_level: number
}

export function Flotte() {
  const { fetch } = useApiStore()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'Pelle', name: '', plate: '' })

  // Load vehicles from API
  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const data = await fetch('/vehicles')
      setVehicles(data)
    } catch (err) {
      console.error('Erreur chargement:', err)
    }
  }

  const types = useMemo(() => Array.from(new Set(vehicles.map((v) => v.type))), [vehicles])

  const filtered = vehicles.filter((v) => {
    if (search && !`${v.code} ${v.name} ${v.type}`.toLowerCase().includes(search.toLowerCase()))
      return false
    if (typeFilter && v.type !== typeFilter) return false
    if (statusFilter && v.status !== statusFilter) return false
    return true
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          name: form.name,
          plate: form.plate,
        }),
      })
      setAddOpen(false)
      setForm({ code: '', type: 'Pelle', name: '', plate: '' })
      loadVehicles()
    } catch (err) {
      console.error('Erreur création:', err)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Flotte</h1>
          <p className="page-subtitle">{vehicles.length} engins</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Ajouter un engin
        </button>
      </div>

      <div className="filters">
        <input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Type</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Statut</option>
          <option value="disponible">Disponible</option>
          <option value="affecte">Affecté</option>
          <option value="en_mission">En mission</option>
          <option value="en_retour">En retour</option>
          <option value="controle">Contrôle</option>
          <option value="maintenance">Maintenance</option>
          <option value="panne">Panne</option>
        </select>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Chantier</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="clickable" onClick={() => navigate(`/flotte/${v.id}`)}>
                <td className="strong">{v.code}</td>
                <td>{v.type}</td>
                <td>—</td>
                <td>
                  <StatusBadge status={v.status as any} />
                </td>
                <td>
                  <button
                    className="link-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/flotte/${v.id}`)
                    }}
                  >
                    Voir →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer
        open={addOpen}
        title="Ajouter un engin"
        onClose={() => setAddOpen(false)}
      >
        <form onSubmit={submit}>
          <div className="field">
            <label>Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="P-011"
              required
            />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['Pelle', 'Bulldozer', 'Niveleuse', 'Camion', 'Grue', 'Compacteur'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Désignation</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Pelle hydraulique"
              required
            />
          </div>
          <div className="field">
            <label>Immatriculation</label>
            <input
              value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value })}
              placeholder="CM-0000-XX"
              required
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
