import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import { Drawer, EmptyState, StatusBadge } from '@/components/ui'
import { Vehicle } from '@/types'

export function Flotte() {
  const { vehicles, addVehicle } = useFleetStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const [form, setForm] = useState({ code: '', type: 'Pelle', name: '', plate: '' })

  const types = useMemo(() => Array.from(new Set(vehicles.map((v) => v.type))), [vehicles])

  const filtered = vehicles.filter((v) => {
    if (search && !`${v.code} ${v.name} ${v.type}`.toLowerCase().includes(search.toLowerCase()))
      return false
    if (typeFilter && v.type !== typeFilter) return false
    if (statusFilter && v.status !== statusFilter) return false
    if (ownerFilter === 'externe' && !v.external) return false
    if (ownerFilter === 'interne' && v.external) return false
    return true
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const vehicle: Omit<Vehicle, 'id'> = {
      code: form.code,
      type: form.type,
      name: form.name,
      plate: form.plate,
      status: 'disponible',
      km: 0,
      engineHours: 0,
      fuelLevel: 100,
      condition: 'Bon',
    }
    addVehicle(vehicle)
    setAddOpen(false)
    setForm({ code: '', type: 'Pelle', name: '', plate: '' })
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
          <option value="reserve">Réservé</option>
          <option value="en_mission">En mission</option>
          <option value="controle">Contrôle</option>
          <option value="maintenance">Maintenance</option>
          <option value="hors_service">Hors service</option>
        </select>
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
          <option value="">Interne / Externe</option>
          <option value="interne">Interne</option>
          <option value="externe">Externe</option>
        </select>
      </div>

      <div className="card table-wrap" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="Aucun engin"
            message={
              vehicles.length === 0
                ? "La flotte est vide. Ajoutez un premier engin pour commencer."
                : 'Aucun engin ne correspond à vos filtres.'
            }
          />
        ) : (
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
                <td>
                  {v.type}
                  {v.external && <span className="muted small"> (externe)</span>}
                </td>
                <td>{v.site ?? '—'}</td>
                <td>
                  <StatusBadge status={v.status} />
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
        )}
      </div>

      <Drawer
        open={addOpen}
        title="Ajouter un engin"
        onClose={() => setAddOpen(false)}
      >
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="veh-code">Code</label>
            <input
              id="veh-code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="P-011"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="veh-type">Type</label>
            <select
              id="veh-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {['Pelle', 'Bulldozer', 'Niveleuse', 'Camion', 'Grue', 'Compacteur'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="veh-name">Désignation</label>
            <input
              id="veh-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Pelle hydraulique"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="veh-plate">Immatriculation</label>
            <input
              id="veh-plate"
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
