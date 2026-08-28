import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, CategoryBadge, StatusBadge } from '../../components/ui'
import QuoteRequestForm from '../../components/QuoteRequestForm'

export default function EquipmentDetail() {
  const { id } = useParams()
  const { equipment, categories, users } = useStore()
  const eq = equipment.find((e) => e.id === id)
  const [modalOpen, setModalOpen] = useState(false)

  if (!eq) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12">
        <EmptyState title="Équipement introuvable" />
        <div className="mt-4 text-center">
          <Link to="/catalogue" className="font-medium text-blue-600 hover:underline">← Retour au catalogue</Link>
        </div>
      </div>
    )
  }

  const cat = categories.find((c) => c.id === eq.categoryId)
  const supplier = users.find((u) => u.id === eq.supplierId)


  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-16">
      <Link to="/catalogue" className="text-sm font-medium text-blue-600 hover:underline">← Retour au catalogue</Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="rounded-xl overflow-hidden h-80 bg-slate-100">
            <img
              src={eq.photos[0]}
              alt={eq.name}
              className="w-full h-full object-cover"
              onError={(img) => {
                (img.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22600%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2232%22 fill=%22%2364748b%22%3EÉquipement%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>
          {eq.photos.length > 1 && (
            <div className="mt-3 flex gap-2">
              {eq.photos.map((p, i) => (
                <img key={i} src={p} alt="" className="h-16 w-20 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-900">{eq.name}</h1>
            <p className="text-sm text-slate-600 mt-2">
              {cat?.name} • {eq.brand} {eq.model} • {eq.year}
            </p>
          </div>

          {/* Badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge status={eq.status} />
            {eq.category && <CategoryBadge category={eq.category} />}
          </div>

          {/* Description */}
          <p className="text-slate-700 mb-6">{eq.description}</p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="p-3">
              <div className="text-xs text-slate-600">Localisation</div>
              <div className="font-semibold text-slate-900">📍 {eq.location}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-slate-600">Année</div>
              <div className="font-semibold text-slate-900">{eq.year}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-slate-600">Compteur</div>
              <div className="font-semibold text-slate-900">{eq.hours.toLocaleString('fr-FR')} h</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-slate-600">État</div>
              <div className="font-semibold text-slate-900">{eq.declaredCondition}</div>
            </Card>
          </div>

          {/* Supplier Info */}
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="text-sm font-semibold text-slate-900">Fournisseur</div>
            <div className="text-slate-700 mt-2">
              <div className="font-semibold">{supplier?.company}</div>
              <div className="text-sm mt-1">📞 {supplier?.phone}</div>
              <div className="text-sm">📧 {supplier?.email}</div>
            </div>
          </Card>

          {/* CTA Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3 rounded-lg text-white font-bold transition transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#FF8C00' }}
          >
            📧 Demander un devis
          </button>
        </div>
      </div>

      {/* Documents */}
      {eq.documents.length > 0 && (
        <Card className="mt-8 p-6">
          <h2 className="font-bold text-slate-900 mb-4">📄 Documents</h2>
          <div className="space-y-2">
            {eq.documents.map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                <span>📎</span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                  <div className="text-xs text-slate-600">{d.type}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quote Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-6 animate-in scale-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-4 border-b">
              <h2 className="text-xl font-bold">Demander un devis</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <QuoteRequestForm
              equipmentId={eq.id}
              equipmentName={eq.name}
              onSuccess={() => {
                setModalOpen(false)
              }}
              onClose={() => setModalOpen(false)}
              autoClose={true}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
