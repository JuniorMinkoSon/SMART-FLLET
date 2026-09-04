import { useEffect, useState } from 'react'
import { useApiStore } from '@/store/apiStore'
import { Loader, EmptyState, ErrorState } from '@/components/ui'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire de flotte',
  conducteur: 'Conducteur',
}

interface AccountRow {
  id: string
  name: string
  email: string
  role: string
}

export function Utilisateurs() {
  const apiFetch = useApiStore((s) => s.fetch)
  const [users, setUsers] = useState<AccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    apiFetch<AccountRow[]>('/users')
      .then((rows) => setUsers(rows ?? []))
      // Le rôle gestionnaire n'a pas accès à cette ressource : le refus du
      // serveur est affiché tel quel plutôt que traduit en liste vide, qui
      // laisserait croire qu'aucun compte n'existe.
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [apiFetch])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">Comptes et rôles de la plateforme (Phase 1 : 3 profils)</p>
        </div>
      </div>

      {loading && <Loader label="Chargement des comptes…" />}

      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          title="Aucun compte"
          message="Aucun utilisateur n'est enregistré sur la plateforme."
        />
      )}

      {!loading && !error && users.length > 0 && (
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="strong">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-affecte">
                      {ROLE_LABELS[u.role?.toLowerCase()] ?? u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card section" style={{ marginTop: 20 }}>
        <div className="card-title">Rôles et permissions</div>
        <div className="stat-row">
          <span className="strong">Administrateur</span>
          <span className="muted">Configuration, utilisateurs, accès complet</span>
        </div>
        <div className="stat-row">
          <span className="strong">Gestionnaire de flotte</span>
          <span className="muted">Pilotage : flotte, missions, contrôles, coûts, alertes</span>
        </div>
        <div className="stat-row">
          <span className="strong">Conducteur</span>
          <span className="muted">Exécution : sa mission, départ, retour, anomalies</span>
        </div>
      </div>
    </div>
  )
}
