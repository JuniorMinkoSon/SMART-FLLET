import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, CategoryBadge, StatusBadge } from '../../components/ui'
import QuoteRequestForm from '../../components/QuoteRequestForm'

export default function Catalogue() {
  const { equipment, categories, users } = useStore()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [quoteFormOpen, setQuoteFormOpen] = useState<string | null>(null)

  const locations = [...new Set(equipment.map((e) => e.location))]

  const filtered = equipment.filter(
    (e) =>
      (!selectedCategory || e.categoryId === selectedCategory) &&
      (!selectedLocation || e.location === selectedLocation),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-16">
      {/* Explanation Banner */}
      <Card className="mb-8 p-4 bg-blue-50 border border-blue-200">
        <div className="flex gap-4">
          <div className="text-3xl">ℹ️</div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Comment fonctionne VOLTA?</h3>
            <p className="text-sm text-slate-700">
              <strong>VOLTA est une plateforme de mise en relation.</strong> Vous trouvez l'équipement qui vous convient, vous demandez un devis directement au fournisseur. Aucune commission VOLTA - les prix et conditions sont négociés entre vous et le fournisseur. VOLTA assure uniquement la sécurité technique via inspections et certifications (Catégories A/B/C/D/E).
            </p>
          </div>
        </div>
      </Card>

      <PageTitle
        title="Catalogue d'Équipements"
        subtitle={`${filtered.length} équipement(s) disponible(s) - Catégorisés par inspections VOLTA`}
      />

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les localisations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              📍 {l}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Aucun équipement ne correspond aux filtres"
          subtitle="Essayez d'élargir vos critères de recherche."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const cat = categories.find((c) => c.id === e.categoryId)
            const supplier = users.find((u) => u.id === e.supplierId)

            return (
              <Card key={e.id} className="overflow-hidden flex flex-col transition hover:shadow-lg">
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={e.photos[0]}
                    alt={e.name}
                    className="h-full w-full object-cover"
                    onError={(img) => {
                      (img.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%2364748b%22%3EÉquipement%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{e.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {cat?.name} · {e.brand} {e.model}
                      </p>
                    </div>
                    <div className="text-2xl">{cat?.icon}</div>
                  </div>

                  {/* Category Badge - Inspection Result */}
                  {e.category && (
                    <div className="mb-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-600 mb-1">📊 Évaluation technique VOLTA</div>
                      <CategoryBadge category={e.category} />
                    </div>
                  )}
                  {!e.category && (
                    <div className="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="text-xs text-amber-700">⏳ En cours d'inspection VOLTA</div>
                    </div>
                  )}

                  {/* Status & Location */}
                  <div className="mb-2 flex flex-col gap-1">
                    <StatusBadge status={e.status} />
                    <p className="text-xs text-slate-600">📍 {e.location}</p>
                    <p className="text-xs text-slate-600">Fournisseur: {supplier?.company}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-700 mb-4 flex-1">
                    {e.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => setQuoteFormOpen(e.id)}
                    className="w-full py-2.5 rounded-lg text-white font-semibold transition transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#FF8C00' }}
                  >
                    📧 Demander un devis
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Model Explanation Section */}
      <div className="mt-16 mb-12">
        <div className="p-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-l-4" style={{ borderLeftColor: '#FF8C00' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">💡 Le modèle VOLTA expliqué</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-bold text-slate-900 mb-2">🔍 VOLTA = Inspecteur</div>
              <p className="text-slate-700">Nous inspectons chaque équipement et assignons une catégorie (A/B/C/D/E)</p>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-2">🤝 Vous négociez directement</div>
              <p className="text-slate-700">Vous contactez le fournisseur. Les prix et conditions sont entre vous</p>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-2">💰 Zéro commission</div>
              <p className="text-slate-700">VOLTA ne prend aucun fonds. Aucune commission sur les transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-slate-900">{equipment.length}</div>
          <p className="text-sm text-slate-600 mt-1">Équipements disponibles</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold" style={{ color: '#FF8C00' }}>
            {[...new Set(equipment.map(e => e.supplierId))].length}
          </div>
          <p className="text-sm text-slate-600 mt-1">Fournisseurs vérifiés</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-emerald-600">
            {equipment.filter(e => e.category).length}
          </div>
          <p className="text-sm text-slate-600 mt-1">Équipements catégorisés</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">100%</div>
          <p className="text-sm text-slate-600 mt-1">Inspection technique</p>
        </Card>
      </div>

      {/* Quote Request Modal */}
      {quoteFormOpen && (() => {
        const selectedEquipment = equipment.find((e) => e.id === quoteFormOpen)
        if (!selectedEquipment) return null

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md p-6 animate-in scale-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-4 border-b">
                <h2 className="text-xl font-bold">Demander un devis</h2>
                <button
                  onClick={() => setQuoteFormOpen(null)}
                  className="text-2xl text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Equipment Quick View */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600">Équipement sélectionné</p>
                <p className="font-semibold text-slate-900">{selectedEquipment.name}</p>
                <Link
                  to={`/equipment/${selectedEquipment.id}`}
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  Voir le produit →
                </Link>
              </div>

              {/* Quote Form */}
              <QuoteRequestForm
                equipmentId={quoteFormOpen}
                equipmentName={selectedEquipment.name}
                onSuccess={() => {
                  setQuoteFormOpen(null)
                }}
                onClose={() => setQuoteFormOpen(null)}
                autoClose={true}
              />
            </Card>
          </div>
        )
      })()}
    </div>
  )
}
