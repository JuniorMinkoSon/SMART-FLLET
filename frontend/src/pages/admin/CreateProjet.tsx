import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateProjet.css'

interface ProjetForm {
  nom: string
  client: string
  localisation: string
  dateDebut: string
  dateFin: string
  chefProjet: string
  engins: string[]
}

export function CreateProjet() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ProjetForm>({
    nom: '',
    client: '',
    localisation: '',
    dateDebut: '',
    dateFin: '',
    chefProjet: '',
    engins: []
  })

  const [engins] = useState([
    { id: '1', code: 'ENG-001', nom: 'CAT 320D', disponible: true },
    { id: '2', code: 'ENG-002', nom: 'CAT 336', disponible: true },
    { id: '3', code: 'ENG-003', nom: 'VOLVO A40', disponible: false },
    { id: '4', code: 'ENG-004', nom: 'D6 Bulldozer', disponible: true }
  ])

  const [chefs] = useState([
    { id: '1', nom: 'MINKO SON JUNIOR' },
    { id: '2', nom: 'JEAN KOUASSI' },
    { id: '3', nom: 'MARIE DUPONT' }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleEngin = (enginId: string) => {
    setForm(prev => ({
      ...prev,
      engins: prev.engins.includes(enginId)
        ? prev.engins.filter(id => id !== enginId)
        : [...prev.engins, enginId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        navigate('/admin')
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  return (
    <div className="create-projet-container">
      <div className="create-header">
        <button onClick={() => navigate('/admin')} className="btn-back-icon">
          ← Retour
        </button>
        <h1>Créer un nouveau projet</h1>
        <div className="step-bar">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`step-bar-item ${s === step ? 'active' : ''} ${s < step ? 'done' : ''}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step">
            <h2>Informations du chantier</h2>

            <div className="form-group">
              <label>Nom du projet</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleInputChange}
                placeholder="Construction Autoroute Abidjan-Yamoussoukro"
                required
              />
            </div>

            <div className="form-group">
              <label>Client</label>
              <input
                type="text"
                name="client"
                value={form.client}
                onChange={handleInputChange}
                placeholder="Ministère des Transports"
                required
              />
            </div>

            <div className="form-group">
              <label>Localisation</label>
              <input
                type="text"
                name="localisation"
                value={form.localisation}
                onChange={handleInputChange}
                placeholder="Axe Abidjan-Yamoussoukro"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date de début</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={form.dateDebut}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date de fin prévue</label>
                <input
                  type="date"
                  name="dateFin"
                  value={form.dateFin}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="button" onClick={() => setStep(2)} className="btn-primary">
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Chef de projet</h2>

            <div className="form-group">
              <label>Sélectionner le chef de projet</label>
              <select
                name="chefProjet"
                value={form.chefProjet}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Choisir un chef --</option>
                {chefs.map(chef => (
                  <option key={chef.id} value={chef.id}>
                    {chef.nom}
                  </option>
                ))}
              </select>
            </div>

            {form.chefProjet && (
              <div className="selection-display">
                <span className="check">✓</span>
                <span>{chefs.find(c => c.id === form.chefProjet)?.nom}</span>
              </div>
            )}

            <div className="button-group">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                Retour
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary" disabled={!form.chefProjet}>
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Engins disponibles</h2>

            <div className="engins-grid">
              {engins.map(engin => (
                <div
                  key={engin.id}
                  className={`engin-card ${!engin.disponible ? 'disabled' : ''} ${form.engins.includes(engin.id) ? 'selected' : ''}`}
                  onClick={() => engin.disponible && toggleEngin(engin.id)}
                >
                  <input
                    type="checkbox"
                    checked={form.engins.includes(engin.id)}
                    onChange={() => engin.disponible && toggleEngin(engin.id)}
                    disabled={!engin.disponible}
                  />
                  <div className="engin-info">
                    <div className="engin-code">{engin.code}</div>
                    <div className="engin-name">{engin.nom}</div>
                  </div>
                  <div className={`engin-status ${engin.disponible ? 'available' : 'unavailable'}`}>
                    {engin.disponible ? '🟢 Disponible' : '🔴 Indisponible'}
                  </div>
                </div>
              ))}
            </div>

            <div className="selection-summary">
              <span className="label">{form.engins.length} engin(s) sélectionné(s)</span>
            </div>

            <div className="button-group">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                Retour
              </button>
              <button type="button" onClick={() => setStep(4)} className="btn-primary" disabled={form.engins.length === 0}>
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-step">
            <h2>Récapitulatif</h2>

            <div className="recap">
              <div className="recap-section">
                <h3>Chantier</h3>
                <div className="recap-item">
                  <span className="label">Nom :</span>
                  <span className="value">{form.nom}</span>
                </div>
                <div className="recap-item">
                  <span className="label">Client :</span>
                  <span className="value">{form.client}</span>
                </div>
                <div className="recap-item">
                  <span className="label">Localisation :</span>
                  <span className="value">{form.localisation}</span>
                </div>
                <div className="recap-item">
                  <span className="label">Période :</span>
                  <span className="value">{form.dateDebut} au {form.dateFin}</span>
                </div>
              </div>

              <div className="recap-section">
                <h3>Chef de projet</h3>
                <div className="recap-item">
                  <span className="value">{chefs.find(c => c.id === form.chefProjet)?.nom}</span>
                </div>
              </div>

              <div className="recap-section">
                <h3>Engins affectés ({form.engins.length})</h3>
                {form.engins.map(enginId => {
                  const engin = engins.find(e => e.id === enginId)
                  return (
                    <div key={enginId} className="recap-item">
                      <span className="value">{engin?.code} - {engin?.nom}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                Retour
              </button>
              <button type="submit" className="btn-success">
                Créer le projet
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
