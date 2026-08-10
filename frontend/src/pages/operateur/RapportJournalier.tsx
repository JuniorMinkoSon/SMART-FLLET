import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './RapportJournalier.css'

interface RapportForm {
  km: number
  kmPrecedent: number
  carburant: number
  montantCarburant: number
  station: string
  etat: 'en_service' | 'en_panne' | 'stand_by'
  preuve?: File
}

export function RapportJournalier() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<RapportForm>({
    km: 12483,
    kmPrecedent: 12421,
    carburant: 85,
    montantCarburant: 65000,
    station: '',
    etat: 'en_service'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'carburant' || name === 'montantCarburant' || name === 'km' ? parseFloat(value) : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm(prev => ({ ...prev, preuve: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/rapports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        setStep(5)
        setTimeout(() => navigate('/operateur'), 2000)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
    }
  }

  const distanceParcourue = form.km - form.kmPrecedent

  return (
    <div className="rapport-container">
      <div className="rapport-header">
        <h1>Rapport journalier</h1>
        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`step ${s === step ? 'active' : ''} ${s < step ? 'done' : ''}`}>
              {s < step ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="step-content">
            <h2>Kilométrage</h2>
            <div className="form-group">
              <label>Date</label>
              <div className="input-display">
                {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="form-group">
              <label>Kilométrage actuel</label>
              <input
                type="number"
                name="km"
                value={form.km}
                onChange={handleInputChange}
                placeholder="12483"
              />
            </div>

            <div className="form-group">
              <label>Kilométrage précédent</label>
              <div className="input-display">{form.kmPrecedent} km</div>
            </div>

            <div className="distance-info">
              <span className="label">Distance parcourue</span>
              <span className="value">{distanceParcourue} km</span>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-next"
            >
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Carburant</h2>
            <div className="form-group">
              <label>Quantité ajoutée</label>
              <input
                type="number"
                name="carburant"
                value={form.carburant}
                onChange={handleInputChange}
                placeholder="85"
              />
              <span className="unit">L</span>
            </div>

            <div className="form-group">
              <label>Montant</label>
              <input
                type="number"
                name="montantCarburant"
                value={form.montantCarburant}
                onChange={handleInputChange}
                placeholder="65000"
              />
              <span className="unit">FCFA</span>
            </div>

            <div className="form-group">
              <label>Station</label>
              <input
                type="text"
                name="station"
                value={form.station}
                onChange={handleInputChange}
                placeholder="Shell Abidjan"
              />
            </div>

            <div className="button-group">
              <button type="button" onClick={() => setStep(1)} className="btn-back">
                Retour
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-next">
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2>État de l'engin</h2>
            <div className="state-buttons">
              <button
                type="button"
                className={`state-btn ${form.etat === 'en_service' ? 'active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, etat: 'en_service' }))}
              >
                <span className="icon">🟢</span>
                <span>En service</span>
              </button>
              <button
                type="button"
                className={`state-btn ${form.etat === 'en_panne' ? 'active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, etat: 'en_panne' }))}
              >
                <span className="icon">🔴</span>
                <span>En panne</span>
              </button>
              <button
                type="button"
                className={`state-btn ${form.etat === 'stand_by' ? 'active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, etat: 'stand_by' }))}
              >
                <span className="icon">⚪</span>
                <span>Stand-by</span>
              </button>
            </div>

            <div className="button-group">
              <button type="button" onClick={() => setStep(2)} className="btn-back">
                Retour
              </button>
              <button type="button" onClick={() => setStep(4)} className="btn-next">
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2>Récapitulatif</h2>
            <div className="recap">
              <div className="recap-item">
                <span className="label">Kilométrage</span>
                <span className="value">{form.km} km</span>
              </div>
              <div className="recap-item">
                <span className="label">Distance</span>
                <span className="value">{distanceParcourue} km</span>
              </div>
              <div className="recap-item">
                <span className="label">Carburant</span>
                <span className="value">{form.carburant} L</span>
              </div>
              <div className="recap-item">
                <span className="label">Montant</span>
                <span className="value">{form.montantCarburant} FCFA</span>
              </div>
              <div className="recap-item">
                <span className="label">Station</span>
                <span className="value">{form.station || '-'}</span>
              </div>
              <div className="recap-item">
                <span className="label">État</span>
                <span className="value">{form.etat}</span>
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={() => setStep(3)} className="btn-back">
                Retour
              </button>
              <button type="submit" className="btn-submit">
                Envoyer rapport
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content success">
            <div className="success-icon">✓</div>
            <h2>Rapport transmis</h2>
            <p>Votre rapport journalier a été enregistré avec succès.</p>
            <div className="report-id">
              Rapport #RP-{new Date().toISOString().split('T')[0].replace(/-/g, '')}
            </div>
            <p className="redirect-message">Redirection en cours...</p>
          </div>
        )}
      </form>
    </div>
  )
}
