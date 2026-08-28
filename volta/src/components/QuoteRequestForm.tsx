import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Card, Toast } from './ui'

interface QuoteRequestFormProps {
  equipmentId: string
  equipmentName: string
  onSuccess?: (reference: string) => void
  onClose?: () => void
  autoClose?: boolean
}

export default function QuoteRequestForm({
  equipmentId,
  equipmentName,
  onSuccess,
  onClose,
  autoClose = true,
}: QuoteRequestFormProps) {
  const { createQuoteRequest, equipment } = useStore()
  const [toast, setToast] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    clientName: '',
    clientCompany: '',
    clientPhone: '',
    clientEmail: '',
    duration: '',
    requestedDate: '',
    location: '',
    message: '',
  })

  const eq = equipment.find((e) => e.id === equipmentId)
  if (!eq) return null

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!form.clientName.trim()) {
      setToast('⚠️ Veuillez entrer votre nom')
      return
    }
    if (!form.clientPhone.trim()) {
      setToast('⚠️ Veuillez entrer votre téléphone')
      return
    }
    if (!form.clientEmail.trim()) {
      setToast('⚠️ Veuillez entrer votre email')
      return
    }

    setSending(true)

    // Simulate API delay
    setTimeout(() => {
      try {
        const quote = createQuoteRequest({
          clientName: form.clientName,
          clientCompany: form.clientCompany,
          clientPhone: form.clientPhone,
          clientEmail: form.clientEmail,
          duration: form.duration,
          requestedDate: form.requestedDate,
          location: form.location,
          message: form.message,
          equipmentId,
          supplierId: eq.supplierId,
        })

        const msg = `✓ Devis ${quote.reference} créé ! Le fournisseur vous contactera très bientôt.`
        setToast(msg)
        setSending(false)

        // Reset form
        setForm({
          clientName: '',
          clientCompany: '',
          clientPhone: '',
          clientEmail: '',
          duration: '',
          requestedDate: '',
          location: '',
          message: '',
        })

        onSuccess?.(quote.reference)

        if (autoClose && onClose) {
          setTimeout(() => onClose(), 2000)
        }
      } catch (error) {
        setToast('❌ Une erreur s\'est produite')
        setSending(false)
      }
    }, 600)
  }

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
  const labelClass = 'block text-xs font-semibold text-slate-900 mb-1.5'

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment Info */}
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="text-sm">
            <span className="font-semibold text-slate-900">Équipement:</span>
            <span className="text-slate-700 ml-2">{equipmentName}</span>
          </div>
        </Card>

        {/* Client Info Section */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">📋 Vos informations</h3>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nom *</label>
              <input
                type="text"
                required
                value={form.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                className={inputClass}
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className={labelClass}>Entreprise</label>
              <input
                type="text"
                value={form.clientCompany}
                onChange={(e) => handleChange('clientCompany', e.target.value)}
                className={inputClass}
                placeholder="Acme Corporation"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={form.clientPhone}
                  onChange={(e) => handleChange('clientPhone', e.target.value)}
                  className={inputClass}
                  placeholder="+225 07 XX XX XX"
                />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  required
                  value={form.clientEmail}
                  onChange={(e) => handleChange('clientEmail', e.target.value)}
                  className={inputClass}
                  placeholder="contact@acme.ci"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Details Section */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">🏗️ Détails du projet</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Durée souhaitée</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className={inputClass}
                  placeholder="ex: 5 jours"
                />
              </div>
              <div>
                <label className={labelClass}>Date souhaitée</label>
                <input
                  type="date"
                  value={form.requestedDate}
                  onChange={(e) => handleChange('requestedDate', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Localisation du chantier</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={inputClass}
                placeholder="ex: Abidjan Nord"
              />
            </div>

            <div>
              <label className={labelClass}>Message / Besoin particulier</label>
              <textarea
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className={inputClass}
                placeholder="Décrivez votre besoin spécifique..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={sending}
          className="w-full py-2.5 rounded-lg text-white font-bold transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          style={{ backgroundColor: '#FF8C00' }}
        >
          {sending ? (
            <>⏳ Envoi en cours...</>
          ) : (
            <>✓ Envoyer ma demande de devis</>
          )}
        </button>
      </form>

      <Toast message={toast} />
    </>
  )
}
