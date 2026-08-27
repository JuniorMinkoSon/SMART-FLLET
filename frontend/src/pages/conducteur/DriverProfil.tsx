import { useNavigate } from 'react-router-dom'
import { DriverLayout } from './DriverLayout'
import { useDriverData } from './useDriverData'
import { useAuthStore } from '@/store/authStore'

export function DriverProfil() {
  const { user, driver } = useDriverData()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <DriverLayout title="Profil">
      <div className="card">
        <div className="stat-row">
          <span className="muted">Nom</span>
          <strong>{driver?.name ?? user?.name}</strong>
        </div>
        <div className="stat-row">
          <span className="muted">Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="stat-row">
          <span className="muted">Téléphone</span>
          <span>{driver?.phone ?? '—'}</span>
        </div>
        <div className="stat-row">
          <span className="muted">Permis</span>
          <span>{driver?.license ?? '—'}</span>
        </div>
        <div className="stat-row">
          <span className="muted">Compétences</span>
          <span>{driver?.skills.join(', ') ?? '—'}</span>
        </div>
      </div>
      <button
        className="btn btn-secondary btn-block"
        onClick={() => {
          logout()
          navigate('/login')
        }}
      >
        Déconnexion
      </button>
    </DriverLayout>
  )
}
