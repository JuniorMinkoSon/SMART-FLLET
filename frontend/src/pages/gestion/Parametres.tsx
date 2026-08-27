import { useAuthStore } from '@/store/authStore'
import { VEHICLE_STATUS_LABELS, VehicleStatus } from '@/types'

const STATUS_ORDER: VehicleStatus[] = [
  'disponible',
  'affecte',
  'en_mission',
  'en_retour',
  'controle',
  'maintenance',
  'panne',
]

export function Parametres() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Profil et configuration de l'application</p>
        </div>
      </div>

      <div className="card section">
        <div className="card-title">Mon profil</div>
        <div className="stat-row">
          <span className="muted">Nom</span>
          <strong>{user?.name}</strong>
        </div>
        <div className="stat-row">
          <span className="muted">Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="stat-row">
          <span className="muted">Rôle</span>
          <span>
            {user?.role === 'admin'
              ? 'Administrateur'
              : user?.role === 'gestionnaire'
                ? 'Gestionnaire de flotte'
                : 'Conducteur'}
          </span>
        </div>
      </div>

      <div className="card section">
        <div className="card-title">Statuts des engins</div>
        {STATUS_ORDER.map((s) => (
          <div className="stat-row" key={s}>
            <span className={`badge badge-${s}`}>
              <span className="dot" />
              {VEHICLE_STATUS_LABELS[s]}
            </span>
            <span className="muted small">
              {
                {
                  disponible: 'Engin prêt à être affecté',
                  affecte: 'Affecté à une mission, départ non confirmé',
                  en_mission: 'En exploitation sur chantier',
                  en_retour: 'Retour de mission en cours',
                  controle: 'Retour en attente de contrôle',
                  maintenance: 'En intervention de maintenance',
                  panne: 'Immobilisé suite à une panne',
                }[s]
              }
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Application</div>
        <div className="stat-row">
          <span className="muted">Version</span>
          <span>Smart Fleet — Phase 1 (MVP)</span>
        </div>
        <div className="stat-row">
          <span className="muted">Devise</span>
          <span>FCFA</span>
        </div>
      </div>
    </div>
  )
}
