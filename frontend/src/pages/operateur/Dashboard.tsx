import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './Dashboard.css'

interface OperateurEngin {
  id: string
  code: string
  nom: string
  status: string
  km: number
  carburant: number
}

export function OperateurDashboard() {
  const { user } = useAuthStore()
  const [engin] = useState<OperateurEngin>({
    id: '1',
    code: 'ENG-00031',
    nom: 'CAT 320D',
    status: 'en_service',
    km: 12483,
    carburant: 85
  })

  const statusIcons = {
    en_service: '🟢',
    en_panne: '🔴',
    stand_by: '⚪'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      en_service: 'En service',
      en_panne: 'En panne',
      stand_by: 'Stand-by'
    }
    return labels[status] || status
  }

  return (
    <div className="operateur-dashboard">
      <div className="operateur-header">
        <h1>Bonjour {user?.name}</h1>
      </div>

      <div className="engin-card">
        <div className="engin-card-header">
          <h2>{engin.nom}</h2>
          <span className="engin-code">{engin.code}</span>
        </div>

        <div className="engin-status">
          <span className="status-icon">{statusIcons[engin.status as keyof typeof statusIcons]}</span>
          <span className="status-label">{getStatusLabel(engin.status)}</span>
        </div>

        <div className="engin-info-row">
          <div className="info-item">
            <span className="label">Chantier</span>
            <span className="value">Autoroute A1</span>
          </div>
        </div>

        <div className="engin-metrics">
          <div className="metric">
            <div className="metric-label">Kilométrage</div>
            <div className="metric-value">{engin.km} km</div>
          </div>
          <div className="metric">
            <div className="metric-label">Carburant</div>
            <div className="metric-value">{engin.carburant} L</div>
          </div>
          <div className="metric">
            <div className="metric-label">Dernier rapport</div>
            <div className="metric-value">08:12</div>
          </div>
        </div>
      </div>

      <Link to="/operateur/rapport" className="btn-report">
        + RAPPORT JOURNALIER
      </Link>

      <div className="quick-actions">
        <h3>Actions rapides</h3>
        <div className="actions-grid">
          <Link to="/operateur/km" className="action-card">
            <span className="action-icon">📍</span>
            <span>Kilométrage</span>
          </Link>
          <Link to="/operateur/carburant" className="action-card">
            <span className="action-icon">⛽</span>
            <span>Carburant</span>
          </Link>
          <Link to="/operateur/etat" className="action-card">
            <span className="action-icon">⚙️</span>
            <span>État</span>
          </Link>
          <Link to="/operateur/preuve" className="action-card">
            <span className="action-icon">📷</span>
            <span>Preuve</span>
          </Link>
        </div>
      </div>

      <div className="rapports-list">
        <h3>Rapports récents</h3>
        <div className="report-item">
          <div className="report-date">10 août 2026</div>
          <div className="report-details">
            <span>62 km parcouris</span>
            <span className="status-ok">✓ Transmis</span>
          </div>
        </div>
        <div className="report-item">
          <div className="report-date">09 août 2026</div>
          <div className="report-details">
            <span>48 km parcouris</span>
            <span className="status-ok">✓ Transmis</span>
          </div>
        </div>
      </div>
    </div>
  )
}
