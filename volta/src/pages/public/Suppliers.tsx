import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui'

export default function Suppliers() {
  const { users, equipment } = useStore()
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null)
  const [searchSupplier, setSearchSupplier] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'equipment' | 'region'>('name')
  const [hoveredCriteria, setHoveredCriteria] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const carouselImages = [
    '/chargeuse hydraulique(.webp).webp',
    '/perle hydrolique(.webp).webp',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const suppliers = users.filter((u) => u.role === 'SUPPLIER')
  const regions = [...new Set(suppliers.map((s) => s.city))]

  const criteria = [
    { icon: '🔧', label: 'Mécanicien qualifié', key: 'mechanic', description: 'Certification professionnelle vérifiée' },
    { icon: '⚡', label: 'Remplacement 24h', key: 'replacement', description: 'Garantie de remplacement rapide' },
    { icon: '🏭', label: 'Entrepôt équipé', key: 'warehouse', description: 'Stock permanent de pièces' },
  ]

  let filteredSuppliers = selectedRegion
    ? suppliers.filter((s) => s.city === selectedRegion)
    : suppliers

  // Search filter
  if (searchSupplier.trim()) {
    filteredSuppliers = filteredSuppliers.filter((s) =>
      s.company.toLowerCase().includes(searchSupplier.toLowerCase())
    )
  }

  // Sort
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (sortBy === 'name') return a.company.localeCompare(b.company)
    if (sortBy === 'equipment') {
      const countA = equipment.filter((e) => e.supplierId === a.id).length
      const countB = equipment.filter((e) => e.supplierId === b.id).length
      return countB - countA
    }
    if (sortBy === 'region') return a.city.localeCompare(b.city)
    return 0
  })


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section with Image Background */}
      <section
        className="relative px-4 py-20 text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30, 30, 40, 0.85) 0%, rgba(20, 20, 30, 0.75) 100%), url('${carouselImages[0]}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            <div className="mb-6 inline-block px-4 py-2 rounded-full bg-orange-600/80 backdrop-blur-sm">
              <span className="text-sm font-semibold">🏆 VOLTA - Plateforme de mise en relation</span>
            </div>

            <h1 className="text-6xl font-bold mb-4 leading-tight">
              Mettez en relation fournisseurs et clients
            </h1>

            <p className="text-2xl text-orange-300 font-semibold mb-4">
              100% transparent · ZÉRO commission · 100% technique
            </p>

            <p className="text-lg text-slate-200 mb-8 leading-relaxed max-w-xl">
              VOLTA est une plateforme de mise en relation et d'évaluation technique. Les fournisseurs et clients négocient directement. VOLTA ne prend aucune commission - c'est une plateforme de coordination et de sécurité technique.
            </p>

            <div className="space-y-3 mb-10 text-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                <span>Mise en relation directe fournisseur-client</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <span>Inspections techniques complètes (certification)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <span>Catégories A/B/C/D/E basées sur évaluations</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <span>Aucune commission VOLTA - Tarifs directs fournisseur</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalogue"
                className="inline-block px-8 py-4 rounded-lg text-white font-bold transition transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#FF8C00' }}
              >
                Explorer nos équipements →
              </Link>
              <Link
                to="/fournisseurs"
                className="inline-block px-8 py-4 rounded-lg text-white font-bold transition transform hover:scale-105 active:scale-95 border-2 border-white hover:bg-white/10"
              >
                Nos fournisseurs
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2 transition-all rounded-full ${
                idx === currentImageIndex ? 'bg-orange-500 w-8' : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="p-8 text-center hover:shadow-lg transition transform hover:scale-105">
            <div className="text-5xl font-bold mb-3" style={{ color: '#FF8C00' }}>
              {suppliers.length}
            </div>
            <div className="text-slate-800 font-semibold text-lg">Fournisseurs actifs</div>
            <p className="text-slate-700 text-sm mt-2">Partenaires de confiance</p>
          </Card>
          <Card className="p-8 text-center hover:shadow-lg transition transform hover:scale-105">
            <div className="text-5xl font-bold mb-3" style={{ color: '#FF8C00' }}>
              {equipment.length}
            </div>
            <div className="text-slate-800 font-semibold text-lg">Équipements disponibles</div>
            <p className="text-slate-700 text-sm mt-2">Prêts à la location</p>
          </Card>
          <Card className="p-8 text-center hover:shadow-lg transition transform hover:scale-105">
            <div className="text-5xl font-bold mb-3" style={{ color: '#FF8C00' }}>
              100%
            </div>
            <div className="text-slate-800 font-semibold text-lg">Certifiés VOLTA</div>
            <p className="text-slate-700 text-sm mt-2">Vérification complète</p>
          </Card>
        </div>

        {/* Criteria Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#FF8C00' }}>
              ✓ Critères de certification VOLTA
            </h2>
            <p className="text-slate-700 max-w-2xl mx-auto">
              Tous nos fournisseurs doivent répondre à ces critères essentiels pour rejoindre notre plateforme et garantir une expérience sécurisée.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {criteria.map((crit) => (
              <div key={crit.key} onMouseEnter={() => setHoveredCriteria(crit.key)} onMouseLeave={() => setHoveredCriteria(null)}>
              <Card
                className="p-8 hover:shadow-xl transition transform hover:scale-105 cursor-pointer h-full"
              >
                <div className="text-7xl mb-4 transition transform inline-block" style={{
                  transform: hoveredCriteria === crit.key ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
                }}>
                  {crit.icon}
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: '#FF8C00' }}>
                  {crit.label}
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {hoveredCriteria === crit.key ? crit.description : (
                    <>
                      {crit.key === 'mechanic' && 'Un mécanicien certifié disponible pour maintenance et réparations urgentes.'}
                      {crit.key === 'replacement' && 'Garantie de remplacement d\'équipement en moins de 24 heures en cas de panne.'}
                      {crit.key === 'warehouse' && 'Entrepôt équipé avec pièces de rechange et outils nécessaires.'}
                    </>
                  )}
                </p>
              </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Sort Section */}
        <div className="mb-8 space-y-4">
          <div>
            <input
              type="text"
              placeholder="🔍 Chercher un fournisseur..."
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition text-lg"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Trier par:
            </label>
            {[
              { value: 'name', label: 'Nom' },
              { value: 'equipment', label: 'Équipements' },
              { value: 'region', label: 'Région' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  sortBy === option.value
                    ? 'text-white'
                    : 'text-slate-700 border border-slate-300 hover:border-orange-300'
                }`}
                style={{ backgroundColor: sortBy === option.value ? '#FF8C00' : 'transparent' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#FF8C00' }}>
            Fournisseurs par région
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion('')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedRegion === ''
                  ? 'text-white'
                  : 'text-slate-700 border border-slate-300 hover:border-orange-300'
              }`}
              style={{ backgroundColor: selectedRegion === '' ? '#FF8C00' : 'transparent' }}
            >
              Tous ({suppliers.length})
            </button>
            {regions.map((region) => {
              const count = suppliers.filter((s) => s.city === region).length
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedRegion === region
                      ? 'text-white'
                      : 'text-slate-700 border border-slate-300 hover:border-orange-300'
                  }`}
                  style={{ backgroundColor: selectedRegion === region ? '#FF8C00' : 'transparent' }}
                >
                  {region} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid gap-6">
          {sortedSuppliers.map((s) => {
            const count = equipment.filter((e) => e.supplierId === s.id && e.status !== 'INDISPONIBLE').length
            const isExpanded = expandedSupplier === s.id

            return (
              <div key={s.id} onClick={() => setExpandedSupplier(isExpanded ? null : s.id)}>
              <Card
                className="p-6 cursor-pointer transition hover:shadow-lg hover:scale-105"
              >
                {/* Main Info */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex gap-4 flex-1">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-xl font-bold text-white text-2xl shrink-0"
                      style={{ backgroundColor: '#FF8C00' }}
                    >
                      {s.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{s.company}</h3>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          ✓ Certifié
                        </span>
                      </div>
                      {/* Quick Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 mb-3">
                        <div className="text-sm">
                          <div className="text-slate-700">📍 Région</div>
                          <div className="font-semibold text-slate-800">{s.city}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-slate-700">🚜 Équipements</div>
                          <div className="font-semibold text-slate-800">{count}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-slate-700">📞 Contact</div>
                          <div className="font-semibold text-slate-800">{s.phone}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-slate-700">📧 Email</div>
                          <div className="font-semibold text-slate-800 truncate">{s.email}</div>
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          ✓ Certifié VOLTA
                        </span>
                        <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          🔧 Mécanicien
                        </span>
                        <span className="inline-block px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                          🏭 Entrepôt équipé
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to="/catalogue"
                    className="px-6 py-3 rounded-lg text-white font-bold transition transform hover:scale-105 whitespace-nowrap text-center"
                    style={{ backgroundColor: '#FF8C00' }}
                  >
                    Voir équipements →
                  </Link>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-slate-200 animate-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {criteria.map((crit) => (
                        <div
                          key={crit.key}
                          className="p-4 rounded-lg"
                          style={{ backgroundColor: '#FF8C00' + '15' }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{crit.icon}</span>
                            <h4 className="font-bold" style={{ color: '#FF8C00' }}>
                              {crit.label}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-600">
                            {crit.key === 'mechanic' && '✓ Mécanicien certifié disponible'}
                            {crit.key === 'replacement' && '✓ Garantie complète'}
                            {crit.key === 'warehouse' && '✓ Stock permanent'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Equipment Preview */}
                    {count > 0 && (
                      <div className="mt-4">
                        <h4 className="font-bold mb-3" style={{ color: '#FF8C00' }}>
                          Équipements populaires ({count} disponibles)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {equipment
                            .filter((e) => e.supplierId === s.id && e.status !== 'INDISPONIBLE')
                            .slice(0, 2)
                            .map((e) => (
                              <div key={e.id} className="p-3 rounded bg-slate-50 border border-slate-200">
                                <div className="font-semibold text-slate-800">{e.name}</div>
                                <div className="text-xs text-slate-700 mt-1">
                                  {e.brand} {e.model} • {e.year}
                                </div>
                                <div className="text-xs text-slate-600 mt-2">
                                  📊 Catégorie: {e.category || 'À définir'}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
              </div>
            )
          })}
        </div>

        {sortedSuppliers.length === 0 && (
          <Card className="p-12 text-center animate-in fade-in duration-300">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Aucun fournisseur trouvé</h3>
            <p className="text-slate-600">Essayez une autre recherche ou région</p>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl p-10 text-white cursor-pointer transition transform hover:scale-105 active:scale-95" style={{ backgroundColor: '#FF8C00' }} onClick={() => setShowModal(true)}>
          <h2 className="text-2xl font-bold mb-3">🚀 Vous êtes fournisseur ?</h2>
          <p className="mb-5 text-orange-100 max-w-2xl">
            Rejoignez le réseau VOLTA et accédez à une clientèle stable et vérifiée.
            Profitez de nos certifications reconnues, de nos inspections techniques, et restez à 100% des tarifs que vous fixez.
          </p>
          <button className="px-6 py-3 rounded-lg bg-white font-bold transition hover:scale-110 active:scale-95" style={{ color: '#FF8C00' }}>
            Demander à nous rejoindre →
          </button>
        </div>
      </div>

      {/* Modal - Join as Supplier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 animate-in scale-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                Rejoindre VOLTA
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-3xl text-slate-600 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert('Merci! Nous examinerons votre demande et vous contacterons bientôt.')
                setShowModal(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                <input type="text" placeholder="BTP Solutions" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                <input type="text" placeholder="Votre nom" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" placeholder="contact@btp.ci" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input type="tel" placeholder="+225 XX XX XX XX" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Région</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" required>
                  <option>Sélectionner une région</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-white font-bold transition hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#FF8C00' }}
              >
                📋 Soumettre ma demande
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
