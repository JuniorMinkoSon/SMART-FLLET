import { useEffect, useState } from 'react'
import { useFleetStore } from '@/store/fleetStore'
import { StatCard } from '@/components/StatCard'
import { AlertBanner } from '@/components/AlertBanner'
import './FleetCommand.css'

export function FleetCommand() {
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

  const criticalAlerts = alertes.filter(a => a.severite === 'urgent')

  return (
    <div className="fleet-command">
      <div className="command-header">
        <h1>Fleet Command</h1>
        <div className="date-time">
          {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="command-stats">
        <div className="stat-large">
          <div className="stat-value">{stats.totalEngins}</div>
          <div className="stat-label">ENGINS TOTAL</div>
        </div>
        <div className="stat-large">
          <div className="stat-value">{stats.enChantier}</div>
          <div className="stat-label">EN PROJET</div>
        </div>
        <div className="stat-large">
          <div className="stat-value">{stats.enDisponibilite}</div>
          <div className="stat-label">DISPONIBLES</div>
        </div>
      </div>

      <div className="command-content">
        <div className="section-left">
          <div className="section-card">
            <h2>CHANTIERS</h2>
            <div className="chantiers-list">
              {projets.filter(p => p.statut === 'en_cours').map(projet => (
                <div key={projet.id} className="chantier-row">
                  <div className="chantier-name">{projet.nom}</div>
                  <div className="chantier-engins">{projet.engins.length} engins</div>
                  <div className="chantier-actifs">
                    {projet.engins.filter(e => e.status === 'en_chantier').length} actifs
                  </div>
                  <div className="chantier-cost">
                    <span className="cost-label">Coût estimé</span>
                    <span className="cost-value">18,4 M</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <h2>ÉTAT FLOTTE</h2>
            <div className="fleet-status">
              <div className="status-item">
                <span className="status-indicator">🟢</span>
                <span className="status-name">{stats.enDisponibilite} disponibles</span>
              </div>
              <div className="status-item">
                <span className="status-indicator">🔵</span>
                <span className="status-name">{stats.enChantier} en chantier</span>
              </div>
              <div className="status-item">
                <span className="status-indicator">🟡</span>
                <span className="status-name">{stats.locationExterne} location externe</span>
              </div>
              <div className="status-item">
                <span className="status-indicator">🔴</span>
                <span className="status-name">{stats.enPanne} en panne</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-right">
          <div className="section-card alerts-section">
            <h2>ALERTES</h2>
            {criticalAlerts.length > 0 && (
              <div className="alerts-list">
                {criticalAlerts.map(alerte => (
                  <AlertBanner
                    key={alerte.id}
                    type="error"
                    title={alerte.type}
                    message={alerte.message}
                  />
                ))}
              </div>
            )}

            <div className="alert-summary">
              <div className="alert-item">
                <span className="alert-icon">🔴</span>
                <span>{stats.enPanne} engins indisponibles</span>
              </div>
              <div className="alert-item">
                <span className="alert-icon">⚠</span>
                <span>4 rapports opérateurs manquants</span>
              </div>
              <div className="alert-item">
                <span className="alert-icon">⚠</span>
                <span>3 maintenances à planifier</span>
              </div>
              <div className="alert-item">
                <span className="alert-icon">🔵</span>
                <span>2 locations externes arrivent à échéance</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>ACTIONS</h2>
            <div className="actions-list">
              <button className="action-btn">Gérer la flotte</button>
              <button className="action-btn">Voir l'amortissement</button>
              <button className="action-btn">Analyser les coûts</button>
              <button className="action-btn">Planifier maintenance</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
