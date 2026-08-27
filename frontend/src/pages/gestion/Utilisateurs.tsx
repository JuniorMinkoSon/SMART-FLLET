import { USERS } from '@/data/mockData'

const ROLE_LABELS = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire de flotte',
  conducteur: 'Conducteur',
}

export function Utilisateurs() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">Comptes et rôles de la plateforme (Phase 1 : 3 profils)</p>
        </div>
      </div>

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
            {USERS.map((u) => (
              <tr key={u.id}>
                <td className="strong">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge badge-affecte">{ROLE_LABELS[u.role]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
