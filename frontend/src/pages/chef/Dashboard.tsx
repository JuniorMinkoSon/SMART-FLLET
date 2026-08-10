import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import './Dashboard.css'

export function ChefProjetDashboard() {
  const { engins, projets, fetchEngins, fetchProjets } = useFleetStore()
  const [selectedProjet, setSelectedProjet] = useState(projets[0])

  useEffect(() => {
    fetchEngins()
    fetchProjets()
  }, [])

  const projet = selectedProjet || projets[0]

  if (!projet) {
    return (
      <div className="chef-dashboard">
        <div className="empty-state">
          <h2>Aucun projet assigné</h2>
          <p>Vous n'avez actuellement aucun chantier assigné.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chef-dashboard">
      <div className="dashboard-header">
        <h1>Chantier — {projet.nom}</h1>
        <select
          value={projet.id}
          onChange={(e) => {
            const p = projets.find(pj => pj.id === e.target.value)
            if (p) setSelectedProjet(p)
          }}
          className="projet-select"
        >
          {projets.map(p => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </select>
      </div>

      <div className="projet-info">
        <div className="info-item">
          <span className="label">Client</span>
          <span className="value">{projet.client}</span>
        </div>
        <div className="info-item">
          <span className="label">Localisation</span>
          <span className="value">{projet.localisation}</span>
        </div>
        <div className="info-item">
          <span className="label">Période</span>
          <span className="value">
            {new Date(projet.dateDebut).toLocaleDateString('fr-FR')} - {new Date(projet.dateFin).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>

      <div className="progression-section">
        <h2>Progression</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '78%' }}></div>
        </div>
        <div className="progress-text">78% complété</div>
      </div>

      <div className="engins-section">
        <h2>Engins du chantier</h2>
        <div className="engins-table">
          <div className="table-header">
            <div className="col-engin">Engin</div>
            <div className="col-status">Statut</div>
            <div className="col-operateur">Opérateur</div>
            <div className="col-km">KM</div>
            <div className="col-action">Action</div>
          </div>

          {projet.engins.map(engin => (
            <div key={engin.id} className="table-row">
              <div className="col-engin">
                <div className="engin-code">{engin.code}</div>
                <div className="engin-name">{engin.nom}</div>
              </div>
              <div className="col-status">
                {engin.status === 'en_chantier' && <span className="status-badge status-active">🟢 En service</span>}
                {engin.status === 'en_panne' && <span className="status-badge status-down">🔴 En panne</span>}
                {engin.status === 'stand_by' && <span className="status-badge status-standby">⚪ Stand-by</span>}
              </div>
              <div className="col-operateur">Jean Kouassi</div>
              <div className="col-km">{engin.km} km</div>
              <div className="col-action">
                <Link to={`/chef/engins/${engin.id}`} className="btn-mini">
                  Voir
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-box">
          <div className="stat-number">{projet.engins.length}</div>
          <div className="stat-text">Engins total</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{projet.engins.filter(e => e.status === 'en_chantier').length}</div>
          <div className="stat-text">Actifs</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{projet.engins.filter(e => e.status === 'en_panne').length}</div>
          <div className="stat-text">En panne</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{projet.engins.filter(e => e.status === 'stand_by').length}</div>
          <div className="stat-text">Stand-by</div>
        </div>
      </div>

      <div className="actions-section">
        <h2>Actions</h2>
        <div className="actions-grid">
          <Link to={`/chef/incidents`} className="action-link">
            📋 Rapports incidents
          </Link>
          <Link to={`/chef/validation`} className="action-link">
            ✓ Valider rapports
          </Link>
          <Link to={`/chef/maintenance`} className="action-link">
            🔧 Planifier maintenance
          </Link>
          <Link to={`/chef/exportation`} className="action-link">
            📊 Exporter données
          </Link>
        </div>
      </div>
    </div>
  )
}
