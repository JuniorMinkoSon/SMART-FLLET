import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { Card } from '../../components/ui'
import EquipmentCarousel from '../../components/EquipmentCarousel'

interface CounterStats {
  users: number
  equipment: number
  transactions: number
}

export default function Home() {
  const { equipment, categories } = useStore()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [expandedCriteria, setExpandedCriteria] = useState<number | null>(null)
  const [counters, setCounters] = useState<CounterStats>({ users: 0, equipment: 0, transactions: 0 })
  const [showModal, setShowModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [filteredEquipment, setFilteredEquipment] = useState<typeof equipment>([])

  // Animate counters on mount
  useEffect(() => {
    const finalStats = { users: 1200, equipment: 489, transactions: 5430 }
    const duration = 2000
    const frameRate = 30
    const steps = duration / (1000 / frameRate)
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setCounters({
        users: Math.floor(finalStats.users * progress),
        equipment: Math.floor(finalStats.equipment * progress),
        transactions: Math.floor(finalStats.transactions * progress),
      })

      if (currentStep >= steps) clearInterval(interval)
    }, 1000 / frameRate)

    return () => clearInterval(interval)
  }, [])

  // Handle search
  useEffect(() => {
    if (searchInput.trim()) {
      const filtered = equipment.filter(
        (e) =>
          e.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          e.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
          e.location.toLowerCase().includes(searchInput.toLowerCase())
      )
      setFilteredEquipment(filtered)
    } else {
      setFilteredEquipment([])
    }
  }, [searchInput, equipment])

  const published = equipment.filter((e) => e.status !== 'INDISPONIBLE')

  const criteria = [
    {
      icon: '🔧',
      title: 'Mécanicien qualifié',
      description: 'Chaque fournisseur dispose d\'un mécanicien certifié pour la maintenance et réparations urgentes sur site ou en atelier.',
      steps: ['Certification vérifiée', 'Disponibilité 24/7', 'Pièces de rechange'],
    },
    {
      icon: '⚡',
      title: 'Remplacement 24h',
      description: 'En cas de panne, un équipement de remplacement est garanti en moins de 24 heures pour minimiser vos arrêts.',
      steps: ['Diagnostic rapide', 'Remplacement immédiat', 'Suivi complet'],
    },
    {
      icon: '🏭',
      title: 'Entrepôt équipé',
      description: 'Nos fournisseurs possèdent un entrepôt avec pièces de rechange et outils nécessaires pour la maintenance.',
      steps: ['Stock permanent', 'Outils modernes', 'Logistique efficace'],
    },
  ]

  const benefits = [
    {
      icon: '✅',
      title: 'Vérification complète',
      description: 'Tous les équipements sont inspectés par notre équipe technique avant publication.',
    },
    {
      icon: '💰',
      title: 'Tarifs transparents',
      description: 'Pas de frais cachés. Prix fixes et connus à l\'avance pour votre budget.',
    },
    {
      icon: '🤝',
      title: 'Support dédié',
      description: 'Une équipe VOLTA disponible pour répondre à vos questions et résoudre les problèmes.',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero Section */}
      <section className="mt-8 rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="relative z-10">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            Trouvez le bon équipement. Au bon moment.
          </h1>
          <p className="mt-4 max-w-2xl text-blue-100 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            VOLTA est la plateforme de référence pour la location d'équipements de chantier en Côte d'Ivoire.
            Nous connectons les entreprises de construction avec des fournisseurs vérifiés et fiables.
            Tous nos partenaires sont certifiés et disposent des ressources nécessaires pour assurer votre succès.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link
              to="/catalogue"
              className="inline-block rounded-lg bg-white px-6 py-2.5 font-semibold hover:bg-blue-50 text-center transition transform hover:scale-110 active:scale-95"
              style={{ color: '#FF8C00' }}
            >
              🔍 Parcourir le catalogue
            </Link>
            <Link
              to="/fournisseurs"
              className="inline-block rounded-lg border-2 border-white px-6 py-2.5 font-semibold text-white hover:bg-blue-700 text-center transition transform hover:scale-110 active:scale-95"
            >
              🏭 Nos fournisseurs
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="inline-block rounded-lg px-6 py-2.5 font-semibold text-center transition transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: '#FF8C00', color: 'white' }}
            >
              💬 Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* Quick Search Bar */}
      <div className="mt-10 mb-10">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Chercher un équipement... (pelle, bulldozer, camion...)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-6 py-3 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition text-lg"
          />
          {searchInput && filteredEquipment.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white shadow-2xl z-50 max-h-96 overflow-y-auto">
              {filteredEquipment.slice(0, 8).map((e) => (
                <Link
                  key={e.id}
                  to={`/equipment/${e.id}`}
                  className="block px-4 py-3 hover:bg-slate-100 border-b last:border-b-0 transition"
                >
                  <div className="font-semibold text-slate-900">{e.name}</div>
                  <div className="text-xs text-slate-700 mt-1">
                    {e.brand} • {e.location}
                  </div>
                  <div className="text-sm font-bold mt-1" style={{ color: '#FF8C00' }}>
                    {'Demander un devis'} / jour
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section with Counter Animation */}
      <section className="mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-8 text-center transform transition hover:scale-110 cursor-pointer">
            <div className="text-5xl font-bold mb-2" style={{ color: '#FF8C00' }}>
              {counters.users.toLocaleString()}+
            </div>
            <div className="text-slate-600 font-medium">Utilisateurs satisfaits</div>
          </Card>
          <Card className="p-8 text-center transform transition hover:scale-110 cursor-pointer">
            <div className="text-5xl font-bold mb-2" style={{ color: '#FF8C00' }}>
              {counters.equipment.toLocaleString()}+
            </div>
            <div className="text-slate-600 font-medium">Équipements disponibles</div>
          </Card>
          <Card className="p-8 text-center transform transition hover:scale-110 cursor-pointer">
            <div className="text-5xl font-bold mb-2" style={{ color: '#FF8C00' }}>
              {counters.transactions.toLocaleString()}+
            </div>
            <div className="text-slate-600 font-medium">Locations réussies</div>
          </Card>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
            Catégories populaires
          </h2>
          <p className="mt-2 text-slate-600">
            Explorez nos différentes catégories d'équipements disponibles en location.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.id} to={`/catalogue?categorie=${c.id}`}>
              <div
                onMouseEnter={() => setHoveredCard(c.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
              <Card
                className="p-5 text-center transition hover:shadow-lg h-full flex flex-col items-center justify-center cursor-pointer transform hover:scale-110"
              >
                <div className="text-4xl mb-3 transition transform" style={{
                  transform: hoveredCard === c.id ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
                }}>
                  {c.icon}
                </div>
                <div className="text-sm font-semibold" style={{ color: hoveredCard === c.id ? '#FF8C00' : '#1F2937' }}>
                  {c.name}
                </div>
              </Card>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Technical Verification Criteria */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
            Critères de vérification technique
          </h2>
          <p className="mt-2 text-slate-600">
            Nos techniciens vérifient chaque fournisseur selon des critères stricts pour garantir votre tranquillité d'esprit.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {criteria.map((item, idx) => (
            <div key={idx} onClick={() => setExpandedCriteria(expandedCriteria === idx ? null : idx)} className="cursor-pointer">
            <Card
              className="p-6 h-full flex flex-col transition transform hover:shadow-lg hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-5xl">{item.icon}</div>
                <span style={{ color: '#FF8C00' }} className="text-2xl font-bold">
                  {idx + 1}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#FF8C00' }}>
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-3 flex-1">
                {item.description}
              </p>
              {expandedCriteria === idx && (
                <div className="mt-4 pt-4 border-t border-slate-200 animate-pulse">
                  <div className="text-xs font-semibold mb-2" style={{ color: '#FF8C00' }}>
                    Étapes de vérification:
                  </div>
                  <ul className="space-y-2">
                    {item.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="text-sm text-slate-600 flex items-center gap-2">
                        <span style={{ color: '#FF8C00' }} className="font-bold">✓</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Why VOLTA Section */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
            Pourquoi choisir VOLTA ?
          </h2>
          <p className="mt-2 text-slate-600">
            VOLTA vous offre une solution complète, transparente et sécurisée pour vos besoins en équipements.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {benefits.map((item, idx) => (
            <Card key={idx} className="p-6 h-full flex flex-col transition transform hover:shadow-lg hover:-translate-y-1">
              <div className="text-5xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#FF8C00' }}>
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Equipment Carousel Section */}
      <section className="mt-20 mb-20 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            🚜 Équipements populaires
          </h2>
          <p className="text-slate-600">
            Découvrez les équipements les plus loués. Défilez latéralement pour explorer plus d'options.
          </p>
        </div>
        <EquipmentCarousel equipment={published.slice(0, 12)} showArrows={true} />
      </section>

      {/* Call to Action - Pricing */}
      <section className="mt-16 mb-12 px-4">
        <Link to="/pricing" className="block">
          <Card className="p-12 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <h3 className="text-3xl font-bold mb-4">Découvrez nos tarifs</h3>
            <p className="text-slate-600 mb-6 max-w-2xl">
              Trois plans adaptés à tous les budgets. Commencez gratuitement ou passez premium pour plus d'avantages.
            </p>
            <div className="flex items-center gap-2 text-slate-200 font-semibold hover:gap-3 transition-all">
              Voir les tarifs
              <span>→</span>
            </div>
          </Card>
        </Link>
      </section>

      {/* Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 animate-in scale-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                Nous contacter
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-3xl text-slate-600 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert('Merci! Nous vous recontacterons bientôt.')
                setShowModal(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="votre@email.ci"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  placeholder="Votre message..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-white font-bold transition hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#FF8C00' }}
              >
                📧 Envoyer
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
