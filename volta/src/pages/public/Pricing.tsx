import { Card } from '../../components/ui'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Mise en relation gratuite
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
          VOLTA est une plateforme de mise en relation. <strong>Zéro commission VOLTA.</strong> Les tarifs sont négociés directement entre vous et le fournisseur.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        {/* Model Explanation */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Comment fonctionne VOLTA
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">VOLTA inspecte</h3>
              <p className="text-slate-700">
                Nous inspectons chaque équipement et assignons une catégorie (A/B/C/D/E) basée sur l'état technique.
              </p>
            </Card>

            <Card className="p-8">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Vous négociez</h3>
              <p className="text-slate-700">
                Contactez directement le fournisseur. Les tarifs et conditions sont convenus entre vous.
              </p>
            </Card>

            <Card className="p-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zéro commission</h3>
              <p className="text-slate-700">
                VOLTA ne prend aucun fonds. Vous gardez 100% du contrôle sur les tarifs et les négociations.
              </p>
            </Card>
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Certifications VOLTA
          </h2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-8">
            Tous nos fournisseurs sont certifiés et respectent les critères stricts de qualité VOLTA.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-8 border-l-4 border-green-600">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Mécanicien Qualifié</h3>
              <p className="text-slate-700 text-sm">
                Certification professionnelle vérifiée. Disponible pour maintenance et réparations urgentes.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-blue-600">
              <div className="text-3xl mb-4">🏭</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Entrepôt Équipé</h3>
              <p className="text-slate-700 text-sm">
                Stock permanent de pièces de rechange et outils nécessaires.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-purple-600">
              <div className="text-3xl mb-4">✓</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Certifié VOLTA</h3>
              <p className="text-slate-700 text-sm">
                Respect des normes qualité et inspections techniques complètes.
              </p>
            </Card>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Catégories d'Équipements
          </h2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mb-8">
            Basées sur inspections techniques complètes par l'équipe VOLTA.
          </p>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { cat: 'A', label: 'Excellent', color: 'emerald', desc: 'État premium' },
              { cat: 'B', label: 'Bon', color: 'blue', desc: 'Très bon état' },
              { cat: 'C', label: 'Moyen', color: 'yellow', desc: 'À surveiller' },
              { cat: 'D', label: 'Maintenance', color: 'orange', desc: 'Intervention' },
              { cat: 'E', label: 'Non conforme', color: 'red', desc: 'À éviter' },
            ].map((item) => (
              <Card key={item.cat} className={`p-6 text-center border-t-4 border-${item.color}-500`}>
                <div className="text-4xl font-bold mb-2" style={{ color: `var(--color-${item.color}-600)` }}>
                  {item.cat}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{item.label}</h4>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 border border-blue-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Support 24/7</h2>
            <p className="text-slate-700 mb-6">
              L'équipe VOLTA est disponible 24 heures sur 24, 7 jours sur 7 pour vous aider avec les inspections, les certifications, et la coordination entre fournisseurs et clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@volta.ci"
                className="px-8 py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
              >
                📧 Contacter le support
              </a>
              <a
                href="tel:+22507000001"
                className="px-8 py-3 rounded-lg border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-50 transition"
              >
                📞 Appeler maintenant
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Questions fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'VOLTA prend-elle une commission?',
                a: 'Non. VOLTA est une plateforme de mise en relation. Aucune commission n\'est prélevée. Les tarifs sont négociés directement entre client et fournisseur.',
              },
              {
                q: 'Comment fonctionnent les inspections?',
                a: 'L\'équipe technique VOLTA inspecte chaque équipement selon des critères stricts et assigne une catégorie (A/B/C/D/E). Cela garantit la sécurité technique.',
              },
              {
                q: 'Qu\'est-ce qu\'un fournisseur certifié?',
                a: 'Un fournisseur certifié a passé la vérification VOLTA et dispose de: un mécanicien qualifié, un entrepôt équipé, et une certification de qualité.',
              },
              {
                q: 'Comment contacter un fournisseur?',
                a: 'Browsez le catalogue, sélectionnez un équipement, et demandez un devis. Vous obtiendrez les informations de contact du fournisseur pour négocier directement.',
              },
              {
                q: 'Existe-t-il une assurance?',
                a: 'Les détails d\'assurance et les protections supplémentaires sont à négocier directement avec le fournisseur. VOLTA met les parties en relation.',
              },
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h4 className="font-bold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-700">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
