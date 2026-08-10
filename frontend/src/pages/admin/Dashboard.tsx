import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFleetStore } from '@/store/fleetStore'
import { StatCard } from '@/components/StatCard'
import { AlertBanner } from '@/components/AlertBanner'
import './Dashboard.css'

export function AdminDashboard() {
  const { engins, projets, alertes, fetchEngins, fetchProjets, fetchAlertes, getStatistiques } = useFleetStore()
  const [stats, setStats] = useState({
    totalEngins: 0,
    enDisponibilite: 0,
    enChantier: 0,
    enPanne: 0,
    locationExterne: 0
  })

  useEffect(() => {
    fetchEngins()
    fetchProjets()
    fetchAlertes()
  }, [])

  useEffect(() => {
    setStats(getStatistiques())
  }, [engins])

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord administrateur</h1>
        <Link to="/admin/nouveau-projet" className="btn-primary">
          + Créer un projet
        </Link>
      </div>

      <div className="alertes-section">
        {alertes.slice(0, 3).map((alerte) => (
          <AlertBanner
            key={alerte.id}
            type={alerte.severite === 'urgent' ? 'error' : 'warning'}
            title={alerte.type}
            message={alerte.message}
          />
        ))}
      </div>

      <div className="stats-grid">
        <StatCard label="Total engins" value={stats.totalEngins} icon="🚜" />
        <StatCard label="Disponibles" value={stats.enDisponibilite} icon="🟢" color="success" />
        <StatCard label="En chantier" value={stats.enChantier} icon="🔵" />
        <StatCard label="En panne" value={stats.enPanne} icon="🔴" color="danger" />
        <StatCard label="Location externe" value={stats.locationExterne} icon="🟡" color="warning" />
      </div>

      <div className="dashboard-content">
        <div className="section">
          <h2>Projets actifs ({projets.filter(p => p.statut === 'en_cours').length})</h2>
          <div className="projects-grid">
            {projets.filter(p => p.statut === 'en_cours').map(projet => (
              <Link key={projet.id} to={`/admin/projets/${projet.id}`} className="project-card">
                <div className="project-name">{projet.nom}</div>
                <div className="project-meta">
                  <span>{projet.engins.length} engins</span>
                  <span>{projet.chefProjet}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Engins en panne</h2>
          <div className="engins-list">
            {engins.filter(e => e.status === 'en_panne').map(engin => (
              <div key={engin.id} className="engin-item">
                <div className="engin-code">{engin.code}</div>
                <div className="engin-details">
                  <div>{engin.nom}</div>
                  <div className="engin-type">{engin.type}</div>
                </div>
                <Link to={`/admin/engins/${engin.id}`} className="btn-small">
                  Détails
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
